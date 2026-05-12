package tn.bewerbi.common.security;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

/**
 * Refuses to start the service if the JWT secret is missing, too short, or still set to the
 * well-known development default while the {@code prod} profile is active. Catches the most
 * common deployment foot-gun before traffic hits.
 */
@Configuration
public class JwtSecretValidator {

    private static final Logger log = LoggerFactory.getLogger(JwtSecretValidator.class);

    /** HS256 mandates a key of at least 256 bits = 32 bytes per RFC 7518 §3.2. */
    private static final int MIN_BYTES = 32;

    private static final String DEV_DEFAULT_PREFIX = "a-dev-only-shared-jwt-secret";

    @Value("${bewerbi.security.jwt.secret:}")
    private String secret;

    private final Environment env;

    public JwtSecretValidator(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void validate() {
        boolean prod = false;
        for (String p : env.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p)) {
                prod = true;
                break;
            }
        }

        if (secret == null || secret.isBlank()) {
            String msg = "bewerbi.security.jwt.secret is not set — refusing to start.";
            if (prod) throw new IllegalStateException(msg);
            log.warn(msg + " Using application default (dev only).");
            return;
        }

        int bytes = secret.getBytes(StandardCharsets.UTF_8).length;
        if (bytes < MIN_BYTES) {
            String msg = "JWT secret is " + bytes + " bytes — HS256 requires ≥ " + MIN_BYTES
                    + " bytes. Generate one with `openssl rand -base64 48`.";
            if (prod) throw new IllegalStateException(msg);
            log.warn(msg);
        }

        if (secret.startsWith(DEV_DEFAULT_PREFIX)) {
            String msg = "JWT secret is the well-known development default — must be replaced "
                    + "before production deploys.";
            if (prod) throw new IllegalStateException(msg);
            log.warn(msg);
        }
    }
}
