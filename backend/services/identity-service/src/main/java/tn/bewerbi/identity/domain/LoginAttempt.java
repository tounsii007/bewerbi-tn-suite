package tn.bewerbi.identity.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * Iter 159 — persisted login-history record.
 *
 * <p>Every login attempt — successful or failed, from any method — gets a
 * row in this table. Complements the Kafka audit stream (which is meant
 * for analytics + downstream services) with a queryable per-user history
 * the user themselves + ops can read directly from Postgres.
 *
 * <h2>GDPR notes</h2>
 * <ul>
 *   <li>`user_id` is a FK to users with {@code ON DELETE SET NULL} — when
 *       a user exercises right-to-erasure the link is cleared but the
 *       row survives. (Failed-login records for stolen-credential
 *       protection survive past account deletion for short window.)</li>
 *   <li>The {@code email} column is denormalised so failed logins for
 *       non-existent emails are still recorded (without polluting
 *       users-table integrity). Email retention for deleted users should
 *       be handled by a retention job — see Iter 161.</li>
 * </ul>
 */
@Entity
@Table(name = "login_attempts")
public class LoginAttempt {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    /** FK to users.id. Nullable — set when the email is unknown (failed
     *  brute-force probe) or after the user is deleted via GDPR. */
    @Column(name = "user_id", columnDefinition = "uuid")
    private UUID userId;

    /** Always recorded — even for unknown-email probes. Lowercased. */
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 16)
    private LoginMethod method;

    @Column(name = "success", nullable = false)
    private boolean success;

    /**
     * Short failure code — never leak the actual user-facing message,
     * keep this enum-like so dashboards can group by it.
     * Examples: {@code USER_NOT_FOUND}, {@code INVALID_PASSWORD},
     * {@code RATE_LIMITED_ACCOUNT}, {@code RATE_LIMITED_IP},
     * {@code EMAIL_UNVERIFIED}, {@code OAUTH_TOKEN_INVALID},
     * {@code OAUTH_EMAIL_MISMATCH}.
     */
    @Column(name = "failure_reason", length = 60)
    private String failureReason;

    @Column(name = "ip", length = 64)
    private String ip;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected LoginAttempt() {}

    private LoginAttempt(UUID userId, String email, LoginMethod method, boolean success,
                         String failureReason, String ip, String userAgent) {
        this.id = UUID.randomUUID();
        this.userId = userId;
        this.email = email == null ? "" : email.trim().toLowerCase();
        this.method = method;
        this.success = success;
        this.failureReason = failureReason;
        this.ip = truncate(ip, 64);
        this.userAgent = truncate(userAgent, 500);
        this.occurredAt = Instant.now();
    }

    public static LoginAttempt success(UUID userId, String email, LoginMethod method,
                                       String ip, String userAgent) {
        return new LoginAttempt(userId, email, method, true, null, ip, userAgent);
    }

    public static LoginAttempt failure(UUID userId, String email, LoginMethod method,
                                       String reason, String ip, String userAgent) {
        return new LoginAttempt(userId, email, method, false, reason, ip, userAgent);
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getEmail() { return email; }
    public LoginMethod getMethod() { return method; }
    public boolean isSuccess() { return success; }
    public String getFailureReason() { return failureReason; }
    public String getIp() { return ip; }
    public String getUserAgent() { return userAgent; }
    public Instant getOccurredAt() { return occurredAt; }

    /** Iter 159 — GDPR: anonymise this row when its user is deleted. */
    public void anonymiseOnUserDeletion() {
        this.userId = null;
        this.email = "[deleted]";
        this.userAgent = null;
    }
}
