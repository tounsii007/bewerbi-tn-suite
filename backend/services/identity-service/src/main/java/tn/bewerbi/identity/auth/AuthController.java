package tn.bewerbi.identity.auth;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.bewerbi.common.api.CurrentUser;
import tn.bewerbi.common.api.exception.ResourceNotFoundException;
import tn.bewerbi.identity.domain.UserRepository;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;
    private final UserRepository users;

    public AuthController(AuthService authService, UserRepository users) {
        this.authService = authService;
        this.users = users;
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

    /**
     * Internal endpoint used by notification-service to obtain the freshly
     * minted verification token when sending the welcome e-mail. Gated on the
     * INTERNAL role so only signed-in services (never the public web client)
     * can call it.
     */
    @GetMapping("/internal/users/{userId}/verification-token")
    @PreAuthorize("hasRole('INTERNAL') or hasRole('ADMIN')")
    public TokenResponse verificationTokenFor(@PathVariable UUID userId) {
        var user = users.findById(userId)
                .orElseThrow(() -> ResourceNotFoundException.of("User", userId));
        return new TokenResponse(user.getEmailVerificationToken());
    }

    public record RefreshRequest(String refreshToken) {}
    public record TokenResponse(String token) {}
}
