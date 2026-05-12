package tn.bewerbi.common.security;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Import;
import tn.bewerbi.common.security.audit.AuditLogger;
import tn.bewerbi.common.security.audit.LoginAttemptTracker;

/**
 * Wires shared security beans for every Spring-Boot service that has {@code common-security} on
 * the classpath. Includes:
 * <ul>
 *   <li>{@link JwtSecurityConfig} — JWT decoder/encoder, CORS source</li>
 *   <li>{@link SecurityFilterChainRegistrar} — default JWT filter chain</li>
 *   <li>{@link SecurityHeadersFilter} — defense-in-depth response headers</li>
 *   <li>{@link JwtSecretValidator} — fail-fast on weak/missing JWT secret in prod</li>
 *   <li>{@link AuditLogger} — structured audit emitter</li>
 *   <li>{@link LoginAttemptTracker} — only when Redis is present</li>
 * </ul>
 */
@AutoConfiguration
@ConditionalOnWebApplication
@Import({
    JwtSecurityConfig.class,
    SecurityFilterChainRegistrar.class,
    SecurityHeadersFilter.Config.class,
    JwtSecretValidator.class,
    AuditLogger.Config.class,
    LoginAttemptTracker.Config.class
})
public class CommonSecurityAutoConfiguration {
}
