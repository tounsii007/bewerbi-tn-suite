package tn.bewerbi.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Adds defense-in-depth response headers to every service response.
 *
 * <p>Defaults err on the strict side; services that serve HTML (Swagger UI) can override
 * Content-Security-Policy via {@code bewerbi.security.headers.csp}.
 *
 * <table>
 *   <tr><th>Header</th><th>Value</th><th>Reason</th></tr>
 *   <tr><td>Strict-Transport-Security</td><td>max-age=31536000; includeSubDomains</td>
 *       <td>Force HTTPS for one year</td></tr>
 *   <tr><td>X-Content-Type-Options</td><td>nosniff</td>
 *       <td>Disable MIME sniffing</td></tr>
 *   <tr><td>X-Frame-Options</td><td>DENY</td>
 *       <td>Block clickjacking via iframe embedding</td></tr>
 *   <tr><td>Referrer-Policy</td><td>strict-origin-when-cross-origin</td>
 *       <td>Leak less to third parties</td></tr>
 *   <tr><td>Permissions-Policy</td><td>geolocation=(), camera=(), microphone=()</td>
 *       <td>Disable rarely-used browser APIs</td></tr>
 *   <tr><td>Cross-Origin-Opener-Policy</td><td>same-origin</td>
 *       <td>Isolate browsing context</td></tr>
 *   <tr><td>Cross-Origin-Resource-Policy</td><td>same-site</td>
 *       <td>Prevent cross-origin loads</td></tr>
 * </table>
 */
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class SecurityHeadersFilter extends OncePerRequestFilter {

    private final String csp;

    public SecurityHeadersFilter(String csp) {
        this.csp = csp;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 2y max-age + preload — matches the web HSTS shipped in Iter 71
        // so a request that hits the API directly (mobile + Flutter) also
        // gets the preload directive. Removal takes months once you've
        // submitted to hstspreload.org, so verify every subdomain is
        // HTTPS-only before going live.
        response.setHeader("Strict-Transport-Security",
                "max-age=63072000; includeSubDomains; preload");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        // Deny every powerful browser feature by default — the API
        // never serves HTML, but a 4xx body rendered as text/plain
        // still inherits these headers, so a confused tab can't grant
        // a feature it never asked for. Expanded list covers every
        // permission policy directive Chromium currently knows about.
        response.setHeader("Permissions-Policy",
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
        response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        response.setHeader("Cross-Origin-Resource-Policy", "same-site");
        // Origin-Agent-Cluster: opts the response into an origin-keyed
        // agent cluster so a same-site iframe (if any slips past
        // frame-ancestors) can't synchronously access this origin's
        // globals. Cheap, no downside for JSON APIs.
        response.setHeader("Origin-Agent-Cluster", "?1");
        if (csp != null && !csp.isBlank()) {
            response.setHeader("Content-Security-Policy", csp);
        }

        // Token-bearing and per-user responses must never be cached by
        // an intermediate proxy or the browser HTTP cache. Catches the
        // entire identity-service surface plus /profile/me-style
        // endpoints. JWT-bearing paths cover both response bodies that
        // contain the token (login, register, refresh) and ones that
        // depend on the requesting user (everything authenticated).
        String path = request.getRequestURI();
        if (isSensitivePath(path)) {
            response.setHeader("Cache-Control", "no-store");
            response.setHeader("Pragma", "no-cache");
        }

        // Every API response varies by Accept-Language (i18n-service
        // returns translated copy) and Authorization (per-user payload).
        // Without Vary, a shared cache could serve a German anonymous
        // response to a logged-in French user. Append rather than
        // overwrite so any per-endpoint Vary from upstream (e.g. on
        // ETag-tagged jobs list) is preserved.
        String existingVary = response.getHeader("Vary");
        String wantedVary = "Accept-Language, Authorization";
        if (existingVary == null || existingVary.isBlank()) {
            response.setHeader("Vary", wantedVary);
        } else if (!existingVary.contains("Authorization")
                || !existingVary.contains("Accept-Language")) {
            response.setHeader("Vary", existingVary + ", " + wantedVary);
        }

        chain.doFilter(request, response);
    }

    private static boolean isSensitivePath(String path) {
        if (path == null) return false;
        return path.startsWith("/api/v1/auth/")
                || path.startsWith("/api/v1/profile/")
                || path.contains("/me/")
                || path.endsWith("/me");
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
    public static class Config {
        @Bean
        public SecurityHeadersFilter securityHeadersFilter(
                @org.springframework.beans.factory.annotation.Value(
                        "${bewerbi.security.headers.csp:default-src 'none'; frame-ancestors 'none'}")
                String csp) {
            return new SecurityHeadersFilter(csp);
        }
    }
}
