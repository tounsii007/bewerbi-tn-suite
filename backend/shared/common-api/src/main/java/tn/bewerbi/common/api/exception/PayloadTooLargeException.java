package tn.bewerbi.common.api.exception;

/** 413 — uploaded payload exceeds the per-endpoint or global limit. */
public class PayloadTooLargeException extends DomainException {
    public PayloadTooLargeException(String message, String messageKey) {
        super(message, messageKey);
    }
    public static PayloadTooLargeException of(long maxBytes) {
        return new PayloadTooLargeException(
                "Payload exceeds limit of " + maxBytes + " bytes",
                "error.payload.tooLarge");
    }
    @Override public int httpStatus() { return 413; }
    @Override public String code() { return "PAYLOAD_TOO_LARGE"; }
}
