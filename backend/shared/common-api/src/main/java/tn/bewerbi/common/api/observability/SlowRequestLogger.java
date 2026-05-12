package tn.bewerbi.common.api.observability;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Emits a WARN line for any request that exceeds the configured threshold. Cheap noticeboard
 * for "what's been slow today" — pair with the percentile histogram for context.
 *
 * Threshold defaults to 1500 ms; configure via {@code bewerbi.observability.slowRequestMs}.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 25)
public class SlowRequestLogger extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger("slow.request");

    private final long thresholdMs;

    public SlowRequestLogger(long thresholdMs) {
        this.thresholdMs = thresholdMs;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        long start = System.nanoTime();
        try {
            chain.doFilter(request, response);
        } finally {
            long ms = (System.nanoTime() - start) / 1_000_000L;
            if (ms >= thresholdMs) {
                log.warn("slow {} {} status={} duration={}ms",
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus(),
                        ms);
            }
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    public static class Config {
        @Bean
        public SlowRequestLogger slowRequestLogger(
                @Value("${bewerbi.observability.slowRequestMs:1500}") long thresholdMs) {
            return new SlowRequestLogger(thresholdMs);
        }
    }
}
