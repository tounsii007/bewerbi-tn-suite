package tn.bewerbi.common.api;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Import;

/**
 * Auto-registers {@link GlobalExceptionHandler} and {@link RequestContextFilter} for every
 * Spring-Boot service that has {@code common-api} on the classpath. No
 * {@code @Import(GlobalExceptionHandler.class)} needed in each service.
 *
 * <p>Wired via {@code META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports}.
 */
@AutoConfiguration
@ConditionalOnWebApplication
@Import({
    GlobalExceptionHandler.class,
    RequestContextFilter.Config.class,
    tn.bewerbi.common.api.observability.SlowRequestLogger.Config.class,
    tn.bewerbi.common.api.observability.HttpRequestMetricsFilter.Config.class,
    tn.bewerbi.common.api.idempotency.IdempotencyFilter.Config.class,
    // Iter 116: request body size limit for non-multipart endpoints.
    ContentSizeFilter.Config.class,
})
public class CommonApiAutoConfiguration {
}
