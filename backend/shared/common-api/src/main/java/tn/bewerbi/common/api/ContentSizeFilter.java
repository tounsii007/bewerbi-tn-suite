package tn.bewerbi.common.api;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Iter 116 — global request-body size cap for JSON/non-multipart endpoints.
 *
 * <h2>Problem</h2>
 * Previously only {@code multipart/form-data} uploads had a size limit
 * ({@code spring.servlet.multipart.max-request-size}).  JSON endpoints had no
 * limit at all, making them trivially exploitable for memory exhaustion or
 * DoS by sending multi-GB request bodies.
 *
 * <h2>Two-layer defence</h2>
 * <ol>
 *   <li><b>Content-Length fast path</b> (this filter): if the client declares
 *       a {@code Content-Length} header that exceeds the limit, the filter
 *       returns {@code 413 Payload Too Large} immediately, before the request
 *       body is read into heap memory at all.</li>
 *   <li><b>InputStream wrapper slow path</b>: for chunked transfers without
 *       {@code Content-Length}, the input stream is wrapped so that reading
 *       beyond the limit throws a {@link BodyTooLargeException} that the
 *       filter catches and converts to a 413.</li>
 * </ol>
 *
 * <h2>Exclusion</h2>
 * {@code multipart/*} requests are excluded — they are already gated by
 * {@code spring.servlet.multipart.max-request-size} in each service.
 *
 * <h2>Configuration</h2>
 * {@code bewerbi.security.request.max-body-bytes} — default 2 097 152 (2 MB).
 * Override per service in {@code application.yml} if an endpoint legitimately
 * needs larger JSON bodies (rare; prefer paging or streaming instead).
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class ContentSizeFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(ContentSizeFilter.class);

    private final long maxBodyBytes;

    public ContentSizeFilter(long maxBodyBytes) {
        this.maxBodyBytes = maxBodyBytes;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {

        String ct = request.getContentType();
        // Multipart is handled separately by Spring's MultipartResolver.
        if (ct != null && ct.toLowerCase(java.util.Locale.ROOT).startsWith("multipart/")) {
            chain.doFilter(request, response);
            return;
        }

        // Fast path — Content-Length header present and over the limit.
        long declared = request.getContentLengthLong();
        if (declared > maxBodyBytes) {
            log.warn("ContentSizeFilter: rejecting request — Content-Length {} > limit {} path={}",
                    declared, maxBodyBytes, request.getRequestURI());
            sendOversize(response);
            return;
        }

        // Slow path — wrap the input stream so chunked bodies are caught too.
        try {
            chain.doFilter(new BoundedRequestWrapper(request, maxBodyBytes), response);
        } catch (BodyTooLargeException ex) {
            if (!response.isCommitted()) {
                log.warn("ContentSizeFilter: request body exceeded {} bytes (chunked) path={}",
                        maxBodyBytes, request.getRequestURI());
                response.reset();
                sendOversize(response);
            }
        }
    }

    private void sendOversize(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.PAYLOAD_TOO_LARGE.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + ";charset=UTF-8");
        response.getWriter().write(
                "{\"status\":413,\"error\":\"PAYLOAD_TOO_LARGE\","
                        + "\"message\":\"Request body exceeds the maximum allowed size\"}");
    }

    // ── Wrappers ──────────────────────────────────────────────────────────────

    private static final class BodyTooLargeException extends IOException {
        BodyTooLargeException(long limit) {
            super("Request body exceeds " + limit + " bytes");
        }
    }

    private final class BoundedRequestWrapper extends HttpServletRequestWrapper {
        private final long limit;

        BoundedRequestWrapper(HttpServletRequest request, long limit) {
            super(request);
            this.limit = limit;
        }

        @Override
        public ServletInputStream getInputStream() throws IOException {
            return new LimitingStream(super.getInputStream(), limit);
        }
    }

    private final class LimitingStream extends ServletInputStream {
        private final ServletInputStream delegate;
        private long remaining;

        LimitingStream(ServletInputStream delegate, long limit) {
            this.delegate = delegate;
            this.remaining = limit;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) throw new BodyTooLargeException(maxBodyBytes);
            int b = delegate.read();
            if (b != -1) remaining--;
            return b;
        }

        @Override
        public int read(byte[] buf, int off, int len) throws IOException {
            if (remaining <= 0) throw new BodyTooLargeException(maxBodyBytes);
            int toRead = (int) Math.min(len, remaining);
            int n = delegate.read(buf, off, toRead);
            if (n > 0) remaining -= n;
            return n;
        }

        @Override
        public boolean isFinished() { return delegate.isFinished(); }
        @Override
        public boolean isReady()    { return delegate.isReady(); }
        @Override
        public void setReadListener(ReadListener rl) { delegate.setReadListener(rl); }
    }

    // ── Auto-wiring ───────────────────────────────────────────────────────────

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    public static class Config {
        @Bean
        public ContentSizeFilter contentSizeFilter(
                @org.springframework.beans.factory.annotation.Value(
                        "${bewerbi.security.request.max-body-bytes:2097152}") long maxBodyBytes) {
            return new ContentSizeFilter(maxBodyBytes);
        }
    }
}
