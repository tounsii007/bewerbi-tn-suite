package tn.bewerbi.common.api.health;

import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

/**
 * Adds an Actuator endpoint at {@code /actuator/buildinfo} that returns the running app's name,
 * version, commit (set via {@code -Dgit.commit=<sha>}) and start time. Useful for verifying
 * which build is live in a given environment and correlating crash reports.
 *
 * <p>Sibling to Spring Boot's auto-generated {@code /actuator/info} but always populated even
 * when the build hasn't produced a {@code build-info.properties}.
 */
@Configuration(proxyBeanMethods = false)
public class BuildInfoEndpoint {

    @Component
    @Endpoint(id = "buildinfo")
    public static class Endpoint {
        private final Instant startedAt = Instant.now();

        @Value("${spring.application.name:bewerbi-service}")
        private String app;

        @Value("${git.commit:unknown}")
        private String commit;

        @Value("${app.version:dev}")
        private String version;

        @ReadOperation
        public Map<String, Object> info() {
            return Map.of(
                    "app", app,
                    "version", version,
                    "commit", commit,
                    "startedAt", startedAt.toString(),
                    "uptimeSec",
                            (System.currentTimeMillis() - startedAt.toEpochMilli()) / 1000);
        }
    }
}
