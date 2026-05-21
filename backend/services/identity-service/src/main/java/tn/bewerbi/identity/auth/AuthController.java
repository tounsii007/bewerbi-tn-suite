package tn.bewerbi.identity.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.bewerbi.common.api.CurrentUser;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public AuthService.AuthResponse register(@Valid @RequestBody AuthService.RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@Valid @RequestBody AuthService.LoginRequest req) {
        return authService.login(req);
    }

    /**
     * Iter 160 — Sign in (or auto-sign-up) with a Google ID token.
     *
     * <p>The web/mobile client exchanges Google's OAuth pop-up for an
     * ID token (a JWT signed by Google) and posts it here. We verify
     * it server-side against Google's JWKS, then either:
     * <ul>
     *   <li>issue tokens for the matched user, or</li>
     *   <li>create a new user (provider=GOOGLE) and issue tokens.</li>
     * </ul>
     * Returns the same {@link AuthService.AuthResponse} shape as
     * {@code /login} so the client treats both paths identically once
     * the JWT is in hand.
     */
    @PostMapping("/google")
    @Operation(summary = "Sign in / sign up via a Google ID token")
    public AuthService.AuthResponse google(@Valid @RequestBody
                                           AuthService.GoogleLoginRequest req) {
        return authService.googleLogin(req);
    }

    @PostMapping("/refresh")
    public AuthService.AuthResponse refresh(@RequestBody RefreshRequest req) {
        return authService.refresh(req.refreshToken());
    }

    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public void logout(@RequestBody RefreshRequest req) {
        authService.logout(CurrentUser.id(), req.refreshToken());
    }

    @PostMapping("/logout-all")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Revoke every refresh token of the current user")
    public void logoutAll() {
        authService.logoutAll(CurrentUser.id());
    }

    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
    }

    /**
     * Re-issue the verification email. Always 204 (anti-enumeration).
     * Same per-account throttle as /password/forgot: while a fresh
     * token is alive the call silently no-ops.
     */
    @PostMapping("/verify-email/resend")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Re-issue the verification email (always 204)")
    public void resendVerification(@Valid @RequestBody
                                   AuthService.ResendVerificationRequest req) {
        authService.resendVerification(req.email());
    }

    /**
     * Request a password reset. Always returns 204 — caller cannot tell
     * whether the address is registered (anti-enumeration). Notification
     * happens asynchronously over Kafka.
     */
    @PostMapping("/password/forgot")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Request a password-reset email (always 204)")
    public void forgotPassword(@Valid @RequestBody AuthService.ForgotPasswordRequest req) {
        authService.requestPasswordReset(req.email());
    }

    @PostMapping("/password/reset")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Consume a reset token and set a new password")
    public void resetPassword(@Valid @RequestBody AuthService.ResetPasswordRequest req) {
        authService.resetPassword(req.token(), req.newPassword());
    }

    @PostMapping("/password/change")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Change password while authenticated; signs out every device")
    public void changePassword(@Valid @RequestBody AuthService.ChangePasswordRequest req) {
        authService.changePassword(CurrentUser.id(), req.oldPassword(), req.newPassword());
    }

    /**
     * Iter 167 — set the *initial* password for a Google-only user.
     * Returns 409 if the account already has a password (use
     * /password/change instead).
     */
    @PostMapping("/password/set-initial")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Set initial password for an OAuth-only account")
    public void setInitialPassword(@Valid @RequestBody AuthService.SetPasswordRequest req) {
        authService.setInitialPassword(CurrentUser.id(), req.newPassword());
    }

    /**
     * Iter 167 — link a Google identity to the current account so the
     * user can log in via either email/password OR Google. The token's
     * email must match the account's email (anti-hijack).
     */
    @PostMapping("/me/link-google")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Link a Google identity to the current account")
    public void linkGoogle(@Valid @RequestBody AuthService.GoogleLoginRequest req) {
        authService.linkGoogle(CurrentUser.id(), req);
    }

    /**
     * Iter 167 — remove the Google link from the current account.
     * Hard-rejected with 409 if the account has no password
     * (otherwise the user would be locked out).
     */
    @PostMapping("/me/unlink-google")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove the Google link from the current account")
    public void unlinkGoogle() {
        authService.unlinkGoogle(CurrentUser.id());
    }

    // The former /internal/users/{userId}/verification-token endpoint was
    // removed in Iter 39: the DB now stores SHA-256 of the verification
    // token, so a service-to-service call could only return the hash —
    // useless. notification-service already receives the *plain* token
    // via the UserRegistered Kafka event published in register(), which
    // remains the single channel for the plain value.

    /**
     * List every active refresh-token "session" for the current user.
     * Returned hashes are stable handles the client uses to call
     * {@link #revokeSession(String)} — the plain token never crosses
     * the wire from the server side.
     */
    @GetMapping("/me/sessions")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "List active refresh-token sessions of the current user")
    public java.util.List<tn.bewerbi.identity.auth.RefreshTokenStore.SessionInfo> mySessions() {
        return authService.listSessions(CurrentUser.id());
    }

    /**
     * Iter 160 — recent login attempts (success + failure) for the
     * current user. Powers the "recent activity" panel in /settings —
     * a user can scan for sign-ins they didn't make and force a
     * password reset / revoke sessions if something looks off.
     *
     * <p>{@code limit} is clamped server-side to [1, 100].
     */
    @GetMapping("/me/activity")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Recent login attempts (success + failure) for the current user")
    public java.util.List<tn.bewerbi.identity.domain.LoginAttempt> myActivity(
            @org.springframework.web.bind.annotation.RequestParam(value = "limit",
                    defaultValue = "20") int limit) {
        return authService.recentLoginAttempts(CurrentUser.id(), limit);
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/me/sessions/{tokenHash}")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Revoke a single session by its token hash")
    public void revokeSession(@org.springframework.web.bind.annotation.PathVariable
                              String tokenHash) {
        authService.revokeSession(CurrentUser.id(), tokenHash);
    }

    /**
     * GDPR Art. 17 right-to-erasure. The user re-enters their password
     * for confirmation; success deletes the account and signs out every
     * device. Downstream services anonymise their per-user copies in
     * response to the USER_DELETED Kafka event.
     */
    @PostMapping("/me/delete")
    @PreAuthorize("isAuthenticated()")
    @org.springframework.web.bind.annotation.ResponseStatus(
            org.springframework.http.HttpStatus.NO_CONTENT)
    @Operation(summary = "Permanently delete the current account (requires password)")
    public void deleteAccount(@Valid @RequestBody AuthService.DeleteAccountRequest req) {
        authService.deleteAccount(CurrentUser.id(), req.password());
    }

    /**
     * "Sign out everywhere except this device". The client passes the
     * SHA-256 of *its* refresh token as a query parameter; that one is
     * preserved, every other session for the user is revoked.
     */
    @PostMapping("/me/sessions/revoke-others")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Revoke every session of the current user except keepHash")
    public RevokedResponse revokeOtherSessions(
            @org.springframework.web.bind.annotation.RequestParam(value = "keepHash",
                    required = false) String keepHash) {
        return new RevokedResponse(authService.revokeAllExcept(CurrentUser.id(), keepHash));
    }

    public record RefreshRequest(String refreshToken) {}
    public record RevokedResponse(int revoked) {}
}
