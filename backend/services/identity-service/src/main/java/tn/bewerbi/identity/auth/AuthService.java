package tn.bewerbi.identity.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.bewerbi.common.api.exception.ConflictException;
import tn.bewerbi.common.api.exception.ResourceNotFoundException;
import tn.bewerbi.common.api.exception.TooManyRequestsException;
import tn.bewerbi.common.events.DomainEvents;
import tn.bewerbi.common.events.EventPublisher;
import tn.bewerbi.common.api.exception.UnprocessableEntityException;
import tn.bewerbi.common.events.Topics;
import tn.bewerbi.common.i18n.LocaleContext;
import tn.bewerbi.common.security.PasswordStrength;
import tn.bewerbi.common.security.audit.AuditEvent;
import tn.bewerbi.common.security.audit.AuditLogger;
import tn.bewerbi.common.security.audit.LoginAttemptTracker;
import tn.bewerbi.identity.domain.*;

@Service
@Transactional
public class AuthService {

    private static final SecureRandom RND = new SecureRandom();
    // bcrypt hash of an empty string — used in equal-time login flow to neutralise
    // the latency difference between "user missing" and "wrong password".
    private static final String DUMMY_HASH =
            "$2a$10$YQv5xKLh2VJxk0CGqDqPNeOZ/g5JqV3KqMOd0YkUkqfn5cQyqaQR2";

    private final UserRepository users;
    private final ProfileRepository profiles;
    private final PasswordEncoder passwords;
    private final JwtTokenService tokens;
    private final EventPublisher events;
    private final RefreshTokenStore refreshStore;
    private final LoginAttemptTracker attempts;
    private final AuditLogger audit;

    public AuthService(UserRepository users, ProfileRepository profiles,
                       PasswordEncoder passwords, JwtTokenService tokens,
                       EventPublisher events, RefreshTokenStore refreshStore,
                       ObjectProvider<LoginAttemptTracker> attemptsProvider,
                       ObjectProvider<AuditLogger> auditProvider) {
        this.users = users; this.profiles = profiles;
        this.passwords = passwords; this.tokens = tokens;
        this.events = events;
        this.refreshStore = refreshStore;
        // Optional: in unit tests without Redis these beans are absent.
        this.attempts = attemptsProvider.getIfAvailable();
        this.audit = auditProvider.getIfAvailable();
    }

    public AuthResponse register(RegisterRequest req) {
        rejectWeakPassword(req.password());
        if (users.existsByEmail(req.email().toLowerCase())) {
            throw new ConflictException("Email already registered", "error.auth.email.exists");
        }
        var user = new User(req.email().toLowerCase(), passwords.encode(req.password()), req.role());
        user.setPreferredLocale(LocaleContext.currentTag());

        // Same hashing pattern as password-reset: send the plain token in the
        // welcome email (via Kafka), persist only its SHA-256, so a DB dump
        // does not let an attacker verify arbitrary accounts.
        String plainVerification = randomToken();
        user.setEmailVerification(sha256(plainVerification),
                Instant.now().plus(48, ChronoUnit.HOURS));
        users.save(user);

        var profile = new Profile(user.getId());
        profile.setFirstName(req.firstName());
        profile.setLastName(req.lastName());
        profile.setCountry("Tunesien");
        profiles.save(profile);

        // Send the *plain* token in the event so notification-service can
        // embed it in the link. The persisted copy (set above) is the hash.
        events.publish(Topics.USER_REGISTERED, user.getId().toString(),
                new DomainEvents.UserRegistered(
                        user.getId(),
                        user.getEmail(),
                        req.firstName(),
                        user.getRole().name(),
                        user.getPreferredLocale(),
                        plainVerification,
                        Instant.now()));

        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_REGISTER",
                    user.getId().toString(), user.getEmail()));
        }

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().toLowerCase();

        // Per-account lockout — short-circuit before touching the DB / bcrypt.
        if (attempts != null && attempts.isLockedOut(email)) {
            long retryAfter = attempts.remainingLockoutSeconds(email);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_LOCKED", email, email,
                        "locked-out " + retryAfter + "s"));
            }
            throw TooManyRequestsException.of(retryAfter);
        }

        var user = users.findByEmail(email).orElse(null);
        // Equal-time check: even if the user is missing, run bcrypt against the
        // configured dummy hash so an attacker can't enumerate accounts by
        // measuring response latency.
        boolean valid = user != null && passwords.matches(req.password(), user.getPasswordHash());
        if (user == null) {
            passwords.matches(req.password(), DUMMY_HASH);
        }
        if (!valid) {
            if (attempts != null) {
                attempts.recordFailure(email);
            }
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_FAILED", email, email,
                        "invalid-credentials"));
            }
            throw new BadCredentialsException("Invalid credentials");
        }

        if (attempts != null) {
            attempts.reset(email);
        }
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_LOGIN_SUCCESS",
                    user.getId().toString(), email));
        }
        user.touchLogin();
        return issueTokens(user);
    }

    /**
     * Token rotation with automatic-reuse detection.
     *
     * <p>The submitted refresh token's JWT signature is checked first, then
     * we look up its hash in the Redis registry:
     * <ul>
     *   <li><b>Found</b> → revoke this single hash, issue a new access +
     *       refresh pair. Normal happy path.</li>
     *   <li><b>Missing</b> → the JWT signature passed (so it was once
     *       legitimately issued to this user) but the hash is gone, which
     *       means it has already been rotated. Either the legitimate
     *       client rotated and someone replayed an old copy, or an
     *       attacker rotated first and the real user is the one being
     *       replayed. We cannot tell which is which, so we
     *       {@link RefreshTokenStore#revokeAll revoke every} session for
     *       the user. Both sides are forced to re-authenticate.</li>
     * </ul>
     * Pattern: OAuth 2.0 "automatic reuse detection" (RFC 6819 §5.2.2.3).
     */
    public AuthResponse refresh(String refreshToken) {
        UUID userId = tokens.validateRefresh(refreshToken);
        if (!refreshStore.isKnown(userId, refreshToken)) {
            // Reuse detected — burn every session for safety. The actor of
            // the audit event is the userId (no email yet because we may
            // not want a DB roundtrip on a hot path), the reason carries
            // enough context for SOC alerting.
            refreshStore.revokeAll(userId);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_REFRESH_REUSE_DETECTED",
                        userId.toString(), userId.toString(),
                        "refresh-token-reused-all-sessions-revoked"));
            }
            throw new BadCredentialsException("Refresh token revoked or reused");
        }
        refreshStore.revoke(userId, refreshToken);
        var user = users.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_TOKEN_REFRESH",
                    user.getId().toString(), user.getEmail()));
        }
        return issueTokens(user);
    }

    public void logout(UUID userId, String refreshToken) {
        refreshStore.revoke(userId, refreshToken);
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_LOGOUT", userId.toString(),
                    userId.toString()));
        }
    }

    /** Sign the user out of *every* device — useful after password reset. */
    public void logoutAll(UUID userId) {
        refreshStore.revokeAll(userId);
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_LOGOUT_ALL", userId.toString(),
                    userId.toString()));
        }
    }

    /**
     * Change the current user's password by submitting the old one. Distinct
     * from /password/reset (which uses an emailed token): this path is for
     * authenticated users in /settings.
     *
     * <p>Verifies the old password (with equal-time bcrypt against a dummy
     * hash if the account vanished mid-request), enforces the same strength
     * rubric as register, then rotates the bcrypt hash and revokes every
     * refresh token — including the current one — so the user must
     * re-authenticate on every device. The screen is responsible for
     * routing back to /login.
     */
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        var user = users.findById(userId).orElse(null);
        boolean valid = user != null && passwords.matches(oldPassword, user.getPasswordHash());
        if (user == null) {
            passwords.matches(oldPassword, DUMMY_HASH);
        }
        if (!valid) {
            if (audit != null && user != null) {
                audit.log(AuditEvent.failure("AUTH_PASSWORD_CHANGED",
                        user.getId().toString(), user.getEmail(),
                        "invalid-old-password"));
            }
            throw new BadCredentialsException("Invalid credentials");
        }
        rejectWeakPassword(newPassword);
        user.setPasswordHash(passwords.encode(newPassword));
        refreshStore.revokeAll(user.getId());
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_PASSWORD_CHANGED",
                    user.getId().toString(), user.getEmail()));
        }
    }

    /**
     * Request a password reset. The response is intentionally outcome-agnostic
     * (the controller returns 204 no matter what) so attackers cannot probe
     * which addresses are registered.
     *
     * <p>Side-effects only occur when the account exists:
     * <ul>
     *   <li>A 32-byte token is generated; its SHA-256 hash is persisted with a
     *       30-min TTL. The hash is single-use (cleared on reset).</li>
     *   <li>A {@link DomainEvents.PasswordResetRequested} event carrying the
     *       *plain* token is published so notification-service can mail it.</li>
     * </ul>
     */
    public void requestPasswordReset(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        if (normalized.isEmpty()) {
            return;
        }
        var user = users.findByEmail(normalized).orElse(null);
        if (user == null) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_PASSWORD_RESET_REQUESTED",
                        normalized, normalized, "unknown-account"));
            }
            return;
        }

        // Don't re-issue if a fresh, unexpired token already exists — this
        // prevents an attacker from flooding the inbox of a known address.
        if (user.getPasswordResetExpiresAt() != null
                && user.getPasswordResetExpiresAt().isAfter(Instant.now())) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_PASSWORD_RESET_REQUESTED",
                        user.getId().toString(), normalized, "throttled"));
            }
            return;
        }

        String token = randomToken();
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.MINUTES);
        user.setPasswordReset(sha256(token), expiresAt);

        // Look up the profile's first name for personalised email — fall back
        // gracefully if no profile row exists (registration always creates one,
        // so this should never happen in production but tests may differ).
        String firstName = profiles.findById(user.getId())
                .map(Profile::getFirstName).orElse("");

        events.publish(Topics.PASSWORD_RESET_REQUESTED, user.getId().toString(),
                new DomainEvents.PasswordResetRequested(
                        user.getId(), user.getEmail(), firstName,
                        user.getPreferredLocale(), token, expiresAt, Instant.now()));

        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_PASSWORD_RESET_REQUESTED",
                    user.getId().toString(), normalized));
        }
    }

    /**
     * Consume a reset token and set the new password. Revokes every refresh
     * token of the account so all existing sessions are signed out.
     */
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.isBlank()) {
            throw new BadCredentialsException("Invalid reset token");
        }
        var user = users.findByPasswordResetTokenHash(sha256(token))
                .orElseThrow(() -> new BadCredentialsException("Invalid reset token"));
        if (user.getPasswordResetExpiresAt() == null
                || user.getPasswordResetExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Reset token expired");
        }
        rejectWeakPassword(newPassword);
        user.setPasswordHash(passwords.encode(newPassword));
        user.clearPasswordReset();
        refreshStore.revokeAll(user.getId());
        if (attempts != null) {
            attempts.reset(user.getEmail());
        }
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_PASSWORD_CHANGED",
                    user.getId().toString(), user.getEmail()));
        }
    }

    /**
     * Reject passwords that score below {@code MIN_PASSWORD_SCORE} on the
     * shared rubric. The Bean-Validation `@Size(min=8)` runs first and
     * catches the obvious too-short case; this catches everything else
     * (single character class, sequential / repeating, common). The 422
     * response carries the first suggestion ID so clients translate it
     * via `auth.password.suggest.<id>`.
     */
    private static final int MIN_PASSWORD_SCORE = 2;

    private static void rejectWeakPassword(String password) {
        var result = PasswordStrength.evaluate(password);
        if (result.score() >= MIN_PASSWORD_SCORE) return;
        String firstSuggestion = result.suggestions().isEmpty()
                ? "weak"
                : result.suggestions().get(0);
        throw new UnprocessableEntityException(
                "Password too weak (score=" + result.score() + "; suggestion="
                        + firstSuggestion + ")",
                "error.auth.password.weak." + firstSuggestion);
    }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    public void verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new BadCredentialsException("Invalid verification token");
        }
        // The DB column now holds the SHA-256 of the token (since Iter 39).
        // Existing rows persisted in the legacy plaintext shape will fail the
        // lookup; their users can re-register or trigger a re-issue. We
        // audit the failure mode separately so SOC can spot a sudden spike
        // of "invalid token" hits — likely a token-spraying attempt.
        var user = users.findByEmailVerificationToken(sha256(token))
                .orElse(null);
        if (user == null) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_EMAIL_VERIFY",
                        "unknown", "unknown", "invalid-token"));
            }
            throw new BadCredentialsException("Invalid verification token");
        }
        if (user.getEmailVerificationExpiresAt() != null
                && user.getEmailVerificationExpiresAt().isBefore(Instant.now())) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_EMAIL_VERIFY",
                        user.getId().toString(), user.getEmail(), "expired"));
            }
            throw new BadCredentialsException("Verification token expired");
        }
        user.markEmailVerified();
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_EMAIL_VERIFY",
                    user.getId().toString(), user.getEmail()));
        }
    }

    private AuthResponse issueTokens(User user) {
        var access = tokens.issueAccess(user);
        var refresh = tokens.issueRefresh(user.getId());
        refreshStore.remember(user.getId(), refresh.token(),
                Duration.ofSeconds(tokens.refreshTtlSeconds()));
        return new AuthResponse(
                access.token(),
                access.expiresAt(),
                tokens.accessTtlSeconds(),
                refresh.token(),
                refresh.expiresAt(),
                new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getRole(),
                        user.isEmailVerified(), user.getPreferredLocale()));
    }

    private static String randomToken() {
        byte[] b = new byte[32];
        RND.nextBytes(b);
        return HexFormat.of().formatHex(b);
    }

    public record RegisterRequest(
            @jakarta.validation.constraints.Email String email,
            @jakarta.validation.constraints.Size(min = 8, max = 72) String password,
            @jakarta.validation.constraints.NotBlank String firstName,
            @jakarta.validation.constraints.NotBlank String lastName,
            UserRole role) {}

    public record LoginRequest(
            @jakarta.validation.constraints.Email String email,
            @jakarta.validation.constraints.NotBlank String password) {}

    public record ForgotPasswordRequest(
            @jakarta.validation.constraints.Email String email) {}

    public record ResetPasswordRequest(
            @jakarta.validation.constraints.NotBlank String token,
            @jakarta.validation.constraints.Size(min = 8, max = 72) String newPassword) {}

    public record ChangePasswordRequest(
            @jakarta.validation.constraints.NotBlank String oldPassword,
            @jakarta.validation.constraints.Size(min = 8, max = 72) String newPassword) {}

    public record AuthResponse(
            String accessToken,
            Instant accessTokenExpiresAt,
            /** TTL of the access token in seconds — lets the client schedule its
             * auto-refresh without parsing the JWT. */
            int accessTokenExpiresIn,
            String refreshToken,
            Instant refreshTokenExpiresAt,
            UserDto user) {
        public record UserDto(UUID id, String email, UserRole role,
                              boolean emailVerified, String preferredLocale) {}
    }
}
