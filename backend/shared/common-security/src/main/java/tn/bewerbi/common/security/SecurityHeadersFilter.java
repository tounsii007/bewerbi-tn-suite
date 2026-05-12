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

        response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "DENY");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        response.setHeader("Permissions-Policy",
                "geolocation=(), camera=(), microphone=(), payment=(), usb=()");
        response.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        response.setHeader("Cross-Origin-Resource-Policy", "same-site");
        if (csp != null && !csp.isBlank()) {
            response.setHeader("Content-Security-Policy", csp);
        }

        chain.doFilter(request, response);
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
