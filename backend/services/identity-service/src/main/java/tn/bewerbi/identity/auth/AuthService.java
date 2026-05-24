package tn.bewerbi.identity.auth;

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
import tn.bewerbi.identity.auth.google.GoogleIdTokenVerifier;
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
    /** Iter 160 — Postgres-backed login history (per-user activity view). */
    private final LoginAttemptRecorder loginRecorder;
    /** Iter 160 — null unless `bewerbi.security.google.client-id` is set. */
    private final GoogleIdTokenVerifier googleVerifier;
    private final LoginAttemptRepository loginAttempts;

    public AuthService(UserRepository users, ProfileRepository profiles,
                       PasswordEncoder passwords, JwtTokenService tokens,
                       EventPublisher events, RefreshTokenStore refreshStore,
                       LoginAttemptRecorder loginRecorder,
                       LoginAttemptRepository loginAttempts,
                       ObjectProvider<LoginAttemptTracker> attemptsProvider,
                       ObjectProvider<AuditLogger> auditProvider,
                       ObjectProvider<BreachedPasswordChecker> breachedProvider,
                       ObjectProvider<KnownDeviceTracker> devicesProvider,
                       ObjectProvider<GoogleIdTokenVerifier> googleProvider) {
        this.users = users; this.profiles = profiles;
        this.passwords = passwords; this.tokens = tokens;
        this.events = events;
        this.refreshStore = refreshStore;
        this.loginRecorder = loginRecorder;
        this.loginAttempts = loginAttempts;
        // Optional: in unit tests without Redis these beans are absent.
        this.attempts = attemptsProvider.getIfAvailable();
        this.audit = auditProvider.getIfAvailable();
        // Off by default; opt in via
        //   bewerbi.security.password.breach-check.enabled=true
        this.breachedChecker = breachedProvider.getIfAvailable();
        this.devices = devicesProvider.getIfAvailable();
        // Optional: only present when bewerbi.security.google.client-id is set.
        this.googleVerifier = googleProvider.getIfAvailable();
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
        String ip = currentClientIp();
        String ua = currentUserAgent();

        // Per-account lockout — short-circuit before touching the DB / bcrypt.
        if (attempts != null && attempts.isLockedOut(email)) {
            long retryAfter = attempts.remainingLockoutSeconds(email);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_LOCKED", email, email,
                        "locked-out " + retryAfter + "s"));
            }
            loginRecorder.recordFailure(null, email, LoginMethod.PASSWORD,
                    "RATE_LIMITED_ACCOUNT", ip, ua);
            throw TooManyRequestsException.of(retryAfter);
        }
        // Per-IP lockout (Iter 113).
        if (attempts != null && attempts.isIpLockedOut(ip)) {
            long retryAfter = attempts.remainingIpLockoutSeconds(ip);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_LOCKED", email, email,
                        "ip-locked-out " + ip + " " + retryAfter + "s"));
            }
            loginRecorder.recordFailure(null, email, LoginMethod.PASSWORD,
                    "RATE_LIMITED_IP", ip, ua);
            throw TooManyRequestsException.of(retryAfter);
        }

        var user = users.findByEmail(email).orElse(null);

        // Iter 160 — block password login for OAuth-only users. A Google
        // user submitting `email + password` should hear "you signed up
        // with Google" instead of equal-time-bcrypt nonsense (their
        // password_hash is NULL). We DO still run a bcrypt against the
        // dummy hash to keep timing equal vs. wrong-password.
        if (user != null && user.isOauthOnly()) {
            passwords.matches(req.password(), DUMMY_HASH);
            if (attempts != null) {
                attempts.recordFailure(email);
                attempts.recordIpFailure(ip);
            }
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_FAILED",
                        user.getId().toString(), email, "oauth-only-account"));
            }
            loginRecorder.recordFailure(user.getId(), email, LoginMethod.PASSWORD,
                    "OAUTH_ACCOUNT_USE_GOOGLE", ip, ua);
            throw new BadCredentialsException("Invalid credentials");
        }

        // Equal-time check: even if the user is missing, run bcrypt against the
        // configured dummy hash.
        boolean valid = user != null && passwords.matches(req.password(), user.getPasswordHash());
        if (user == null) {
            passwords.matches(req.password(), DUMMY_HASH);
        }
        if (!valid) {
            if (attempts != null) {
                attempts.recordFailure(email);
                attempts.recordIpFailure(ip);
            }
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_FAILED", email, email,
                        "invalid-credentials"));
            }
            loginRecorder.recordFailure(
                    user != null ? user.getId() : null, email,
                    LoginMethod.PASSWORD,
                    user != null ? "INVALID_PASSWORD" : "USER_NOT_FOUND",
                    ip, ua);
            throw new BadCredentialsException("Invalid credentials");
        }

        if (attempts != null) {
            attempts.reset(email);
        }
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_LOGIN_SUCCESS",
                    user.getId().toString(), email));
        }
        loginRecorder.recordSuccess(user.getId(), email, LoginMethod.PASSWORD, ip, ua);
        user.touchLogin();
        notifyOnNewDevice(user);
        return issueTokens(user);
    }

    /**
     * Iter 160 — Google ID token login / signup.
     *
     * <p>The client (web/mobile) gets an ID token from Google's sign-in
     * SDK and POSTs it here. We verify it server-side against Google's
     * JWKS — never trust client-side claims.
     *
     * <p>3 paths:
     * <ol>
     *   <li>Existing GOOGLE user (lookup by `sub`) → issue tokens.</li>
     *   <li>Existing EMAIL user (lookup by email) → 409 with a clear
     *       message asking them to log in with their password instead.
     *       Future iteration: account-linking flow.</li>
     *   <li>Brand-new user → create with {@link User#fromGoogle}, also
     *       seed a Profile with the given/family name from the token.
     *       No verification email needed (Google verified the email).</li>
     * </ol>
     */
    public AuthResponse googleLogin(GoogleLoginRequest req) {
        if (googleVerifier == null) {
            throw new tn.bewerbi.common.api.exception.ServiceUnavailableException(
                    "Google sign-in is not configured", "error.auth.google.disabled");
        }
        String ip = currentClientIp();
        String ua = currentUserAgent();

        // Iter 165 — apply the IP-level rate-limit BEFORE token-verify.
        // Token-verify hits Google's JWKS (network I/O + RSA validation)
        // which is too expensive to let an unauthenticated client invoke
        // freely. The per-email axis can't apply here because we don't
        // know the email until verification succeeds.
        if (attempts != null && attempts.isIpLockedOut(ip)) {
            long retryAfter = attempts.remainingIpLockoutSeconds(ip);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_LOCKED", "google", "google",
                        "oauth-ip-locked-out " + ip + " " + retryAfter + "s"));
            }
            loginRecorder.recordFailure(null, "[google]", LoginMethod.GOOGLE,
                    "RATE_LIMITED_IP", ip, ua);
            throw TooManyRequestsException.of(retryAfter);
        }

        GoogleIdTokenVerifier.VerifiedGoogleUser g;
        try {
            g = googleVerifier.verify(req.idToken());
        } catch (GoogleIdTokenVerifier.GoogleTokenException e) {
            // Iter 165 — count token-verify failures toward the per-IP
            // lockout. Burns through the rate-limit budget if someone
            // spams the endpoint with garbage JWTs.
            if (attempts != null) {
                attempts.recordIpFailure(ip);
            }
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_FAILED", "google", "google",
                        e.code() + ": " + e.getMessage()));
            }
            loginRecorder.recordFailure(null, "[google]", LoginMethod.GOOGLE,
                    e.code(), ip, ua);
            throw new BadCredentialsException("Google token rejected: " + e.code());
        }

        // Path 1 — existing Google user (lookup by stable sub).
        var existing = users.findByGoogleSubject(g.subject());
        if (existing.isPresent()) {
            User user = existing.get();
            recordGoogleSuccess(user, g.email(), ip, ua);
            user.touchLogin();
            notifyOnNewDevice(user);
            return issueTokens(user);
        }

        // Path 2 — email collision with a password account.
        var byEmail = users.findByEmail(g.email());
        if (byEmail.isPresent()) {
            User u = byEmail.get();
            loginRecorder.recordFailure(u.getId(), g.email(), LoginMethod.GOOGLE,
                    "OAUTH_EMAIL_COLLISION_PASSWORD_USER", ip, ua);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_LOGIN_FAILED",
                        u.getId().toString(), g.email(),
                        "google-email-collides-with-password-user"));
            }
            throw new ConflictException(
                    "This email is registered with a password — please log in with your password.",
                    "error.auth.google.emailExistsAsPassword");
        }

        // Path 3 — new Google user.
        UserRole desiredRole = req.role() != null ? req.role() : UserRole.APPLICANT;
        User user = User.fromGoogle(g.email(), g.subject(), desiredRole);
        user.setPreferredLocale(LocaleContext.currentTag());
        users.save(user);

        Profile profile = new Profile(user.getId());
        if (g.givenName() != null) profile.setFirstName(g.givenName());
        if (g.familyName() != null) profile.setLastName(g.familyName());
        if (g.pictureUrl() != null) profile.setPhotoUrl(g.pictureUrl());
        profile.setCountry("Tunesien");
        profiles.save(profile);

        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_REGISTER",
                    user.getId().toString(), user.getEmail()));
        }
        recordGoogleSuccess(user, g.email(), ip, ua);
        user.touchLogin();
        return issueTokens(user);
    }

    private void recordGoogleSuccess(User user, String email, String ip, String ua) {
        if (attempts != null) {
            attempts.reset(email);
            // Iter 165 — also clear the per-IP counter on a confirmed
            // success. A legit user shouldn't carry forward failure
            // credit from earlier token-verify errors (e.g. their
            // session expired mid-OAuth-handshake).
            attempts.resetIp(ip);
        }
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_LOGIN_SUCCESS",
                    user.getId().toString(), email));
        }
        loginRecorder.recordSuccess(user.getId(), email, LoginMethod.GOOGLE, ip, ua);
    }

    /**
     * Iter 167 — link a Google identity to the currently-authenticated
     * user (who signed up via email + password and now also wants to
     * use Google).
     *
     * <p>Guards:
     * <ul>
     *   <li>The verified Google email must match the user's email — we
     *       don't let one user link a Google account they don't own.</li>
     *   <li>No other user may already hold the same {@code sub} —
     *       blocked by the DB unique index but checked early for a
     *       clean 409 error rather than a constraint-violation 500.</li>
     *   <li>The user must currently have a password — linking does NOT
     *       remove their password access. If they had no password we'd
     *       be silently turning a "password-only" user into a "Google-
     *       only" user by side-effect, which is not what they asked for.</li>
     * </ul>
     */
    public void linkGoogle(UUID userId, GoogleLoginRequest req) {
        if (googleVerifier == null) {
            throw new tn.bewerbi.common.api.exception.ServiceUnavailableException(
                    "Google sign-in is not configured", "error.auth.google.disabled");
        }
        User user = users.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        if (!user.hasPassword()) {
            throw new ConflictException(
                    "Account has no password — use the dedicated link flow.",
                    "error.auth.google.linkRequiresPassword");
        }

        // Iter 175 — same JWKS-DoS guard as /auth/google (Iter 165).
        // link-google verifies an RSA-signed token, so an attacker who
        // compromises an authenticated session could still abuse this
        // path to burn server-side cycles. Share the per-IP rate-limit
        // axis with the password-login flow so the budgets compose.
        String ip = currentClientIp();
        String ua = currentUserAgent();
        if (attempts != null && attempts.isIpLockedOut(ip)) {
            long retryAfter = attempts.remainingIpLockoutSeconds(ip);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_GOOGLE_LINK",
                        user.getId().toString(), user.getEmail(),
                        "oauth-ip-locked-out " + ip + " " + retryAfter + "s"));
            }
            throw TooManyRequestsException.of(retryAfter);
        }

        GoogleIdTokenVerifier.VerifiedGoogleUser g;
        try {
            g = googleVerifier.verify(req.idToken());
        } catch (GoogleIdTokenVerifier.GoogleTokenException e) {
            // Token-verify failure burns the per-IP budget exactly like
            // /auth/google. A compromised session spamming garbage tokens
            // gets the same lockout treatment as anonymous junk.
            if (attempts != null) {
                attempts.recordIpFailure(ip);
            }
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_GOOGLE_LINK",
                        user.getId().toString(), user.getEmail(),
                        e.code() + ": " + e.getMessage()));
            }
            throw new BadCredentialsException("Google token rejected: " + e.code());
        }

        // Anti-hijack: only link a Google identity that matches the
        // user's verified email. Without this, anyone with access to
        // the session cookie could link an arbitrary Google account
        // and use it to sign in later as the user.
        if (!user.getEmail().equalsIgnoreCase(g.email())) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_GOOGLE_LINK",
                        user.getId().toString(), user.getEmail(),
                        "email-mismatch:" + g.email()));
            }
            throw new ConflictException(
                    "Google email does not match account email.",
                    "error.auth.google.linkEmailMismatch");
        }

        var conflict = users.findByGoogleSubject(g.subject());
        if (conflict.isPresent() && !conflict.get().getId().equals(user.getId())) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_GOOGLE_LINK",
                        user.getId().toString(), user.getEmail(),
                        "google-already-linked-to-other-user"));
            }
            throw new ConflictException(
                    "This Google account is already linked to a different user.",
                    "error.auth.google.linkAlreadyTaken");
        }

        user.linkGoogle(g.subject());
        // Iter 175 — successful link resets the per-IP failure budget,
        // matching the recordGoogleSuccess() pattern from login.
        if (attempts != null) {
            attempts.resetIp(ip);
        }
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_GOOGLE_LINK",
                    user.getId().toString(), user.getEmail()));
        }
        // Iter 175 — also write a login_attempts row so the user sees
        // the link event in their "Letzte Aktivität" panel. Method
        // GOOGLE + success=true makes it visually consistent with a
        // login event, with the reason field carrying the action.
        loginRecorder.recordSuccess(user.getId(), g.email(), LoginMethod.GOOGLE, ip, ua);
    }

    /**
     * Iter 167 — unlink the Google identity. Hard-rejected if the user
     * has no password, because that would lock them out.
     */
    public void unlinkGoogle(UUID userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        if (!user.hasGoogle()) {
            return; // idempotent: not-linked is already in the desired state
        }
        if (!user.hasPassword()) {
            throw new ConflictException(
                    "Cannot unlink Google — set a password first, otherwise you'll be locked out.",
                    "error.auth.google.unlinkRequiresPassword");
        }
        user.unlinkGoogle();
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_GOOGLE_UNLINK",
                    user.getId().toString(), user.getEmail()));
        }
    }

    /**
     * Iter 167 — set the *initial* password for a Google-only user.
     * Distinct from {@link #changePassword} which requires the user
     * to know their existing password.
     *
     * <p>Once set, {@link User#isOauthOnly()} flips to false, so the
     * user can subsequently log in either via Google or via email +
     * password. After this call we revoke every refresh token so the
     * user has to re-authenticate everywhere — same pattern as
     * password change.
     */
    public void setInitialPassword(UUID userId, String newPassword) {
        User user = users.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        if (user.hasPassword()) {
            throw new ConflictException(
                    "Account already has a password — use change-password instead.",
                    "error.auth.password.alreadySet");
        }
        rejectWeakPassword(newPassword);
        user.setInitialPassword(passwords.encode(newPassword));
        refreshStore.revokeAll(user.getId());
        if (audit != null) {
            audit.log(AuditEvent.success("AUTH_PASSWORD_SET_INITIAL",
                    user.getId().toString(), user.getEmail()));
        }
    }

    /**
     * Iter 169 — return the lightweight account-summary DTO. The web/
     * mobile settings UI calls this after a link/unlink/set-initial-
     * password so the hasPassword/hasGoogleLinked flags refresh without
     * having to re-mint tokens via /refresh.
     */
    public AuthResponse.UserDto accountSummary(UUID userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        return new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getRole(),
                user.isEmailVerified(), user.getPreferredLocale(),
                user.hasPassword(), user.hasGoogle());
    }

    /**
     * Iter 160 — return the most-recent login attempts for a user.
     * Powers the "recent activity" view in /settings.
     */
    public List<LoginAttempt> recentLoginAttempts(UUID userId, int limit) {
        int clamped = Math.max(1, Math.min(100, limit));
        return loginAttempts.findByUserIdOrderByOccurredAtDesc(
                userId, org.springframework.data.domain.PageRequest.of(0, clamped));
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
        // Iter 160 — OAuth-only users have no password to confirm. We
        // accept the request as-is (the user has already proven they
        // own the account by holding a valid JWT to even reach this
        // endpoint). For symmetry with the password path we still
        // burn a bcrypt against DUMMY_HASH to keep response timing flat.
        boolean oauthOnly = user != null && user.isOauthOnly();
        if (oauthOnly) {
            passwords.matches(passwordConfirmation, DUMMY_HASH);
        } else {
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
        }

        String email = user.getEmail();
        // Wipe live + Redis state first so an in-flight refresh from
        // another tab can't resurrect tokens mid-delete.
        refreshStore.revokeAll(user.getId());
        if (attempts != null) {
            attempts.reset(email);
        }
        if (devices != null) {
            devices.forgetUser(user.getId());
        }

        // Iter 160 — GDPR Art. 17: anonymise the login-attempt audit
        // rows before the FK is nulled by ON DELETE SET NULL. We keep
        // the rows (security forensics trail) but blank the email so
        // the trail can no longer be linked back to a natural person.
        loginAttempts.anonymiseForUser(user.getId());

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
        // Iter 160 — OAuth-only users have no password to change. Reject
        // with a domain-specific 409 so the UI can route them to "manage
        // your Google account" instead of a generic "wrong password".
        // Equal-time bcrypt against DUMMY_HASH so an attacker who guesses
        // an email can't distinguish "this account is on Google" from
        // "this account doesn't exist" via response time.
        if (user != null && user.isOauthOnly()) {
            passwords.matches(oldPassword, DUMMY_HASH);
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_PASSWORD_CHANGED",
                        user.getId().toString(), user.getEmail(),
                        "oauth-only-account"));
            }
            throw new ConflictException(
                    "This account is managed by Google — no password to change.",
                    "error.auth.google.noPassword");
        }
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

        // Iter 160 — OAuth-only users have no password to reset. Stay
        // silent (no enumeration leak) — the user will not receive an
        // email and there's nothing to reset.
        if (user.isOauthOnly()) {
            if (audit != null) {
                audit.log(AuditEvent.failure("AUTH_PASSWORD_RESET_REQUESTED",
                        user.getId().toString(), normalized, "oauth-only-account"));
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
        // Iter 112 migration: probe HMAC first, fall back to legacy
        // SHA-256 so reset emails sent before the pepper rolled still
        // resolve. The 30-min TTL on reset tokens makes this fallback
        // self-clearing within half an hour of the pepper deploy.
        var user = users.findByPasswordResetTokenHash(sha256(token))
                .or(() -> users.findByPasswordResetTokenHash(
                        tn.bewerbi.common.security.TokenHasher.legacySha256(token)))
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

    /**
     * Iter 112: token storage hash. Writes use the new peppered HMAC;
     * reads should use {@link #lookupBothHashes} so pre-Iter-112 rows
     * still resolve until they expire.
     */
    private static String sha256(String input) {
        return tn.bewerbi.common.security.TokenHasher.hash(input);
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
        // Iter 112 migration: HMAC-first lookup with SHA-256 fallback
        // so emails dispatched pre-pepper-rollout still verify.
        var user = users.findByEmailVerificationToken(sha256(token))
                .or(() -> users.findByEmailVerificationToken(
                        tn.bewerbi.common.security.TokenHasher.legacySha256(token)))
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
        // Capture the User-Agent + IP of the request that triggered
        // the new session so the user can identify it later in the
        // active-sessions screen. Lookup is best-effort — works inside
        // a servlet request, no-op otherwise (e.g. async tests).
        String ua = currentUserAgent();
        String ip = currentClientIp();
        refreshStore.remember(user.getId(), refresh.token(),
                Duration.ofSeconds(tokens.refreshTtlSeconds()), ua, ip);
        return new AuthResponse(
                access.token(),
                access.expiresAt(),
                tokens.accessTtlSeconds(),
                refresh.token(),
                refresh.expiresAt(),
                new AuthResponse.UserDto(user.getId(), user.getEmail(), user.getRole(),
                        user.isEmailVerified(), user.getPreferredLocale(),
                        user.hasPassword(), user.hasGoogle()));
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

    /**
     * Iter 160 — payload for POST /api/v1/auth/google.
     *
     * <p>The {@code idToken} is the Google ID token (a JWT signed by Google,
     * NOT our backend) that the client SDK returns after the user picks
     * an account. Length cap of 4096 covers any realistic Google JWT
     * (typically ~1.2 KB) and prevents oversized-payload DoS.
     *
     * <p>{@code role} is only honoured on first signup. For an existing
     * user it's ignored — role changes go through a dedicated admin
     * endpoint, not OAuth sign-in.
     */
    public record GoogleLoginRequest(
            @jakarta.validation.constraints.NotBlank
            @jakarta.validation.constraints.Size(max = 4096) String idToken,
            UserRole role) {}

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

    /** Iter 167 — set the first password on an OAuth-only account. */
    public record SetPasswordRequest(
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
        /**
         * Iter 169 — added {@code hasPassword} + {@code hasGoogleLinked}
         * so the UI can branch settings (show "Mit Google verknüpfen"
         * only when not linked, show "Passwort setzen" only when no
         * password yet, etc.) without a second round-trip.
         */
        public record UserDto(UUID id, String email, UserRole role,
                              boolean emailVerified, String preferredLocale,
                              boolean hasPassword, boolean hasGoogleLinked) {}
    }
}
