package tn.bewerbi.common.api.exception;

/**
 * 422 — the request is syntactically valid but semantically inconsistent. Use this for business-
 * rule violations (e.g. "start date after end date") that {@code @Valid} cannot express.
 */
public class UnprocessableEntityException extends DomainException {
    public UnprocessableEntityException(String message, String messageKey) {
        super(message, messageKey);
    }
    @Override public int httpStatus() { return 422; }
    @Override public String code() { return "UNPROCESSABLE_ENTITY"; }
}
