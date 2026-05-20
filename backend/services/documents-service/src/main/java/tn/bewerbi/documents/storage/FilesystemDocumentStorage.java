package tn.bewerbi.documents.storage;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Dev / CI / single-node default. Writes blobs under
 * {@code bewerbi.upload.root}, namespaced by user-id. Identical to the
 * pre-Iter-109 behavior, just behind the {@link DocumentStorage} seam.
 *
 * <p>Selected when {@code bewerbi.documents.storage=filesystem} (the
 * default if the property is missing).
 */
@Component
@ConditionalOnProperty(name = "bewerbi.documents.storage", havingValue = "filesystem", matchIfMissing = true)
public class FilesystemDocumentStorage implements DocumentStorage {

    private final Path uploadRoot;

    public FilesystemDocumentStorage(@Value("${bewerbi.upload.root}") String uploadRoot) {
        this.uploadRoot = Path.of(uploadRoot).toAbsolutePath().normalize();
    }

    @Override
    public String store(UUID userId, UUID documentId, String filename,
                        String contentType, long size, InputStream content) throws IOException {
        Path dir = uploadRoot.resolve(userId.toString());
        Files.createDirectories(dir);
        Path target = dir.resolve(documentId + "_" + filename);
        // REPLACE_EXISTING is harmless because the documentId guarantees
        // uniqueness; it just prevents a half-written previous attempt
        // from blocking a retry.
        Files.copy(content, target, StandardCopyOption.REPLACE_EXISTING);
        return target.toString();
    }

    @Override
    public InputStream open(String storageKey) throws IOException {
        Path p = Path.of(storageKey).toAbsolutePath().normalize();
        // Path-traversal guard. The storageKey is read from our own DB,
        // so this is defense-in-depth, not a primary control.
        if (!p.startsWith(uploadRoot)) {
            throw new IOException("Refusing to open path outside upload root: " + storageKey);
        }
        return Files.newInputStream(p);
    }

    @Override
    public void delete(String storageKey) throws IOException {
        Path p = Path.of(storageKey).toAbsolutePath().normalize();
        if (!p.startsWith(uploadRoot)) {
            // Same defense as open(). Silently no-op rather than throw,
            // since callers treat delete as best-effort already.
            return;
        }
        Files.deleteIfExists(p);
    }
}
