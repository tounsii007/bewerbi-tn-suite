package tn.bewerbi.common.security.audit;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Emits {@link AuditEvent}s to a dedicated logger. Downstream pipelines should route
 * {@code tn.bewerbi.audit} to a long-retention index — separate from operational logs whose
 * retention is shorter.
 *
 * <p>Uses {@code key=value} pairs in the message for cheap grep-ability; the JSON profile
 * structures the same data automatically via MDC.
 */
@Component
public class AuditLogger {

    private static final Logger AUDIT = LoggerFactory.getLogger("tn.bewerbi.audit");

    public void log(AuditEvent ev) {
        // Enrich the event with the current request's IP + User-Agent
        // if the caller didn't already attach them. Lets every call site
        // stay terse (just success/failure with actor + target) while
        // SOC still gets the network context.
        if ((ev.ip() == null || ev.ip().isEmpty())
                && (ev.userAgent() == null || ev.userAgent().isEmpty())) {
            RequestContext ctx = currentRequestContext();
            if (ctx != null) ev = ev.withRequestContext(ctx.ip, ctx.userAgent);
        }
        try {
            MDC.put("audit.type", ev.type());
            MDC.put("audit.actor", nullSafe(ev.actor()));
            MDC.put("audit.target", nullSafe(ev.target()));
            MDC.put("audit.outcome", ev.outcome());
            AUDIT.info("audit type={} actor={} target={} outcome={} reason={} ip={} ua=\"{}\"",
                    ev.type(),
                    nullSafe(ev.actor()),
                    nullSafe(ev.target()),
                    ev.outcome(),
                    nullSafe(ev.reason()),
                    nullSafe(ev.ip()),
                    nullSafe(ev.userAgent()));
        } finally {
            MDC.remove("audit.type");
            MDC.remove("audit.actor");
            MDC.remove("audit.target");
            MDC.remove("audit.outcome");
        }
    }

    /**
     * Extract IP + UA from the current servlet request, honouring
     * X-Forwarded-For (the gateway sits in front of every service).
     * Returns {@code null} outside a request scope (background jobs,
     * tests, Kafka listeners).
     */
    private static RequestContext currentRequestContext() {
        try {
            var attrs = RequestContextHolder.getRequestAttributes();
            if (!(attrs instanceof ServletRequestAttributes sra)) return null;
            HttpServletRequest req = sra.getRequest();
            String fwd = req.getHeader("X-Forwarded-For");
            String ip;
            if (fwd != null && !fwd.isBlank()) {
                // X-Forwarded-For = client, proxy1, proxy2 — first entry
                // is the original caller. Strip whitespace.
                int comma = fwd.indexOf(',');
                ip = (comma < 0 ? fwd : fwd.substring(0, comma)).trim();
            } else {
                ip = req.getRemoteAddr();
            }
            String ua = req.getHeader("User-Agent");
            return new RequestContext(ip, ua);
        } catch (Exception ignored) {
            return null;
        }
    }

    private record RequestContext(String ip, String userAgent) {}

    private static String nullSafe(String s) {
        return s == null ? "" : s;
    }

    @Configuration(proxyBeanMethods = false)
    public static class Config {
        @Bean
        @ConditionalOnMissingBean
        public AuditLogger auditLogger() {
            return new AuditLogger();
        }
    }
}
