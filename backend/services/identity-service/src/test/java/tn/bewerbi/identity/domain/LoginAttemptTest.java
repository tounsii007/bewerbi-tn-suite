package tn.bewerbi.identity.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Iter 195 — pure-unit tests for {@link LoginAttempt}'s factories +
 * the GDPR anonymise helper. No DB, no Spring — just constructor +
 * setter contracts.
 */
class LoginAttemptTest {

    private static final UUID UID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    private static final String EMAIL = "user@example.tn";
    private static final String IP = "203.0.113.42";
    private static final String UA = "Mozilla/5.0";

    @Test
    void success_factoryProducesSuccessRow_withoutFailureReason() {
        var attempt = LoginAttempt.success(UID, EMAIL, LoginMethod.PASSWORD, IP, UA);

        assertThat(attempt.getUserId()).isEqualTo(UID);
        assertThat(attempt.getEmail()).isEqualTo(EMAIL);
        assertThat(attempt.getMethod()).isEqualTo(LoginMethod.PASSWORD);
        assertThat(attempt.isSuccess()).isTrue();
        // Successful attempts never carry a failure-reason — the field
        // is meant to be queryable enum-like values, not "OK" sentinel.
        assertThat(attempt.getFailureReason()).isNull();
        assertThat(attempt.getIp()).isEqualTo(IP);
        assertThat(attempt.getUserAgent()).isEqualTo(UA);
        assertThat(attempt.getOccurredAt())
                .isCloseTo(Instant.now(), within(5_000));
    }

    @Test
    void failure_factoryProducesFailureRow_withReason() {
        var attempt = LoginAttempt.failure(UID, EMAIL, LoginMethod.GOOGLE,
                "OAUTH_TOKEN_INVALID", IP, UA);

        assertThat(attempt.isSuccess()).isFalse();
        assertThat(attempt.getFailureReason()).isEqualTo("OAUTH_TOKEN_INVALID");
        assertThat(attempt.getMethod()).isEqualTo(LoginMethod.GOOGLE);
    }

    @Test
    void failure_acceptsNullUserId_forUnknownEmailProbes() {
        // Failed login for an email that doesn't resolve to any user
        // (brute-force / credential-stuffing probe) — userId is null
        // but the row still records the email + IP for ops analytics.
        var attempt = LoginAttempt.failure(null, "stranger@example.tn",
                LoginMethod.PASSWORD, "USER_NOT_FOUND", IP, UA);

        assertThat(attempt.getUserId()).isNull();
        assertThat(attempt.getEmail()).isEqualTo("stranger@example.tn");
        assertThat(attempt.getFailureReason()).isEqualTo("USER_NOT_FOUND");
    }

    @Test
    void userAgent_truncatedAt500Chars() {
        // The DB column is varchar(500); some UAs (especially weird
        // proxy-injected headers) exceed that. Verify the constructor
        // truncates rather than throwing at JPA flush time.
        String huge = "M".repeat(700);
        var attempt = LoginAttempt.success(UID, EMAIL, LoginMethod.PASSWORD, IP, huge);

        assertThat(attempt.getUserAgent()).hasSize(500);
        assertThat(attempt.getUserAgent()).startsWith("MMM");
    }

    @Test
    void ip_truncatedAt64Chars() {
        // X-Forwarded-For can contain a comma-separated chain of IPs;
        // our caller takes the first one but defensively the constructor
        // truncates too.
        String huge = "1.1.1.1, ".repeat(20);
        var attempt = LoginAttempt.success(UID, EMAIL, LoginMethod.PASSWORD, huge, UA);

        assertThat(attempt.getIp()).hasSize(64);
    }

    @Test
    void anonymiseOnUserDeletion_clearsUserIdAndUserAgent_butNotMethodOrIp() {
        var attempt = LoginAttempt.success(UID, EMAIL, LoginMethod.GOOGLE, IP, UA);

        attempt.anonymiseOnUserDeletion();

        // GDPR: identity-linking fields nulled out, but ops-relevant
        // fields (method, IP, success, time) kept — the row stays
        // queryable for security forensics on failed-login patterns.
        assertThat(attempt.getUserId()).isNull();
        assertThat(attempt.getEmail()).isEqualTo("[deleted]");
        assertThat(attempt.getUserAgent()).isNull();
        // Preserved:
        assertThat(attempt.getMethod()).isEqualTo(LoginMethod.GOOGLE);
        assertThat(attempt.getIp()).isEqualTo(IP);
        assertThat(attempt.isSuccess()).isTrue();
        assertThat(attempt.getOccurredAt()).isNotNull();
    }

    /** AssertJ tolerance for "the constructor recorded ~now". 5s
     *  covers slow CI runners; we just want "within the same minute". */
    private static org.assertj.core.data.TemporalUnitOffset within(long millis) {
        return new org.assertj.core.data.TemporalUnitWithinOffset(
                millis, java.time.temporal.ChronoUnit.MILLIS);
    }
}
