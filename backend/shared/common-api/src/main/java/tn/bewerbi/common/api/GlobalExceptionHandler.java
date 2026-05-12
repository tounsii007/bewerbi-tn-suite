package tn.bewerbi.common.api;

import jakarta.validation.ConstraintViolationException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.NoHandlerFoundException;
import tn.bewerbi.common.api.exception.DomainException;
import tn.bewerbi.common.api.exception.TooManyRequestsException;

/**
 * Single exception → {@link ApiError} mapping for every service. Imported via the
 * {@code @Import(GlobalExceptionHandler.class)} pattern (or via
 * {@code spring.factories} once we wire that up in Iter 3+).
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /* ───────────────────────── Domain ───────────────────────── */

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<ApiError> tooManyRequests(TooManyRequestsException ex) {
        HttpHeaders h = new HttpHeaders();
        h.add(HttpHeaders.RETRY_AFTER, String.valueOf(ex.retryAfterSeconds()));
        return ResponseEntity.status(ex.httpStatus())
                .headers(h)
                .body(ApiError.of(ex.httpStatus(), ex.code(), ex.getMessage(), ex.messageKey()));
    }

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiError> domain(DomainException ex) {
        if (ex.httpStatus() >= 500) {
            log.error("Domain 5xx [{}] {}", ex.code(), ex.getMessage(), ex);
        } else {
            log.debug("Domain {}: [{}] {}", ex.httpStatus(), ex.code(), ex.getMessage());
        }
        return ResponseEntity.status(ex.httpStatus())
                .body(ApiError.of(ex.httpStatus(), ex.code(), ex.getMessage(), ex.messageKey()));
    }

    /* ───────────────────────── Validation ───────────────────────── */

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException ex) {
        List<ApiError.FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldViolation(
                        fe.getField(),
                        fe.getDefaultMessage(),
                        "error.validation." + fe.getField()))
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "VALIDATION_FAILED",
                        "Request validation failed", "error.validation.failed", violations));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> constraint(ConstraintViolationException ex) {
        List<ApiError.FieldViolation> violations = ex.getConstraintViolations().stream()
                .map(v -> new ApiError.FieldViolation(
                        v.getPropertyPath().toString(),
                        v.getMessage(),
                        "error.validation." + v.getPropertyPath()))
                .toList();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "VALIDATION_FAILED",
                        "Constraint violations", "error.validation.failed", violations));
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> missingParam(MissingServletRequestParameterException ex) {
        List<ApiError.FieldViolation> v = List.of(new ApiError.FieldViolation(
                ex.getParameterName(),
                "Required parameter is missing",
                "error.param.missing." + ex.getParameterName()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "MISSING_PARAMETER",
                        "Required request parameter missing: " + ex.getParameterName(),
                        "error.param.missing", v));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> typeMismatch(MethodArgumentTypeMismatchException ex) {
        String expected = ex.getRequiredType() == null ? "?" : ex.getRequiredType().getSimpleName();
        List<ApiError.FieldViolation> v = List.of(new ApiError.FieldViolation(
                ex.getName(),
                "Expected type " + expected,
                "error.param.typeMismatch"));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "TYPE_MISMATCH",
                        "Parameter type mismatch: " + ex.getName(),
                        "error.param.typeMismatch", v));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> notReadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiError.of(400, "MALFORMED_JSON",
                        "Malformed request body", "error.body.malformed"));
    }

    /* ───────────────────────── HTTP plumbing ───────────────────────── */

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> methodNotAllowed(HttpRequestMethodNotSupportedException ex) {
        HttpHeaders h = new HttpHeaders();
        if (ex.getSupportedHttpMethods() != null) {
            h.setAllow(ex.getSupportedHttpMethods());
        }
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .headers(h)
                .body(ApiError.of(405, "METHOD_NOT_ALLOWED",
                        "Method not allowed: " + ex.getMethod(),
                        "error.http.methodNotAllowed"));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> mediaType(HttpMediaTypeNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiError.of(415, "UNSUPPORTED_MEDIA_TYPE",
                        "Unsupported media type: " + ex.getContentType(),
                        "error.http.unsupportedMediaType"));
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> notFound(NoHandlerFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiError.of(404, "NOT_FOUND",
                        "No handler for " + ex.getHttpMethod() + " " + ex.getRequestURL(),
                        "error.http.notFound"));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiError> uploadTooLarge(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ApiError.of(413, "PAYLOAD_TOO_LARGE",
                        "Upload exceeds the size limit",
                        "error.payload.tooLarge"));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> responseStatus(ResponseStatusException ex) {
        int s = ex.getStatusCode().value();
        return ResponseEntity.status(s)
                .body(ApiError.of(s,
                        ex.getStatusCode().is4xxClientError() ? "CLIENT_ERROR" : "SERVER_ERROR",
                        ex.getReason() == null ? "Request failed" : ex.getReason(),
                        "error.http." + s));
    }

    /* ───────────────────────── Security ───────────────────────── */

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> accessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiError.of(403, "FORBIDDEN", "Access denied", "error.forbidden"));
    }

    @ExceptionHandler({AuthenticationException.class,
                       AuthenticationCredentialsNotFoundException.class})
    public ResponseEntity<ApiError> authentication(Exception ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiError.of(401, "UNAUTHORIZED",
                        "Authentication required", "error.auth.required"));
    }

    /* ───────────────────────── Persistence ───────────────────────── */

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrity(DataIntegrityViolationException ex) {
        log.warn("Data integrity violation: {}", ex.getMostSpecificCause().getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(409, "DATA_INTEGRITY",
                        "Data conflict — the request violates a database constraint",
                        "error.data.integrity"));
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> optimistic(OptimisticLockingFailureException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiError.of(409, "STALE_RESOURCE",
                        "Resource was modified concurrently — reload and retry",
                        "error.data.stale"));
    }

    /* ───────────────────────── Fallback ───────────────────────── */

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> generic(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError()
                .body(ApiError.of(500, "INTERNAL_ERROR",
                        "Something went wrong", "error.internal"));
    }
}
