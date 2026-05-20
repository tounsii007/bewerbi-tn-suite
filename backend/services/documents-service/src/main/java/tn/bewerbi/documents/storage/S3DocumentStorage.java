package tn.bewerbi.documents.storage;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.*;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.*;

/**
 * S3-compatible blob store. Selected when
 * {@code bewerbi.documents.storage=s3}.
 *
 * <p>Why this is the prod-recommended path:
 * <ul>
 *   <li><b>Encryption at rest by the platform.</b> Every PUT goes out
 *       with either {@code AES256} (SSE-S3) or {@code aws:kms} (SSE-KMS,
 *       using {@code bewerbi.documents.s3.kms-key-id}). KMS is the
 *       right answer for regulated customers: data keys rotate per
 *       object and the customer-managed master key has an explicit
 *       rotation schedule + audit trail.</li>
 *   <li><b>TLS in transit</b> — we never construct a plain http://
 *       endpoint unless an operator deliberately overrode the endpoint
 *       URL for MinIO-on-localhost dev.</li>
 *   <li><b>Path-style addressing</b> is enabled so MinIO works without
 *       wildcard DNS for the bucket. AWS S3 accepts both forms.</li>
 *   <li><b>Idempotent delete</b> — S3 returns 204 for a missing object,
 *       so the GDPR cascade doesn't fail on already-deleted blobs.</li>
 * </ul>
 *
 * <p>Required configuration (env or yaml):
 * <pre>
 *   bewerbi.documents.storage           s3
 *   bewerbi.documents.s3.bucket         bewerbi-documents-prod
 *   bewerbi.documents.s3.region         eu-central-1
 *   bewerbi.documents.s3.endpoint       https://s3.eu-central-1.amazonaws.com  (optional; for MinIO: http://minio:9000)
 *   bewerbi.documents.s3.access-key     IAM credentials. Leave both blank
 *   bewerbi.documents.s3.secret-key     to fall back to the default
 *                                       provider chain (env, IAM role,
 *                                       ECS metadata, etc.).
 *   bewerbi.documents.s3.kms-key-id     blank → SSE-S3, set → SSE-KMS
 * </pre>
 */
@Component
@ConditionalOnProperty(name = "bewerbi.documents.storage", havingValue = "s3")
public class S3DocumentStorage implements DocumentStorage {

    private final S3Client s3;
    private final String bucket;
    private final String kmsKeyId; // null/blank → SSE-S3

    public S3DocumentStorage(S3Client s3,
                             @Value("${bewerbi.documents.s3.bucket}") String bucket,
                             @Value("${bewerbi.documents.s3.kms-key-id:}") String kmsKeyId) {
        this.s3 = s3;
        this.bucket = bucket;
        this.kmsKeyId = (kmsKeyId == null || kmsKeyId.isBlank()) ? null : kmsKeyId;
    }

    @Override
    public String store(UUID userId, UUID documentId, String filename,
                        String contentType, long size, InputStream content) throws IOException {
        // Layout: <user-id>/<doc-id>_<safe-filename>
        // This makes per-user bulk delete a single ListObjectsV2 prefix
        // followed by a DeleteObjects batch — important for the GDPR
        // cascade in S3-backed deployments.
        String key = userId + "/" + documentId + "_" + filename;

        PutObjectRequest.Builder put = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentLength(size)
                .contentType(contentType == null ? "application/octet-stream" : contentType);

        if (kmsKeyId != null) {
            put.serverSideEncryption(ServerSideEncryption.AWS_KMS)
               .ssekmsKeyId(kmsKeyId);
        } else {
            put.serverSideEncryption(ServerSideEncryption.AES256);
        }

        try {
            s3.putObject(put.build(), RequestBody.fromInputStream(content, size));
        } catch (S3Exception e) {
            throw new IOException("S3 putObject failed for " + key, e);
        }
        return key;
    }

    @Override
    public InputStream open(String storageKey) throws IOException {
        try {
            return s3.getObject(GetObjectRequest.builder()
                    .bucket(bucket).key(storageKey).build());
        } catch (NoSuchKeyException e) {
            throw new IOException("Document blob missing in S3: " + storageKey, e);
        } catch (S3Exception e) {
            throw new IOException("S3 getObject failed for " + storageKey, e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            s3.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucket).key(storageKey).build());
        } catch (S3Exception ignored) {
            // S3 returns 204 even for missing keys; the only realistic
            // failure here is a transient network error. Best-effort by
            // contract (see DocumentStorage.delete javadoc).
        }
    }

    /**
     * S3 client wiring. Kept in the same file as the implementation it
     * supports so the conditional flag (`storage=s3`) covers both the
     * implementation and its client; if S3 isn't enabled, none of the
     * AWS classes are eagerly loaded.
     */
    @Configuration
    @ConditionalOnProperty(name = "bewerbi.documents.storage", havingValue = "s3")
    static class S3Cfg {
        @Bean
        S3Client s3Client(
                @Value("${bewerbi.documents.s3.region}") String region,
                @Value("${bewerbi.documents.s3.endpoint:}") String endpoint,
                @Value("${bewerbi.documents.s3.access-key:}") String accessKey,
                @Value("${bewerbi.documents.s3.secret-key:}") String secretKey) {

            var builder = S3Client.builder()
                    .region(Region.of(region))
                    // URL-connection client is enough for blob put/get
                    // and avoids dragging Netty into the dependency tree.
                    .httpClient(UrlConnectionHttpClient.builder().build())
                    // Path-style — required for MinIO, harmless on AWS.
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true).build());

            if (accessKey != null && !accessKey.isBlank()
                    && secretKey != null && !secretKey.isBlank()) {
                builder.credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)));
            } else {
                // Fall back to AWS default chain (IRSA, ECS task role,
                // env vars, ~/.aws/credentials, …). In a properly
                // configured EKS / ECS deployment this is what runs.
                builder.credentialsProvider(DefaultCredentialsProvider.create());
            }

            if (endpoint != null && !endpoint.isBlank()) {
                builder.endpointOverride(URI.create(endpoint));
            }
            return builder.build();
        }
    }
}
