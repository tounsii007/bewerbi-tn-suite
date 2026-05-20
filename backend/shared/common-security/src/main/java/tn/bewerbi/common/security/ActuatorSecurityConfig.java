package tn.bewerbi.common.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Iter 115 — dedicated SecurityFilterChain for {@code /actuator/**} endpoints.
 *
 * <h2>Why a separate chain?</h2>
 * Every service that has custom public routes (jobs, companies, i18n, …) must
 * define its own {@link SecurityFilterChain}.  Before Iter 115 those custom
 * chains each tried to remember to declare the right actuator rules — and some
 * got it wrong:
 * <ul>
 *   <li>i18n-service: {@code /actuator/prometheus} was {@code permitAll()}</li>
 *   <li>companies, documents, identity, jobs: prometheus fell through to
 *       {@code .anyRequest().authenticated()} — requires a JWT but not ADMIN,
 *       so any authenticated user could scrape internal metrics.</li>
 * </ul>
 *
 * <p>By placing the actuator rules in a single {@code @Order(1)} chain scoped
 * to {@code /actuator/**}, the Spring Security {@code FilterChainProxy} always
 * tries this chain first for every actuator request.  Per-service chains never
 * see actuator traffic — they cannot accidentally override these rules.
 *
 * <h2>Rules</h2>
 * <ul>
 *   <li><b>Health/info probes</b>: public — load-balancer and k8s must reach them
 *       without credentials.</li>
 *   <li><b>Everything else under /actuator/</b>: {@code ROLE_ADMIN} required.
 *       Additionally, the cluster ingress should deny external traffic to the
 *       whole {@code /actuator/**} tree for defense-in-depth.</li>
 * </ul>
 */
@Configuration
public class ActuatorSecurityConfig {

    @Bean
    @Order(1)
    public SecurityFilterChain actuatorFilterChain(
            HttpSecurity http,
            JwtAuthenticationConverter jwtAuthConverter) throws Exception {
        http
                .securityMatcher("/actuator/**")
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Probes — must be reachable by the load balancer / k8s without auth.
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/health/liveness",
                                "/actuator/health/readiness",
                                "/actuator/info",
                                "/actuator/buildinfo")
                        .permitAll()
                        // Every other actuator endpoint (prometheus, metrics, env, beans,
                        // configprops, loggers, …) requires ROLE_ADMIN.
                        .anyRequest().hasRole("ADMIN"))
                .oauth2ResourceServer(o -> o.jwt(j -> j.jwtAuthenticationConverter(jwtAuthConverter)));
        return http.build();
    }
}
