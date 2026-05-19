package tn.bewerbi.common.security;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Baseline JWT + CORS configuration imported by every service.
 *
 * <p><b>Iter 107: HS256 → RS256.</b> Previously every microservice shared
 * the same HMAC secret to verify access tokens, which meant a compromise
 * in any single service yielded a token-forging key for the whole
 * platform. Now identity-service is the sole signer (private key mounted
 * only there) and every other service is verifier-only with the public
 * key. RCE in a verifier no longer mints tokens.
 *
 * <p>Services override {@link SecurityFilterChainRegistrar} if they need
 * public routes beyond the default actuator + docs.
 */
@Configuration
@EnableMethodSecurity
public class JwtSecurityConfig {

    @Value("${bewerbi.security.cors.allowed-origins:http://localhost:3000,http://localhost:8081,http://localhost:19006}")
    private List<String> allowedOrigins;

    private final RsaKeyProvider.RsaKeys keys;

    public JwtSecurityConfig(RsaKeyProvider.RsaKeys keys) {
        this.keys = keys;
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        // Public-key verification works on every service whether or not
        // the private key is mounted. Algorithm pinned to RS256 in the
        // builder so an "alg: none" or HS-with-public-key-as-secret
        // attack can't slip past.
        return NimbusJwtDecoder.withPublicKey(keys.publicKey())
                .signatureAlgorithm(SignatureAlgorithm.RS256)
                .build();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        if (!keys.hasSigner()) {
            // Verifier-only service. Provide an encoder that fails
            // loudly if something accidentally tries to sign — better
            // than silently producing tokens with the wrong key.
            return parameters -> {
                throw new IllegalStateException(
                        "JwtEncoder not available on this service — "
                                + "only identity-service holds the RSA private key");
            };
        }
        RSAKey rsaKey = new RSAKey.Builder(keys.publicKey())
                .privateKey(keys.privateKey())
                .keyID(keys.keyId())
                .build();
        JWKSource<SecurityContext> jwkSource = new ImmutableJWKSet<>(new JWKSet(rsaKey));
        return new NimbusJwtEncoder(jwkSource);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthConverter() {
        var authoritiesConverter = new JwtGrantedAuthoritiesConverter();
        authoritiesConverter.setAuthorityPrefix("ROLE_");
        authoritiesConverter.setAuthoritiesClaimName("roles");
        var converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(authoritiesConverter);
        // Use subject (user id) as the authentication name → read via CurrentUser.id()
        converter.setPrincipalClaimName("sub");
        return converter;
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsSource() {
        var cfg = new CorsConfiguration();
        // Use AllowedOriginPatterns so wildcards (https://*.bewerbi.tn) work even with credentials.
        cfg.setAllowedOriginPatterns(allowedOrigins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Explicit list — wildcard headers are a CORS-spec foot-gun with credentials.
        cfg.setAllowedHeaders(List.of(
                "Authorization",
                "Content-Type",
                "Accept",
                "Accept-Language",
                "X-Locale",
                "X-Correlation-Id",
                "X-Requested-With"));
        cfg.setExposedHeaders(List.of(
                "Content-Language",
                "X-Correlation-Id",
                "Retry-After"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);
        var src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
