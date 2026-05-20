package tn.bewerbi.common.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Iter 112 — Audit follow-up.
 *
 * <p>Single chokepoint for hashing the things we don't want to store
 * in plaintext: refresh-token fingerprints in Redis, password-reset and
 * email-verification tokens in Postgres, KnownDevice (IP/UA) fingerprints.
 *
 * <p>Before this class existed each call-site called {@code MessageDigest
 * .getInstance("SHA-256").digest(token.getBytes())} directly. SHA-256 of
 * a high-entropy random token isn't crackable in practice, but it's a
 * single-pass fast hash — meaning a Redis or DB dump exposes the
 * fingerprint domain to anyone with the dump alone. Switching to HMAC-
 * SHA-256 keyed by a server-side pepper means even a perfect dump is
 * useless without the pepper, which lives in the env / KMS / secrets
 * manager — never in the data store.
 *
 * <p>Output format: lowercase hex of HMAC-SHA-256, identical width (64
 * chars) to the previous plain SHA-256 output. That keeps the on-the-
 * wire shape of refresh-token "hashes" the same — session-listing UIs
 * and DELETE /sessions/{hash} keep working.
 *
 * <p>Migration safety: {@link #matchesEither(String, String)} compares
 * a token against a stored hash using both the new HMAC and the legacy
 * SHA-256 algorithms, so existing Redis / DB rows written before the
 * pepper rolls keep validating until they naturally expire / rotate.
 *
 * <p>Configuration:
 * <pre>
 *   bewerbi.security.token-pepper   base64-encoded 32+ bytes
 * </pre>
 * In prod, missing → application refuses to start (fail-fast). In dev,
 * a deterministic stub pepper is used and a loud WARN is logged.
 */
public final class TokenHasher {

    private static final Logger log = LoggerFactory.getLogger(TokenHasher.class);
    private static final String HMAC_ALG = "HmacSHA256";

    private static volatile SecretKeySpec pepper;

    private TokenHasher() {}

    /**
     * Bootstrap entry point — called by {@link TokenHasherBootstrap}
     * once at startup. Idempotent for the same pepper; rejecting a
     * different pepper at runtime would silently invalidate every
     * existing hash, so we don't try to swap.
     */
    static synchronized void init(String base64Pepper, boolean prodProfile) {
        byte[] bytes;
        if (base64Pepper == null || base64Pepper.isBlank()) {
            if (prodProfile) {
                throw new IllegalStateException(
                        "bewerbi.security.token-pepper is required when the prod " +
                        "Spring profile is active. Generate one with: " +
                        "openssl rand -base64 32   and inject via env-var " +
                        "TOKEN_PEPPER. Refusing to start — see Iter 112.");
            }
            log.warn("TokenHasher: using DEV stub pepper — DO NOT USE IN PRODUCTION. " +
                     "Set bewerbi.security.token-pepper (base64 32+ bytes) for any " +
                     "non-developer environment.");
            bytes = "dev-only-bewerbi-token-pepper-not-prod!!!!"
                    .getBytes(StandardCharsets.UTF_8);
        } else {
            try {
                bytes = java.util.Base64.getDecoder().decode(base64Pepper);
            } catch (IllegalArgumentException e) {
                throw new IllegalStateException(
                        "bewerbi.security.token-pepper is not valid base64", e);
            }
            if (bytes.length < 32) {
                throw new IllegalStateException(
                        "bewerbi.security.token-pepper must decode to at least 32 bytes, " +
                        "got " + bytes.length);
            }
        }
        pepper = new SecretKeySpec(bytes, HMAC_ALG);
    }

    /**
     * HMAC-SHA-256 of the token, returned as 64 lowercase hex chars.
     * This is the canonical post-Iter-112 form; new writes use this
     * exclusively.
     */
    public static String hash(String token) {
        if (pepper == null) {
            throw new IllegalStateException(
                    "TokenHasher used before init() — bootstrap bean must run first");
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALG);
            mac.init(pepper);
            byte[] out = mac.doFinal(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(out);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC failed", e);
        }
    }

    /**
     * Legacy hashing function — kept for the migration window so that
     * pre-Iter-112 rows still verify. Constant-time so probing this
     * doesn't leak whether a stored hash is "new format" vs "legacy".
     */
    public static String legacySha256(String token) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(
                    md.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    /**
     * Constant-time check: does {@code token} hash to {@code stored}
     * under either the new HMAC or the legacy SHA-256? Use this on
     * verification paths (refresh-token lookup, password-reset claim,
     * etc.) — never plain string equals, which leaks timing.
     */
    public static boolean matchesEither(String token, String stored) {
        if (token == null || stored == null) return false;
        boolean newOk = constantTimeEquals(hash(token), stored);
        boolean oldOk = constantTimeEquals(legacySha256(token), stored);
        return newOk || oldOk;
    }

    private static boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int diff = 0;
        for (int i = 0; i < a.length(); i++) diff |= a.charAt(i) ^ b.charAt(i);
        return diff == 0;
    }

    /** Visible for tests. */
    static synchronized void resetForTests() {
        pepper = null;
    }
}
