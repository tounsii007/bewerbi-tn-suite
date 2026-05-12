package tn.bewerbi.common.api.exception;

/** 403 — caller is authenticated but lacks permission for the resource/operation. */
public class ForbiddenException extends DomainException {
    public ForbiddenException(String message, String messageKey) { super(message, messageKey); }
    public static ForbiddenException of(String action) {
        return new ForbiddenException(
                "Forbidden: " + action,
                "error.forbidden." + action.replace(' ', '_').toLowerCase());
    }
    @Override public int httpStatus() { return 403; }
    @Override public String code() { return "FORBIDDEN"; }
}
