package tn.bewerbi.identity.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.List;
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
import tn.bewerbi.common.security.BreachedPasswordChecker;
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
    private final BreachedPasswordChecker breachedChecker;
    private final KnownDeviceTracker devices;

    public AuthService(UserRepository users, ProfileRepository profiles,
                       PasswordEncoder passwords, JwtTokenService tokens,
                       EventPublisher events, RefreshTokenStore refreshStore,
                       ObjectProvider<LoginAttemptTracker> attemptsProvider,
                       ObjectProvider<AuditLogger> auditProvider,
                       ObjectProvider<BreachedPasswordChecker> breachedProvider,
                       ObjectProvider<KnownDeviceTracker> devicesProvider) {
        this.users = users; this.profiles = profiles;
        this.passwords = passwords; this.tokens = tokens;
        this.events = events;
        this.refreshStore = refreshStore;
        // Optional: in unit tests without Redis these beans are absent.
        this.attempts = attemptsProvider.getIfAvailable();
        this.audit = auditProvider.getIfAvailable();
        // Off by default; opt in via
        //   bewerbi.security.password.breach-check.enabled=true
        this.breachedChecker = breachedProvider.getIfAvailable();
        this.devices = devicesProvider.getIfAvailable();
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
        // Notify on first login from a fresh (IP, UA) pair so the user
        // can spot a hostile takeover that the rate-limiter + lockout
        // didn't catch (e.g. credential-stuffing with a leaked password).
        notifyOnNewDevice(user);
        return issueTokens(user);
    }

    private void notifyOnNewDevice(User user) {
        if (devices == null) return;
        String ip = currentClientIp();
        String ua = currentUserAgent();
        if (!devices.recordAndCheckNew(user.getId(), ip, ua)) return;
        String firstName = profiles.findById(user.getId())
                .map(Profile::getFirstName).orElse("");
        events.publish(Topics.NEW_DEVICE_SIGN_IN, user.getId().toString(),
                new DomainEvents.NewDeviceSignIn(
                        user.getId(), user.getEmail(), firstName,
                        user.getPreferredLocale(), ip, ua, Instant.now()));
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_NEW_DEVICE_SIGN_IN",
                    user.getId().toString(), user.getEmail()));
        }
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
        AuthResponse response = issueTokens(user);
        // Update lastUsedAt on the freshly-issued session so the
        // active-sessions screen shows "currently active" instead of
        // the moment the original token was minted.
        refreshStore.touch(user.getId(), response.refreshToken());
        return response;
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
     * GDPR Art. 17 "right to erasure". The user re-enters their password
     * (equal-time bcrypt) and we delete the account.
     *
     * <p>Cascade behaviour:
     * <ul>
     *   <li>{@code profiles}, {@code profile_skills} — cascade ON DELETE
     *       set up in V1__identity_schema.sql.</li>
     *   <li>Refresh tokens — wiped via {@link RefreshTokenStore#revokeAll}.</li>
     *   <li>Failed-login + reset-token state — Redis keys are user-scoped
     *       and TTL-bound, so they expire on their own; explicit clear
     *       below avoids a small window of stale state.</li>
     * </ul>
     *
     * <p>Data living outside identity-service (applications, favorites,
     * documents, reviews, …) is the responsibility of those services —
     * they listen to {@code USER_DELETED} and remove or anonymise their
     * copies. Wired here so the audit + event are emitted; downstream
     * listeners can be added incrementally.
     */
    public void deleteAccount(UUID userId, String passwordConfirmation) {
        var user = users.findById(userId).orElse(null);
        boolean valid = user != null
                && passwords.matches(passwordConfirmation, user.getPasswordHash());
        if (user == null) {
            passwords.matches(passwordConfirmation, DUMMY_HASH);
        }
        if (!valid) {
            if (audit != null && user != null) {
                audit.log(AuditEvent.failure("AUTH_ACCOUNT_DELETE",
                        user.getId().toString(), user.getEmail(),
                        "invalid-password-confirmation"));
            }
            throw new BadCredentialsException("Invalid credentials");
        }

        String email = user.getEmail();
        // Wipe live + Redis state first so an in-flight refresh from
        // another tab can't resurrect tokens mid-delete.
        refreshStore.revokeAll(user.getId());
        if (attempts != null) {
            attempts.reset(email);
        }

        // Persist the audit trail BEFORE the row goes away, so the
        // log entry actually carries the email rather than "unknown".
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_ACCOUNT_DELETED",
                    user.getId().toString(), email));
        }

        users.delete(user);

        // Tell the rest of the platform. Downstream services anonymise
        // or hard-delete their per-user data on receipt.
        events.publish(Topics.USER_DELETED, user.getId().toString(),
                new DomainEvents.UserDeleted(
                        user.getId(), email, Instant.now()));
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
        if (passwords.matches(newPassword, user.getPasswordHash())) {
            throw new UnprocessableEntityException(
                    "New password must differ from the current one",
                    "error.auth.password.reused");
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
        // Reject reuse of the *current* password — defeats the "reset to
        // the same thing" anti-pattern. Doesn't track full history (we
        // don't store old hashes), but the live one is the only one
        // bcrypt can match against anyway.
        if (passwords.matches(newPassword, user.getPasswordHash())) {
            throw new UnprocessableEntityException(
                    "New password must differ from the current one",
                    "error.auth.password.reused");
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

    private void rejectWeakPassword(String password) {
        var result = PasswordStrength.evaluate(password);
        if (result.score() < MIN_PASSWORD_SCORE) {
            String firstSuggestion = result.suggestions().isEmpty()
                    ? "weak"
                    : result.suggestions().get(0);
            throw new UnprocessableEntityException(
                    "Password too weak (score=" + result.score() + "; suggestion="
                            + firstSuggestion + ")",
                    "error.auth.password.weak." + firstSuggestion);
        }
        // Optional HIBP check — runs only when the feature flag is on,
        // and fails open if the API can't be reached. Catches passwords
        // that score >= 2 on the local rubric but appear in known
        // breaches (e.g. "Sunshine123!" — meets the rubric, leaked
        // 200k+ times).
        if (breachedChecker != null && breachedChecker.isBreached(password)) {
            throw new UnprocessableEntityException(
                    "Password appears in a known breach",
                    "error.auth.password.weak.breached");
        }
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

    /**
     * Re-issue a verification token and dispatch the welcome email again.
     * Used by the UI's "E-Mail nicht erhalten?" link.
     *
     * <p>Same anti-enumeration / anti-spam shape as
     * {@link #requestPasswordReset(String)}:
     * <ul>
     *   <li>Always succeeds from the controller's POV (204).</li>
     *   <li>No-op for unknown addresses (no event published, no token
     *       generated).</li>
     *   <li>No-op for accounts already verified.</li>
     *   <li>No-op while a fresh token is still alive (per-account
     *       throttle: avoids inbox flooding).</li>
     * </ul>
     */
    public void resendVerification(String email) {
        String normalized = email == null ? "" : email.trim().toLowerCase();
        if (normalized.isEmpty()) return;
        var user = users.findByEmail(normalized).orElse(null);
        if (user == null) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_EMAIL_VERIFY_RESEND",
                        normalized, normalized, "unknown-account"));
            }
            return;
        }
        if (user.isEmailVerified()) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_EMAIL_VERIFY_RESEND",
                        user.getId().toString(), normalized, "already-verified"));
            }
            return;
        }
        if (user.getEmailVerificationExpiresAt() != null
                && user.getEmailVerificationExpiresAt().isAfter(Instant.now())) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_EMAIL_VERIFY_RESEND",
                        user.getId().toString(), normalized, "throttled"));
            }
            return;
        }

        String plain = randomToken();
        user.setEmailVerification(sha256(plain),
                Instant.now().plus(48, ChronoUnit.HOURS));
        String firstName = profiles.findById(user.getId())
                .map(Profile::getFirstName).orElse("");
        events.publish(Topics.USER_REGISTERED, user.getId().toString(),
                new DomainEvents.UserRegistered(
                        user.getId(), user.getEmail(), firstName,
                        user.getRole().name(), user.getPreferredLocale(),
                        plain, Instant.now()));

        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_EMAIL_VERIFY_RESEND",
                    user.getId().toString(), normalized));
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
        // Capture the User-Agent of the request that triggered the new
        // session so the user can identify it later in the active-sessions
        // screen. The lookup is best-effort — works inside a servlet
        // request, no-op otherwise (e.g. async tests).
        String ua = currentUserAgent();
        refreshStore.remember(user.getId(), refresh.token(),
                Duration.ofSeconds(tokens.refreshTtlSeconds()), ua);
        return new AuthResponse(
                access.token(),
                access.expiresAt(),
                tokens.accessTtlSeconds(),
                refresh.token(),
                refresh.expiresAt(),
                new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getRole(),
                        user.isEmailVerified(), user.getPreferredLocale()));
    }

    /** Returns the SHA-256-hashed refresh tokens of a user — used by the
     *  session-listing endpoint. Plain tokens never leave Redis. */
    public List<RefreshTokenStore.SessionInfo> listSessions(UUID userId) {
        return refreshStore.list(userId);
    }

    /** Revoke a single session by its hash (as returned by {@link #listSessions}). */
    public boolean revokeSession(UUID userId, String tokenHash) {
        boolean removed = refreshStore.revokeByHash(userId, tokenHash);
        if (removed && audit != null) {
            audit.log(AuditEvent.success("AUTH_SESSION_REVOKED",
                    userId.toString(), tokenHash.substring(0, Math.min(8, tokenHash.length()))));
        }
        return removed;
    }

    /**
     * Revoke every refresh token of the user *except* the one whose
     * hash matches {@code keepHash} — typically the caller's current
     * session. Used by the settings UI: "Auf allen anderen Geräten
     * abmelden" without forcing a fresh login on the device that
     * triggered the action.
     *
     * @return number of revoked sessions
     */
    public int revokeAllExcept(UUID userId, String keepHash) {
        int removed = 0;
        var sessions = refreshStore.list(userId);
        for (var s : sessions) {
            if (keepHash != null && keepHash.equalsIgnoreCase(s.tokenHash())) continue;
            if (refreshStore.revokeByHash(userId, s.tokenHash())) removed++;
        }
        if (removed > 0 && audit != null) {
            audit.log(AuditEvent.success("AUTH_OTHER_SESSIONS_REVOKED",
                    userId.toString(), userId.toString()));
        }
        return removed;
    }

    private static String currentUserAgent() {
        try {
            var attrs = org.springframework.web.context.request.RequestContextHolder
                    .getRequestAttributes();
            if (attrs instanceof org.springframework.web.context.request
                    .ServletRequestAttributes sra) {
                return sra.getRequest().getHeader("User-Agent");
            }
        } catch (Exception ignore) {
            // Outside a request scope — fine, no UA to capture.
        }
        return null;
    }

    /** Client IP honouring X-Forwarded-For (gateway sits in front of us). */
    private static String currentClientIp() {
        try {
            var attrs = org.springframework.web.context.request.RequestContextHolder
                    .getRequestAttributes();
            if (!(attrs instanceof org.springframework.web.context.request
                    .ServletRequestAttributes sra)) {
                return null;
            }
            String fwd = sra.getRequest().getHeader("X-Forwarded-For");
            if (fwd != null && !fwd.isBlank()) {
                int comma = fwd.indexOf(',');
                return (comma < 0 ? fwd : fwd.substring(0, comma)).trim();
            }
            return sra.getRequest().getRemoteAddr();
        } catch (Exception ignore) {
            return null;
        }
    }

    private static String randomToken() {
        byte[] b = new byte[32];
        RND.nextBytes(b);
        return HexFormat.of().formatHex(b);
    }

    // 254 chars is the RFC 5321 hard limit for an addressable email.
    // Names are clamped to 80 chars (matches the DB column width) so a
    // 10MB payload can't waste CPU on bean-validation.
    // bcrypt only hashes the first 72 bytes, so anything beyond that is
    // ignored — capping the field there is both safe and DoS-friendly.

    public record RegisterRequest(
            @jakarta.validation.constraints.Email
            @jakarta.validation.constraints.Size(max = 254) String email,
            @jakarta.validation.constraints.Size(min = 8, max = 72) String password,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 80) String firstName,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 80) String lastName,
            UserRole role) {}

    public record LoginRequest(
            @jakarta.validation.constraints.Email
            @jakarta.validation.constraints.Size(max = 254) String email,
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 200) String password) {}

    public record ForgotPasswordRequest(
            @jakarta.validation.constraints.Email
            @jakarta.validation.constraints.Size(max = 254) String email) {}

    public record ResendVerificationRequest(
            @jakarta.validation.constraints.Email
            @jakarta.validation.constraints.Size(max = 254) String email) {}

    public record ResetPasswordRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 128) String token,
            @jakarta.validation.constraints.Size(min = 8, max = 72) String newPassword) {}

    public record ChangePasswordRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 200) String oldPassword,
            @jakarta.validation.constraints.Size(min = 8, max = 72) String newPassword) {}

    public record DeleteAccountRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 200) String password) {}

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
