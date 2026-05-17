package tn.bewerbi.common.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Populates MDC with {@code path}, {@code method} and {@code correlationId} for every request so
 * every log line in the request scope is automatically tagged. Also echoes the correlation id
 * back in the {@code X-Correlation-Id} response header.
 *
 * <p>Auto-registered for each service via {@link RequestContextFilter.Config}.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RequestContextFilter extends OncePerRequestFilter {

    public static final String HEADER_CORRELATION_ID = "X-Correlation-Id";
    public static final String MDC_PATH = "path";
    public static final String MDC_METHOD = "method";
    public static final String MDC_CORRELATION_ID = "correlationId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String correlationId = request.getHeader(HEADER_CORRELATION_ID);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }
        try {
            MDC.put(MDC_PATH, request.getRequestURI());
            MDC.put(MDC_METHOD, request.getMethod());
            MDC.put(MDC_CORRELATION_ID, correlationId);
            response.setHeader(HEADER_CORRELATION_ID, correlationId);
            chain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_PATH);
            MDC.remove(MDC_METHOD);
            MDC.remove(MDC_CORRELATION_ID);
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    public static class Config {
        // Bean name must NOT be `requestContextFilter` — Spring's
        // WebMvcAutoConfiguration already defines one under that exact
        // name (for the framework's own RequestContextHolder filter)
        // and bean-overriding is disabled by default in Boot 3.
        @org.springframework.context.annotation.Bean("bewerbiRequestContextFilter")
        public RequestContextFilter bewerbiRequestContextFilter() {
            return new RequestContextFilter();
        }
    }
}
