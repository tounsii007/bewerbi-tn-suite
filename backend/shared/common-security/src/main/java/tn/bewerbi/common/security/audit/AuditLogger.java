package tn.bewerbi.common.security.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

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
