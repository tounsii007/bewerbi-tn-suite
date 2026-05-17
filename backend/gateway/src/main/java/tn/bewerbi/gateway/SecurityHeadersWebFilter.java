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
        headers.setIfAbsent("Strict-Transport-Security",
                "max-age=63072000; includeSubDomains; preload");
        headers.setIfAbsent("X-Content-Type-Options", "nosniff");
        headers.setIfAbsent("X-Frame-Options", "DENY");
        headers.setIfAbsent("Referrer-Policy", "strict-origin-when-cross-origin");
        headers.setIfAbsent("Permissions-Policy",
                "geolocation=(), camera=(), microphone=(), payment=(), usb=()");
        headers.setIfAbsent("Cross-Origin-Opener-Policy", "same-origin");
        headers.setIfAbsent("Cross-Origin-Resource-Policy", "same-site");
        if (csp != null && !csp.isBlank()) {
            headers.setIfAbsent("Content-Security-Policy", csp);
        }
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }
}
