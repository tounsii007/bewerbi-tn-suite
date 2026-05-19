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
// Iter 107: type=SERVLET so the reactive gateway can depend on this
// module just for its static PEM helpers (RsaKeyProvider.parsePublicKey,
// …) without trying to wire JwtSecurityConfig (servlet HttpSecurity)
// into a WebFlux runtime.
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@Import({
    RsaKeyProvider.class,
    JwtSecurityConfig.class,
    SecurityFilterChainRegistrar.class,
    SecurityHeadersFilter.Config.class,
    JwtSecretValidator.class,
    AuditLogger.Config.class,
    LoginAttemptTracker.Config.class
})
public class CommonSecurityAutoConfiguration {
}
