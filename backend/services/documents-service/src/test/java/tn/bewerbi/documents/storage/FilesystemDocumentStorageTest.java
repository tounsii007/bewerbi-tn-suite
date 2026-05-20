package tn.bewerbi.documents.storage;

import static org.junit.jupiter.api.Assertions.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Round-trip + safety contract for the FS storage backend. The S3 path
 * is exercised in integration tests against a MinIO Testcontainer
 * (out-of-scope here — no Docker available in unit-test runs).
 */
class FilesystemDocumentStorageTest {

    @Test
    void storeOpenDeleteRoundTrip(@TempDir Path root) throws IOException {
        var storage = new FilesystemDocumentStorage(root.toString());
        var userId = UUID.randomUUID();
        var docId = UUID.randomUUID();
        byte[] payload = "Hello, audit.".getBytes();

        String key = storage.store(userId, docId, "cv.pdf", "application/pdf",
                payload.length, new ByteArrayInputStream(payload));

        // Key is the absolute path to the just-written file.
        assertTrue(Files.exists(Path.of(key)));
        assertEquals("Hello, audit.", new String(storage.open(key).readAllBytes()));

        storage.delete(key);
        assertFalse(Files.exists(Path.of(key)));

        // Second delete must be a no-op, per the interface contract.
        assertDoesNotThrow(() -> storage.delete(key));
    }

    @Test
    void openRefusesPathOutsideRoot(@TempDir Path root) throws IOException {
        var storage = new FilesystemDocumentStorage(root.toString());
        // ../etc/passwd-style escape attempts must be rejected even
        // though the storageKey in production is read from our own DB —
        // defence in depth against a poisoned row.
        var outside = root.getParent().resolve("escape.txt");
        Files.writeString(outside, "secret");
        try {
            assertThrows(IOException.class, () -> storage.open(outside.toString()));
        } finally {
            Files.deleteIfExists(outside);
        }
    }

    @Test
    void deleteSilentlyIgnoresPathOutsideRoot(@TempDir Path root) throws IOException {
        var storage = new FilesystemDocumentStorage(root.toString());
        var outside = root.getParent().resolve("dontTouchMe.txt");
        Files.writeString(outside, "leave me alone");
        try {
            // Best-effort by contract — must not throw, must not delete.
            assertDoesNotThrow(() -> storage.delete(outside.toString()));
            assertTrue(Files.exists(outside),
                    "delete must refuse to follow a path outside the upload root");
        } finally {
            Files.deleteIfExists(outside);
        }
    }
}
