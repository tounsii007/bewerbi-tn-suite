package tn.bewerbi.common.events;

import java.time.Instant;
import java.util.UUID;

/**
 * Event envelopes published on Kafka. Each one is an immutable record so
 * services can safely share the type without accidental mutation.
 */
public final class DomainEvents {
    private DomainEvents() {}

    public record UserRegistered(
            UUID userId, String email, String firstName, String role,
            String preferredLocale,
            /** One-time token the recipient uses to activate the account. */
            String verificationToken,
            Instant occurredAt) {}

    public record ApplicationCreated(
            UUID applicationId, UUID jobId, UUID applicantUserId,
            Instant occurredAt) {}

    public record CompanyVerified(
            UUID companyId, String name, String slug, Instant occurredAt) {}

    public record JobPublished(
            UUID jobId, UUID companyId, String title, String category, String type,
            String location, Instant occurredAt) {}

    /**
     * Carries the *plain* one-time reset token so notification-service can
     * embed it in the reset link. The plain value never leaves Kafka — the
     * stored copy in {@code users.password_reset_token_hash} is SHA-256, so
     * even a DB dump cannot reset accounts.
     */
    public record PasswordResetRequested(
            UUID userId, String email, String firstName, String preferredLocale,
            String resetToken, Instant expiresAt, Instant occurredAt) {}

    /**
     * Successful login from a previously-unseen IP+UA combination. The
     * mail is purely informational — by the time it arrives the user is
     * already signed in. We include enough device + network detail that
     * a recipient who *didn't* trigger this login can immediately
     * recognise the anomaly and head to /settings to revoke the session.
     */
    public record NewDeviceSignIn(
            UUID userId, String email, String firstName, String preferredLocale,
            String ip, String userAgent, Instant occurredAt) {}
}
