package tn.bewerbi.common.api.exception;

/** 429 — caller exceeded a rate limit. */
public class TooManyRequestsException extends DomainException {
    private final long retryAfterSeconds;
    public TooManyRequestsException(String message, String messageKey, long retryAfterSeconds) {
        super(message, messageKey);
        this.retryAfterSeconds = retryAfterSeconds;
    }
    public long retryAfterSeconds() { return retryAfterSeconds; }
    public static TooManyRequestsException of(long retryAfter) {
        return new TooManyRequestsException(
                "Rate limit exceeded; retry after " + retryAfter + "s",
                "error.rate.limited", retryAfter);
    }
    @Override public int httpStatus() { return 429; }
    @Override public String code() { return "TOO_MANY_REQUESTS"; }
}
