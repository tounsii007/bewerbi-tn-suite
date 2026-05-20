package tn.bewerbi.documents.storage;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

/**
 * Iter 109 — Critical #3 (Audit).
 *
 * <p>Abstraction over the physical store for document blobs. Behind this
 * interface sits either:
 * <ul>
 *   <li>{@link FilesystemDocumentStorage} — the original local-filesystem
 *       implementation. Default in dev and CI; the upload root stays on
 *       the volume that backs the container.</li>
 *   <li>{@link S3DocumentStorage} — AWS S3 / MinIO / any other v4-sig
 *       compatible object store, with server-side encryption (SSE-S3 or
 *       SSE-KMS) and TLS in transit.</li>
 * </ul>
 *
 * <p>Why the abstraction matters for the audit: CVs, passport scans, and
 * birth certificates are personal data of the worst kind — they identify
 * the user offline. Storing them as plain files on the documents-service
 * volume meant:
 * <ol>
 *   <li>No encryption at rest unless the operator configured LUKS / dm-
 *       crypt on the host, which is invisible to the app and impossible
 *       to assert in a security questionnaire.</li>
 *   <li>No key rotation story.</li>
 *   <li>Container restarts wipe blobs if the volume isn't mounted.</li>
 *   <li>No audit trail of who downloaded what — the disk is just bytes.</li>
 * </ol>
 *
 * <p>SSE-KMS solves (1) and (2) (rotated per-object data keys wrapped by
 * a customer-managed master key); the bucket access log solves (4); and
 * the bucket itself is the durable store, so (3) goes away. The dev FS
 * implementation keeps local work zero-config.
 *
 * <p>The interface intentionally returns/accepts opaque {@code storageKey}
 * strings: in FS mode that's an absolute path; in S3 mode it's the
 * object key (without bucket). Callers (DocService) treat it as a token
 * and persist it on the {@code documents} row unchanged.
 */
public interface DocumentStorage {

    /**
     * Persist the blob. Implementations are expected to consume the
     * full stream and close it afterwards. The returned storage key is
     * what gets written to {@code documents.storage_path}.
     *
     * @param userId      owning user; used to namespace the storage layout
     * @param documentId  primary key of the documents row, used to
     *                    disambiguate two files with the same name from
     *                    the same user
     * @param filename    sanitized original filename (only used for
     *                    presentation / content-disposition; the key
     *                    is built from documentId so collisions are
     *                    impossible)
     * @param contentType MIME, may be null
     * @param size        bytes; used by S3 implementations that need
     *                    the length up front for the PUT request
     */
    String store(UUID userId, UUID documentId, String filename,
                 String contentType, long size, InputStream content) throws IOException;

    /** Open the blob for reading (PDF parsing, future download endpoint). */
    InputStream open(String storageKey) throws IOException;

    /**
     * Hard-delete the blob. MUST succeed silently if the object is
     * already gone — callers (GDPR cascade, user-initiated delete) rely
     * on idempotency.
     */
    void delete(String storageKey) throws IOException;
}
