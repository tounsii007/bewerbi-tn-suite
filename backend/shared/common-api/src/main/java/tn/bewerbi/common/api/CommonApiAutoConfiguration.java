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
@Import({GlobalExceptionHandler.class, RequestContextFilter.Config.class})
public class CommonApiAutoConfiguration {
}
