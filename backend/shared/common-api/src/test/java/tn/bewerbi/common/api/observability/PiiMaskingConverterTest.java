package tn.bewerbi.common.api.observability;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Lightweight parity tests for the log masker. These are the cases that
 * actually occur in production code paths (user-not-found messages, refresh
 * controller errors, authorization headers leaking into stack traces).
 */
class PiiMaskingConverterTest {

    @Test
    void masksEmail() {
        assertThat(PiiMaskingConverter.mask("User ahmed@example.tn not found"))
                .isEqualTo("User a***@example.tn not found");
    }

    @Test
    void masksBearer() {
        assertThat(PiiMaskingConverter.mask(
                "Auth: Bearer eyJhbGciOiJIUzI1NiJ9.payload.sig"))
                .isEqualTo("Auth: Bearer ***");
    }

    @Test
    void masksBareJwt() {
        assertThat(PiiMaskingConverter.mask(
                "token=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signaturepart"))
                .contains("***")
                .doesNotContain("eyJzdWIiOiIxIn0");
    }

    @Test
    void masksLongHexToken() {
        String token = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";
        assertThat(PiiMaskingConverter.mask("reset token " + token))
                .isEqualTo("reset token a1b2***");
    }

    @Test
    void leavesShortHexUnchanged() {
        assertThat(PiiMaskingConverter.mask("trace=abcd1234"))
                .isEqualTo("trace=abcd1234");
    }

    @Test
    void nullSafeAndEmpty() {
        assertThat(PiiMaskingConverter.mask(null)).isNull();
        assertThat(PiiMaskingConverter.mask("")).isEmpty();
    }
}
