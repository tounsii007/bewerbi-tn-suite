package tn.bewerbi.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Reactive variant of the servlet {@code SecurityHeadersFilter} used by services. Wraps every
 * gateway response — including those proxied from downstream — with defense-in-depth headers.
 *
 * <p>HSTS, no-sniff, no-frame, conservative Referrer-Policy, restricted Permissions-Policy,
 * cross-origin isolation. Anything Swagger UI needs is opted in via the {@code csp} property.
 */
@Component
public class SecurityHeadersWebFilter implements WebFilter, Ordered {

    private final String csp;

    public SecurityHeadersWebFilter(
            @Value("${bewerbi.security.headers.csp:default-src 'none'; frame-ancestors 'none'}")
            String csp) {
        this.csp = csp;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        HttpHeaders headers = exchange.getResponse().getHeaders();
        // 2y max-age + preload — matches the web-side HSTS from Iter 71
        // and the per-service one from Iter 90 so every response —
        // proxied or local — speaks the same preload-eligible policy.
        setIfAbsent(headers, "Strict-Transport-Security",
                "max-age=63072000; includeSubDomains; preload");
        setIfAbsent(headers, "X-Content-Type-Options", "nosniff");
        setIfAbsent(headers, "X-Frame-Options", "DENY");
        setIfAbsent(headers, "Referrer-Policy", "strict-origin-when-cross-origin");
        // Match the servlet filter's expanded Permissions-Policy
        // (Iter 91) so gateway-handled error responses (4xx from the
        // route matcher, rate-limiter, etc.) emit the same strict
        // policy as proxied responses.
        setIfAbsent(headers, "Permissions-Policy",
                "accelerometer=(), ambient-light-sensor=(), autoplay=(), "
                        + "battery=(), camera=(), display-capture=(), "
                        + "document-domain=(), encrypted-media=(), "
                        + "execution-while-not-rendered=(), "
                        + "execution-while-out-of-viewport=(), "
                        + "fullscreen=(), gamepad=(), geolocation=(), "
                        + "gyroscope=(), hid=(), idle-detection=(), "
                        + "magnetometer=(), microphone=(), midi=(), "
                        + "payment=(), picture-in-picture=(), "
                        + "publickey-credentials-get=(), "
                        + "screen-wake-lock=(), serial=(), "
                        + "sync-xhr=(), usb=(), web-share=(), "
                        + "xr-spatial-tracking=()");
        setIfAbsent(headers, "Cross-Origin-Opener-Policy", "same-origin");
        setIfAbsent(headers, "Cross-Origin-Resource-Policy", "same-site");
        setIfAbsent(headers, "Origin-Agent-Cluster", "?1");
        if (csp != null && !csp.isBlank()) {
            setIfAbsent(headers, "Content-Security-Policy", csp);
        }
        return chain.filter(exchange);
    }

    /** HttpHeaders lost {@code setIfAbsent} between Spring 6 versions,
     *  so reimplement on top of {@code containsHeader}. Single-value set;
     *  matches the original semantics — first one in wins.
     *  (Spring 7 dropped Map-style {@code containsKey}; use {@code containsHeader}.) */
    private static void setIfAbsent(HttpHeaders headers, String name, String value) {
        if (!headers.containsHeader(name)) {
            headers.set(name, value);
        }
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
