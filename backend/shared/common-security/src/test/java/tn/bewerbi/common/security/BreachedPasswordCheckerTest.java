package tn.bewerbi.common.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * Unit tests for the HIBP-response parsing only — we don't hit the
 * network here. The end-to-end integration is exercised via a
 * manually-run smoke test (see RUNBOOK).
 */
class BreachedPasswordCheckerTest {

    private static final String SAMPLE_BODY = String.join("\r\n",
            "00ACCAA08EE25BB1B96E60B5BD3D75E5F90:3",
            "01330C689E5D64F660D6947A93AD634EF8A:1",
            "0123456789ABCDEF0123456789ABCDEF012:42",
            "ABCDEF1234567890ABCDEF1234567890ABC:1500000");

    @Test
    void detectsSuffixAtThreshold() {
        assertThat(BreachedPasswordChecker.containsBreachedSuffix(
                SAMPLE_BODY, "0123456789ABCDEF0123456789ABCDEF012", 10))
                .isTrue();
    }

    @Test
    void rejectsBelowThreshold() {
        assertThat(BreachedPasswordChecker.containsBreachedSuffix(
                SAMPLE_BODY, "00ACCAA08EE25BB1B96E60B5BD3D75E5F90", 10))
                .isFalse();
    }

    @Test
    void caseInsensitiveSuffix() {
        assertThat(BreachedPasswordChecker.containsBreachedSuffix(
                SAMPLE_BODY, "abcdef1234567890abcdef1234567890abc", 1))
                .isTrue();
    }

    @Test
    void unknownSuffixReturnsFalse() {
        assertThat(BreachedPasswordChecker.containsBreachedSuffix(
                SAMPLE_BODY, "FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", 1))
                .isFalse();
    }
}
