package tn.bewerbi.common.api.exception;

/** 401 — authentication is required or has failed. */
public class UnauthorizedException extends DomainException {
    public UnauthorizedException(String message, String messageKey) { super(message, messageKey); }
    public static UnauthorizedException invalidCredentials() {
        return new UnauthorizedException("Invalid credentials", "error.auth.invalidCredentials");
    }
    public static UnauthorizedException missingToken() {
        return new UnauthorizedException("Missing authentication token", "error.auth.missingToken");
    }
    public static UnauthorizedException expiredToken() {
        return new UnauthorizedException("Authentication token expired", "error.auth.expiredToken");
    }
    @Override public int httpStatus() { return 401; }
    @Override public String code() { return "UNAUTHORIZED"; }
}
