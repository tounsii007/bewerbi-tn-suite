package tn.bewerbi.common.api.exception;

/** 503 — a downstream dependency (DB, Redis, sister-service) is temporarily unavailable. */
public class ServiceUnavailableException extends DomainException {
    public ServiceUnavailableException(String message, String messageKey) {
        super(message, messageKey);
    }
    public static ServiceUnavailableException downstream(String service) {
        return new ServiceUnavailableException(
                "Downstream service unavailable: " + service,
                "error.service.unavailable");
    }
    @Override public int httpStatus() { return 503; }
    @Override public String code() { return "SERVICE_UNAVAILABLE"; }
}
