package tn.bewerbi.common.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Default filter chain for services that have no custom routes to expose publicly.
 *
 * <p>Services with public API endpoints (guest job search, public company pages,
 * public i18n lookups, …) declare their own {@code @Bean SecurityFilterChain}
 * which suppresses this fallback via {@code @ConditionalOnMissingBean}.
 *
 * <p>Actuator security is handled by {@link ActuatorSecurityConfig} at
 * {@code @Order(1)} — the dedicated chain intercepts all {@code /actuator/**}
 * requests before they reach this chain or any per-service chain.
 */
@Configuration
public class SecurityFilterChainRegistrar {

    @Bean
    @Order(10)
    @org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean(SecurityFilterChain.class)
    public SecurityFilterChain defaultFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthConverter,
            UrlBasedCorsConfigurationSource corsSource) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsSource))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // API docs are public in dev; gate them in prod via profile-specific config.
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                        .permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtAuthConverter)));
        return http.build();
    }
}
