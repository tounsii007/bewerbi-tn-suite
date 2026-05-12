package tn.bewerbi.common.api;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

class ApiErrorTest {

    @AfterEach
    void clearMdc() {
        MDC.clear();
    }

    @Test
    void picks_up_traceId_and_path_from_mdc() {
        MDC.put("traceId", "abc123");
        MDC.put("path", "/api/v1/profile/me");

        ApiError err = ApiError.of(404, "NOT_FOUND", "msg", "error.notFound");

        assertThat(err.traceId()).isEqualTo("abc123");
        assertThat(err.path()).isEqualTo("/api/v1/profile/me");
        assertThat(err.status()).isEqualTo(404);
        assertThat(err.code()).isEqualTo("NOT_FOUND");
        assertThat(err.messageKey()).isEqualTo("error.notFound");
        assertThat(err.violations()).isEmpty();
        assertThat(err.timestamp()).isNotNull();
    }

    @Test
    void empty_strings_when_mdc_missing() {
        ApiError err = ApiError.of(500, "ERR", "boom", "error.internal");
        assertThat(err.traceId()).isEmpty();
        assertThat(err.path()).isEmpty();
    }

    @Test
    void violations_are_propagated() {
        var v = java.util.List.of(
                new ApiError.FieldViolation("email", "must be valid", "error.email.invalid"));
        ApiError err = ApiError.of(400, "VALIDATION_FAILED", "msg", "error.validation.failed", v);
        assertThat(err.violations()).hasSize(1);
        assertThat(err.violations().get(0).field()).isEqualTo("email");
    }
}
