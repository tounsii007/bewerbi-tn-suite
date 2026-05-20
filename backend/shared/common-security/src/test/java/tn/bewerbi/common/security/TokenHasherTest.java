package tn.bewerbi.common.security;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Base64;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Iter 112 — coverage for the peppered HMAC token-hasher and its
 * legacy SHA-256 compatibility path.
 */
class TokenHasherTest {

    private static final String BASE64_PEPPER =
            Base64.getEncoder().encodeToString(new byte[32]); // all-zeros, 32 bytes.

    @BeforeEach
    void setUp() {
        TokenHasher.resetForTests();
        TokenHasher.init(BASE64_PEPPER, /* prodProfile */ false);
    }

    @AfterEach
    void tearDown() {
        TokenHasher.resetForTests();
    }

    @Test
    void hashIsDeterministicAndHex64() {
        String h1 = TokenHasher.hash("refresh-token-abc");
        String h2 = TokenHasher.hash("refresh-token-abc");
        assertEquals(h1, h2);
        assertEquals(64, h1.length(),
                "must be 64 hex chars to be drop-in for plain SHA-256");
        assertTrue(h1.matches("[0-9a-f]{64}"));
    }

    @Test
    void hashDiffersFromPlainSha256() {
        // The whole point: HMAC with a pepper must not equal SHA-256
        // of the plaintext, otherwise the pepper isn't earning its
        // keep on a dump.
        String hmac = TokenHasher.hash("token");
        String plain = TokenHasher.legacySha256("token");
        assertNotEquals(hmac, plain);
    }

    @Test
    void differentTokensProduceDifferentHashes() {
        assertNotEquals(TokenHasher.hash("a"), TokenHasher.hash("b"));
    }

    @Test
    void matchesEitherAcceptsHmac() {
        String token = "fresh-token";
        String stored = TokenHasher.hash(token);
        assertTrue(TokenHasher.matchesEither(token, stored));
    }

    @Test
    void matchesEitherAcceptsLegacySha256() {
        // The migration-window scenario: a pre-Iter-112 row stored a
        // plain SHA-256 hash; verification must still succeed.
        String token = "pre-pepper-token";
        String legacy = TokenHasher.legacySha256(token);
        assertTrue(TokenHasher.matchesEither(token, legacy));
    }

    @Test
    void matchesEitherRejectsWrongToken() {
        String stored = TokenHasher.hash("real");
        assertFalse(TokenHasher.matchesEither("imposter", stored));
    }

    @Test
    void matchesEitherHandlesNullsSafely() {
        assertFalse(TokenHasher.matchesEither(null, "x"));
        assertFalse(TokenHasher.matchesEither("x", null));
        assertFalse(TokenHasher.matchesEither(null, null));
    }

    @Test
    void prodWithoutPepperFailsFast() {
        TokenHasher.resetForTests();
        var e = assertThrows(IllegalStateException.class,
                () -> TokenHasher.init("", /* prodProfile */ true));
        assertTrue(e.getMessage().contains("token-pepper"),
                "error must point operator at the right config key");
    }

    @Test
    void devWithoutPepperUsesStub() {
        TokenHasher.resetForTests();
        assertDoesNotThrow(() -> TokenHasher.init("", /* prodProfile */ false));
        // Round-trip still works with the dev stub.
        String h = TokenHasher.hash("dev-token");
        assertEquals(64, h.length());
    }

    @Test
    void shortPepperRejected() {
        TokenHasher.resetForTests();
        String tooShort = Base64.getEncoder().encodeToString(new byte[16]);
        var e = assertThrows(IllegalStateException.class,
                () -> TokenHasher.init(tooShort, /* prodProfile */ false));
        assertTrue(e.getMessage().contains("32 bytes"));
    }

    @Test
    void differentPeppersProduceDifferentHashes() {
        // Rotation simulation: re-init with a different pepper → same
        // token hashes differently. Confirms the pepper actually
        // contributes to the output.
        String before = TokenHasher.hash("token");
        TokenHasher.resetForTests();
        TokenHasher.init(
                Base64.getEncoder().encodeToString(new byte[]{
                        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
                        17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32}),
                false);
        String after = TokenHasher.hash("token");
        assertNotEquals(before, after);
    }
}
