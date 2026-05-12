package tn.bewerbi.common.api.idempotency;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Idempotency for unsafe endpoints. Clients pass {@code Idempotency-Key: <uuid>} on
 * {@code POST}, {@code PUT}, {@code PATCH}. The first response (status + body) is cached in
 * Redis for {@code bewerbi.idempotency.ttlSeconds} (default 24h). Subsequent calls with the
 * same key return the cached response — important for mobile networks where a request might
 * succeed server-side but the response gets lost.
 *
 * <p>Only enabled when Redis is on the classpath.
 *
 * <p>Stripe's behaviour: only the first response under a key is binding; anything else returns
 * the cached one. We follow that contract.
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 30)
public class IdempotencyFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(IdempotencyFilter.class);
    public static final String HEADER = "Idempotency-Key";
    private static final String KEY_PREFIX = "idem:";

    private final StringRedisTemplate redis;
    private final Duration ttl;

    public IdempotencyFilter(StringRedisTemplate redis, long ttlSeconds) {
        this.redis = redis;
        this.ttl = Duration.ofSeconds(ttlSeconds);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String method = request.getMethod();
        if (!isUnsafe(method)) {
            chain.doFilter(request, response);
            return;
        }
        String key = request.getHeader(HEADER);
        if (key == null || key.isBlank()) {
            chain.doFilter(request, response);
            return;
        }
        // Validate UUID format to reject random junk keys before hitting Redis.
        try {
            UUID.fromString(key);
        } catch (IllegalArgumentException e) {
            response.sendError(400, "Idempotency-Key must be a UUID");
            return;
        }

        String redisKey = KEY_PREFIX + key;
        String cached = redis.opsForValue().get(redisKey);
        if (cached != null) {
            log.debug("idempotency-hit key={}", key);
            String[] parts = cached.split("\n", 2);
            int status = Integer.parseInt(parts[0]);
            response.setStatus(status);
            response.setHeader("X-Idempotent-Replayed", "true");
            if (parts.length > 1) {
                response.setContentType("application/json");
                response.getWriter().write(parts[1]);
            }
            return;
        }

        CaptureResponseWrapper captured = new CaptureResponseWrapper(response);
        chain.doFilter(request, captured);
        // Cache only 2xx/4xx — never 5xx, those are transient.
        int status = captured.getStatus();
        if (status >= 200 && status < 500 && status >= 200) {
            String body = captured.getBodyAsString();
            redis.opsForValue().set(redisKey, status + "\n" + body, ttl);
        }
        captured.flushBuffer();
    }

    private static boolean isUnsafe(String method) {
        return "POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method);
    }

    /**
     * Wrapper that buffers the response body so we can read it back for caching after the
     * controller writes it. Lossless — the buffered bytes are flushed to the real response at
     * the end of the filter.
     */
    private static class CaptureResponseWrapper extends HttpServletResponseWrapper {
        private final ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        private final PrintWriter writer = new PrintWriter(buffer);

        CaptureResponseWrapper(HttpServletResponse response) {
            super(response);
        }

        @Override
        public PrintWriter getWriter() {
            return writer;
        }

        String getBodyAsString() {
            writer.flush();
            return buffer.toString(StandardCharsets.UTF_8);
        }

        @Override
        public void flushBuffer() throws IOException {
            writer.flush();
            byte[] data = buffer.toByteArray();
            getResponse().setContentLength(data.length);
            getResponse().getOutputStream().write(data);
            super.flushBuffer();
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnBean(StringRedisTemplate.class)
    public static class Config {
        @Bean
        public IdempotencyFilter idempotencyFilter(
                StringRedisTemplate redis,
                @Value("${bewerbi.idempotency.ttlSeconds:86400}") long ttlSeconds) {
            return new IdempotencyFilter(redis, ttlSeconds);
        }
    }
}
