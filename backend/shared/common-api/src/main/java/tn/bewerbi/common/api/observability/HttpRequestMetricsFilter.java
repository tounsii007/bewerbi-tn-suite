package tn.bewerbi.common.api.observability;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Tag;
import io.micrometer.core.instrument.Tags;
import io.micrometer.core.instrument.Timer;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Records {@code http.request.duration} with method/status/outcome tags. Coexists with Spring
 * Boot's built-in {@code http.server.requests} — this one emits per-app tagging and the
 * coarser SUCCESS/CLIENT_ERROR/SERVER_ERROR outcome bucket, which keeps dashboards readable
 * even when error-status cardinality is high.
 *
 * <p>Only registered when a {@link MeterRegistry} bean exists.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
public class HttpRequestMetricsFilter extends OncePerRequestFilter {

    private final MeterRegistry registry;
    private final String appTag;

    public HttpRequestMetricsFilter(MeterRegistry registry, String appName) {
        this.registry = registry;
        this.appTag = appName;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(request, response);
        } finally {
            int status = response.getStatus();
            String outcome = status < 400 ? "SUCCESS"
                    : status < 500 ? "CLIENT_ERROR" : "SERVER_ERROR";

            Timer timer = Timer.builder("http.request.duration")
                    .description("HTTP request duration per app/method/status")
                    .tags(Tags.of(
                            Tag.of("app", appTag),
                            Tag.of("method", request.getMethod()),
                            Tag.of("status", String.valueOf(status)),
                            Tag.of("outcome", outcome)))
                    .publishPercentileHistogram(true)
                    .register(registry);

            timer.record(System.nanoTime() - start, TimeUnit.NANOSECONDS);
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnBean(MeterRegistry.class)
    public static class Config {
        @Bean
        public HttpRequestMetricsFilter httpRequestMetricsFilter(
                MeterRegistry registry,
                @org.springframework.beans.factory.annotation.Value(
                        "${spring.application.name:bewerbi-service}")
                String appName) {
            return new HttpRequestMetricsFilter(registry, appName);
        }
    }
}
