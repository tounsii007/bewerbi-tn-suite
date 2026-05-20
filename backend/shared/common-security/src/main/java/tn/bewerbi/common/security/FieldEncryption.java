package tn.bewerbi.common.security;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Iter 110 — Critical #4 (Audit).
 *
 * <p>AES-256-GCM at the application layer for individual JPA fields that
 * carry sensitive PII (phone, bio, visa appointment dates, …). Sits on
 * top of whatever encryption the database itself does — disk-level TDE
 * defends against a stolen disk; this defends against a stolen
 * database dump, a curious DBA, and an attacker who has read access to
 * the replica but not to the application's secret store.
 *
 * <p>Ciphertext format: {@code "gcm:v1:" + base64(iv ‖ ciphertext ‖ tag)}.
 * The {@code v1} version prefix lets a future migration roll keys
 * without rewriting the whole table — a {@code v2} decryptor can
 * recognize legacy rows by prefix and use the previous key for them.
 *
 * <p><b>Key configuration:</b>
 * <pre>
 *   bewerbi.security.field-encryption.key   base64-encoded 32 bytes (256-bit)
 * </pre>
 * In prod, missing/short key → application refuses to start (fail-fast).
 * In dev, a deterministic stub key is used and a loud WARN is logged —
 * deterministic so dev data survives restarts, stub so nobody confuses
 * dev data with anything resembling protected data.
 *
 * <p>The class is initialized once by {@link FieldEncryptionBootstrap}
 * at Spring startup. JPA {@link jakarta.persistence.AttributeConverter}
 * instances created later by Hibernate then call the static
 * {@link #encrypt}/{@link #decrypt} methods — that's the only way to
 * thread a runtime secret into a JPA converter without giving up
 * Spring-managed lifecycle for the converter.
 */
public final class FieldEncryption {

    private static final Logger log = LoggerFactory.getLogger(FieldEncryption.class);

    static final String VERSION_PREFIX = "gcm:v1:";
    private static final int IV_BYTES = 12;        // GCM-recommended IV size.
    private static final int TAG_BITS = 128;       // 128-bit auth tag.
    private static final String ALG = "AES";
    private static final String CIPHER = "AES/GCM/NoPadding";

    // The hex of "dev-only-bewerbi-field-encryption-key-not-prod!!" padded
    // to 32 bytes. Used only when the production profile is OFF and the
    // operator has not set bewerbi.security.field-encryption.key.
    private static final byte[] DEV_STUB_KEY = stubKey();

    private static volatile SecretKeySpec primaryKey;
    private static final SecureRandom RNG = new SecureRandom();

    private FieldEncryption() {}

    /**
     * Called once at Spring startup. Idempotent: re-initialising with
     * the same key is a no-op; switching keys at runtime is rejected
     * because every existing JPA converter would see decryption fail
     * on previously-encrypted rows.
     */
    static synchronized void init(String base64Key, boolean prodProfile) {
        byte[] keyBytes;
        if (base64Key == null || base64Key.isBlank()) {
            if (prodProfile) {
                throw new IllegalStateException(
                        "bewerbi.security.field-encryption.key is required when the prod " +
                        "Spring profile is active. Generate one with: " +
                        "openssl rand -base64 32   and inject via env-var. " +
                        "Refusing to start without it — see Iter 110 / Audit Critical #4.");
            }
            log.warn("FieldEncryption: using DEV stub key — DO NOT USE IN PRODUCTION. " +
                     "Set bewerbi.security.field-encryption.key (base64 32 bytes) for any " +
                     "non-developer environment.");
            keyBytes = DEV_STUB_KEY;
        } else {
            try {
                keyBytes = Base64.getDecoder().decode(base64Key);
            } catch (IllegalArgumentException e) {
                throw new IllegalStateException(
                        "bewerbi.security.field-encryption.key is not valid base64", e);
            }
            if (keyBytes.length != 32) {
                throw new IllegalStateException(
                        "bewerbi.security.field-encryption.key must decode to 32 bytes " +
                        "(AES-256), got " + keyBytes.length);
            }
        }
        primaryKey = new SecretKeySpec(keyBytes, ALG);
    }

    /** Encrypt a UTF-8 plaintext. {@code null} → {@code null}. */
    public static String encrypt(String plaintext) {
        if (plaintext == null) return null;
        if (primaryKey == null) {
            throw new IllegalStateException(
                    "FieldEncryption used before init() — bootstrap bean must run first");
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            RNG.nextBytes(iv);
            Cipher c = Cipher.getInstance(CIPHER);
            c.init(Cipher.ENCRYPT_MODE, primaryKey, new GCMParameterSpec(TAG_BITS, iv));
            byte[] cipherText = c.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] out = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, out, 0, iv.length);
            System.arraycopy(cipherText, 0, out, iv.length, cipherText.length);
            return VERSION_PREFIX + Base64.getEncoder().encodeToString(out);
        } catch (Exception e) {
            throw new IllegalStateException("Field encryption failed", e);
        }
    }

    /**
     * Decrypt a previously encrypted value. Values without our version
     * prefix are returned as-is — that's important during the migration
     * window where plaintext rows still exist; once a write-path encrypts
     * them, subsequent reads see the prefix and decrypt normally.
     */
    public static String decrypt(String value) {
        if (value == null) return null;
        if (!value.startsWith(VERSION_PREFIX)) {
            // Legacy plaintext row (pre-Iter-110). Pass through.
            return value;
        }
        if (primaryKey == null) {
            throw new IllegalStateException(
                    "FieldEncryption used before init() — bootstrap bean must run first");
        }
        try {
            byte[] blob = Base64.getDecoder().decode(value.substring(VERSION_PREFIX.length()));
            if (blob.length <= IV_BYTES) {
                throw new IllegalStateException("Ciphertext too short for GCM payload");
            }
            byte[] iv = new byte[IV_BYTES];
            System.arraycopy(blob, 0, iv, 0, IV_BYTES);
            byte[] ct = new byte[blob.length - IV_BYTES];
            System.arraycopy(blob, IV_BYTES, ct, 0, ct.length);
            Cipher c = Cipher.getInstance(CIPHER);
            c.init(Cipher.DECRYPT_MODE, primaryKey, new GCMParameterSpec(TAG_BITS, iv));
            return new String(c.doFinal(ct), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Field decryption failed (key rotated or row tampered with?)", e);
        }
    }

    /** Visible for tests. Reset between tests so init() can run fresh. */
    static synchronized void resetForTests() {
        primaryKey = null;
    }

    private static byte[] stubKey() {
        byte[] seed = "dev-only-bewerbi-field-encryption-key-not-prod!!".getBytes(StandardCharsets.UTF_8);
        byte[] out = new byte[32];
        // Fold the seed into 32 bytes — quick and deterministic. Not a
        // KDF; nothing about this key is intended to be secure.
        for (int i = 0; i < seed.length; i++) out[i % 32] ^= seed[i];
        return out;
    }
}
