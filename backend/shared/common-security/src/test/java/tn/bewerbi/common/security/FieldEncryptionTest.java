package tn.bewerbi.common.security;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDate;
import java.util.Base64;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Iter 110 — covers the FieldEncryption helper + both AttributeConverters
 * (the static helper is what the converters delegate to, so testing it
 * gives full coverage without a real Hibernate context).
 */
class FieldEncryptionTest {

    private static final String BASE64_KEY =
            Base64.getEncoder().encodeToString(new byte[32]); // all-zeros, valid 256-bit.

    @BeforeEach
    void setUp() {
        FieldEncryption.resetForTests();
        FieldEncryption.init(BASE64_KEY, /* prodProfile */ false);
    }

    @AfterEach
    void tearDown() {
        FieldEncryption.resetForTests();
    }

    @Test
    void encryptDecryptRoundTrip() {
        String plaintext = "+49 30 1234567";
        String ct = FieldEncryption.encrypt(plaintext);

        assertNotEquals(plaintext, ct);
        assertTrue(ct.startsWith("gcm:v1:"), "ciphertext must carry version prefix");
        assertEquals(plaintext, FieldEncryption.decrypt(ct));
    }

    @Test
    void encryptionIsNonDeterministic() {
        // Distinct random IV per call → same plaintext encrypts to
        // distinct ciphertext. Important: SQL queries on the encrypted
        // column won't match on plaintext, but they also can't be used
        // to fingerprint repeated values (a known weakness of
        // deterministic schemes).
        String a = FieldEncryption.encrypt("same");
        String b = FieldEncryption.encrypt("same");
        assertNotEquals(a, b);
        assertEquals("same", FieldEncryption.decrypt(a));
        assertEquals("same", FieldEncryption.decrypt(b));
    }

    @Test
    void nullPassesThrough() {
        assertNull(FieldEncryption.encrypt(null));
        assertNull(FieldEncryption.decrypt(null));
    }

    @Test
    void plaintextLegacyRowsPassThroughDecryptUnchanged() {
        // The decryptor must tolerate pre-Iter-110 rows that don't
        // carry the version prefix yet, otherwise the migration window
        // breaks all reads.
        assertEquals("legacy", FieldEncryption.decrypt("legacy"));
    }

    @Test
    void tamperedCiphertextIsRejected() {
        String ct = FieldEncryption.encrypt("sensitive");
        // Flip a single base64 character — GCM auth tag must fail.
        String tampered = ct.substring(0, ct.length() - 2)
                + (ct.charAt(ct.length() - 2) == 'A' ? 'B' : 'A')
                + ct.charAt(ct.length() - 1);
        assertThrows(IllegalStateException.class, () -> FieldEncryption.decrypt(tampered));
    }

    @Test
    void prodWithoutKeyFailsFast() {
        FieldEncryption.resetForTests();
        var e = assertThrows(IllegalStateException.class,
                () -> FieldEncryption.init("", /* prodProfile */ true));
        assertTrue(e.getMessage().contains("field-encryption.key"),
                "error must point operator at the right config key");
    }

    @Test
    void devWithoutKeyUsesStubKey() {
        FieldEncryption.resetForTests();
        // Dev profile + empty key must NOT throw — falls back to the
        // deterministic stub key so local devs aren't blocked.
        assertDoesNotThrow(() -> FieldEncryption.init("", /* prodProfile */ false));
        // And the stub key actually works for round-tripping.
        String ct = FieldEncryption.encrypt("hello");
        assertEquals("hello", FieldEncryption.decrypt(ct));
    }

    @Test
    void wrongKeyLengthRejected() {
        FieldEncryption.resetForTests();
        String shortKey = Base64.getEncoder().encodeToString(new byte[16]); // 128-bit, not 256.
        var e = assertThrows(IllegalStateException.class,
                () -> FieldEncryption.init(shortKey, /* prodProfile */ false));
        assertTrue(e.getMessage().contains("32 bytes"));
    }

    @Test
    void stringConverter() {
        var c = new EncryptedStringConverter();
        String ct = c.convertToDatabaseColumn("hello");
        assertTrue(ct.startsWith("gcm:v1:"));
        assertEquals("hello", c.convertToEntityAttribute(ct));
        assertNull(c.convertToDatabaseColumn(null));
        assertNull(c.convertToEntityAttribute(null));
    }

    @Test
    void localDateConverterRoundTrip() {
        var c = new EncryptedLocalDateConverter();
        var d = LocalDate.of(2026, 6, 15);
        String ct = c.convertToDatabaseColumn(d);
        assertTrue(ct.startsWith("gcm:v1:"));
        assertEquals(d, c.convertToEntityAttribute(ct));
    }

    @Test
    void localDateConverterPassesThroughLegacyIsoString() {
        var c = new EncryptedLocalDateConverter();
        // Post-V2-migration legacy rows are ISO date strings written by
        // the Flyway USING clause. They must decrypt-then-parse cleanly.
        assertEquals(LocalDate.of(2026, 6, 15), c.convertToEntityAttribute("2026-06-15"));
    }

    @Test
    void localDateConverterRejectsGarbage() {
        var c = new EncryptedLocalDateConverter();
        assertThrows(IllegalStateException.class,
                () -> c.convertToEntityAttribute("not-a-date"));
    }
}
