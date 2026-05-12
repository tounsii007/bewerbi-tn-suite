package tn.bewerbi.common.api;

import java.time.Instant;
import java.util.List;
import org.slf4j.MDC;

/**
 * Canonical error envelope returned by every service.
 *
 * <p>Stable contract. Clients may rely on {@code code} and {@code messageKey} for handling and
 * localization respectively. The {@code traceId} is populated from MDC (Micrometer Tracing) and
 * lets operators correlate a 4xx/5xx response with the corresponding log lines and trace.
 */
public record ApiError(
        int status,
        String code,
        String message,
        /** Used as a key in the i18n-service for client-side translation. */
        String messageKey,
        List<FieldViolation> violations,
        /** Request path that produced the error (e.g. {@code /api/v1/profile/me}). */
        String path,
        /** Distributed-trace id (W3C trace-context) — empty if tracing is disabled. */
        String traceId,
        Instant timestamp) {

    public static ApiError of(int status, String code, String message, String messageKey) {
        return new ApiError(status, code, message, messageKey,
                List.of(), currentPath(), currentTraceId(), Instant.now());
    }

    public static ApiError of(int status, String code, String message, String messageKey,
                              List<FieldViolation> violations) {
        return new ApiError(status, code, message, messageKey,
                violations, currentPath(), currentTraceId(), Instant.now());
    }

    public record FieldViolation(String field, String message, String messageKey) {}

    private static String currentTraceId() {
        String t = MDC.get("traceId");
        return t == null ? "" : t;
    }

    private static String currentPath() {
        String p = MDC.get("path");
        return p == null ? "" : p;
    }
}
