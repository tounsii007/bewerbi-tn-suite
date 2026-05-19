package tn.bewerbi.gateway;

import java.security.interfaces.RSAPublicKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import tn.bewerbi.common.security.RsaKeyProvider;

/**
 * Gateway-level auth: public routes for auth/register + job browsing + i18n
 * resources; everything else requires a valid JWT. Downstream services
 * re-verify so no implicit trust.
 *
 * <p>Iter 107: RS256 verifier-only. The gateway never signs, so only the
 * public key is loaded. {@code bewerbi.security.jwt.public-key} or
 * {@code public-key-path} must be set; in {@code prod} the absence is
 * fatal. In dev/test we don't auto-generate (the signing service is
 * identity-service — it owns the pair).
 */
@Configuration
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${bewerbi.security.jwt.public-key:}")
    private String publicKeyPem;

    @Value("${bewerbi.security.jwt.public-key-path:}")
    private String publicKeyPath;

    private final Environment env;

    public SecurityConfig(Environment env) {
        this.env = env;
    }

    @Bean
    public ReactiveJwtDecoder jwtDecoder() {
        RSAPublicKey publicKey = RsaKeyProvider
                .resolvePem(publicKeyPem, publicKeyPath)
                .map(RsaKeyProvider::parsePublicKey)
                .orElseGet(this::failOrFallback);
        return NimbusReactiveJwtDecoder.withPublicKey(publicKey)
                .signatureAlgorithm(SignatureAlgorithm.RS256)
                .build();
    }

    /**
     * No public key configured. Production must fail fast — running the
     * gateway with a fallback key would defeat the RS256 migration. In
     * dev we throw too, because the gateway can't meaningfully verify
     * anything without the matching public key from identity-service.
     */
    private RSAPublicKey failOrFallback() {
        for (String p : env.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p)) {
                throw new IllegalStateException(
                        "Gateway requires bewerbi.security.jwt.public-key(-path) under prod. "
                                + "Mount the public half of the identity-service RSA pair.");
            }
        }
        log.error("No RSA public key configured for the gateway. Set "
                + "bewerbi.security.jwt.public-key or public-key-path. The same key must "
                + "be mounted on identity-service alongside its private key.");
        throw new IllegalStateException(
                "Missing bewerbi.security.jwt.public-key(-path) — see logs above.");
    }

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(ex -> ex
                        .pathMatchers(HttpMethod.POST,
                                "/api/v1/auth/register",
                                "/api/v1/auth/login",
                                "/api/v1/auth/refresh",
                                "/api/v1/auth/password/forgot",
                                "/api/v1/auth/password/reset",
                                "/api/v1/auth/verify-email/resend").permitAll()
                        .pathMatchers(HttpMethod.GET,
                                "/api/v1/auth/verify-email",
                                "/.well-known/jwks.json",
                                "/api/v1/jobs/**",
                                "/api/v1/companies/**",
                                "/api/v1/i18n/**").permitAll()
                        .pathMatchers(
                                "/actuator/health",
                                "/actuator/info",
                                "/docs/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**").permitAll()
                        .anyExchange().authenticated())
                .oauth2ResourceServer(o -> o.jwt(jwt -> jwt.jwtDecoder(jwtDecoder())));
        return http.build();
    }
}
