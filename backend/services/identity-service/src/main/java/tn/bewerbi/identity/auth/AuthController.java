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

    // The former /internal/users/{userId}/verification-token endpoint was
    // removed in Iter 39: the DB now stores SHA-256 of the verification
    // token, so a service-to-service call could only return the hash —
    // useless. notification-service already receives the *plain* token
    // via the UserRegistered Kafka event published in register(), which
    // remains the single channel for the plain value.

    public record RefreshRequest(String refreshToken) {}
}
