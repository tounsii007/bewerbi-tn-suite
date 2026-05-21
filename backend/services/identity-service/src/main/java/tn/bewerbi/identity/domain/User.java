package tn.bewerbi.identity.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, unique = true) private String email;

    /** Iter 159 — nullable since GOOGLE-provider users have no local password.
     *  EMAIL-provider users (the default) always have a bcrypt hash here. */
    @Column(name = "password_hash") private String passwordHash;

    @Enumerated(EnumType.STRING) @Column(nullable = false) private UserRole role = UserRole.APPLICANT;
    @Column(name = "email_verified", nullable = false) private boolean emailVerified;
    @Column(name = "email_verification_token") private String emailVerificationToken;
    @Column(name = "email_verification_expires_at") private Instant emailVerificationExpiresAt;
    @Column(name = "preferred_locale", nullable = false) private String preferredLocale = "de";
    @Column(name = "last_login_at") private Instant lastLoginAt;
    @Column(name = "password_reset_token_hash") private String passwordResetTokenHash;
    @Column(name = "password_reset_expires_at") private Instant passwordResetExpiresAt;

    /** Iter 159 — which identity provider this user signed up with. */
    @Enumerated(EnumType.STRING)
    @Column(name = "auth_provider", nullable = false, length = 16)
    private AuthProvider authProvider = AuthProvider.EMAIL;

    /** Iter 159 — Google's stable `sub` claim from the OIDC ID token.
     *  Unique when set so two users can't link to the same Google account.
     *  Null for EMAIL-provider users. */
    @Column(name = "google_subject", unique = true, length = 64)
    private String googleSubject;

    protected User() {}

    /** Email + password signup. */
    public User(String email, String passwordHash, UserRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.authProvider = AuthProvider.EMAIL;
    }

    /**
     * Iter 159 — Google signup. No local password; Google already verified
     * the email so we trust it as verified.
     */
    public static User fromGoogle(String email, String googleSubject, UserRole role) {
        User u = new User();
        u.email = email;
        u.passwordHash = null;
        u.role = role;
        u.authProvider = AuthProvider.GOOGLE;
        u.googleSubject = googleSubject;
        u.emailVerified = true; // Google verifies the email before issuing the token
        return u;
    }

    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String h) { this.passwordHash = h; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public boolean isEmailVerified() { return emailVerified; }
    public String getEmailVerificationToken() { return emailVerificationToken; }
    public Instant getEmailVerificationExpiresAt() { return emailVerificationExpiresAt; }
    public void setEmailVerification(String token, Instant expiresAt) {
        this.emailVerificationToken = token; this.emailVerificationExpiresAt = expiresAt;
    }
    public void markEmailVerified() {
        this.emailVerified = true;
        this.emailVerificationToken = null;
        this.emailVerificationExpiresAt = null;
    }
    public String getPreferredLocale() { return preferredLocale; }
    public void setPreferredLocale(String v) { this.preferredLocale = v; }
    public Instant getLastLoginAt() { return lastLoginAt; }
    public void touchLogin() { this.lastLoginAt = Instant.now(); }

    public String getPasswordResetTokenHash() { return passwordResetTokenHash; }
    public Instant getPasswordResetExpiresAt() { return passwordResetExpiresAt; }
    public void setPasswordReset(String tokenHash, Instant expiresAt) {
        this.passwordResetTokenHash = tokenHash;
        this.passwordResetExpiresAt = expiresAt;
    }
    public void clearPasswordReset() {
        this.passwordResetTokenHash = null;
        this.passwordResetExpiresAt = null;
    }

    public AuthProvider getAuthProvider() { return authProvider; }
    public String getGoogleSubject() { return googleSubject; }

    /** Iter 167 — has a usable bcrypt hash on file. */
    public boolean hasPassword() {
        return passwordHash != null && !passwordHash.isBlank();
    }

    /** Iter 167 — has a linked Google identity. */
    public boolean hasGoogle() {
        return googleSubject != null && !googleSubject.isBlank();
    }

    /**
     * Iter 159 — true when the account *can only* authenticate via OAuth
     * (no local password). Used as a guard around every password-touching
     * operation: forgot-password, change-password, delete-account
     * (password-confirm).
     *
     * <p>Iter 167 rewrote this from `authProvider != EMAIL` to a
     * passwordHash-presence check, because the linking flows now allow:
     * <ul>
     *   <li>a GOOGLE-signup user to add a password ({@link #setInitialPassword}),
     *       after which they are no longer OAuth-only.</li>
     *   <li>an EMAIL-signup user to link Google ({@link #linkGoogle}),
     *       and still keep their password — they were never OAuth-only.</li>
     * </ul>
     * authProvider remains the *signup origin*, useful for analytics
     * but no longer the gating signal for password operations.
     */
    public boolean isOauthOnly() {
        return !hasPassword() && hasGoogle();
    }

    /**
     * Iter 167 — link a Google identity to an existing user.
     *
     * <p>Caller is responsible for verifying:
     * <ul>
     *   <li>the user is authenticated</li>
     *   <li>the Google ID token has been verified server-side</li>
     *   <li>the verified email matches {@link #getEmail()} (anti-hijack)</li>
     *   <li>no other user already has this googleSubject (anti-double-link)</li>
     * </ul>
     */
    public void linkGoogle(String googleSubject) {
        if (googleSubject == null || googleSubject.isBlank()) {
            throw new IllegalArgumentException("googleSubject required");
        }
        if (hasGoogle() && !googleSubject.equals(this.googleSubject)) {
            throw new IllegalStateException("User already linked to a different Google account");
        }
        this.googleSubject = googleSubject;
    }

    /**
     * Iter 167 — unlink a Google identity from a user.
     *
     * <p>The caller MUST verify the user still has a password ({@link #hasPassword()})
     * before unlinking, otherwise the user is locked out (no Google +
     * no password = no way back in).
     */
    public void unlinkGoogle() {
        this.googleSubject = null;
    }

    /**
     * Iter 167 — set the *initial* password for a user who signed up via
     * OAuth and didn't have one yet. Distinct from {@code changePassword}
     * which assumes there's already a password to verify against.
     *
     * <p>Caller responsibility: strength check + ensure {@link #hasPassword()}
     * is currently false before calling (otherwise they should be using
     * the change-password flow).
     */
    public void setInitialPassword(String hash) {
        if (hasPassword()) {
            throw new IllegalStateException(
                    "User already has a password — use changePassword instead");
        }
        this.passwordHash = hash;
    }
}
