package tn.bewerbi.common.security;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Iter 107: this used to validate the HS256 shared-secret pre-flight.
 * The migration to RS256 moved the real validation into
 * {@link RsaKeyProvider} (which fails fast under the {@code prod}
 * profile when no public key is mounted). What's left here is a
 * deprecation check — yelling if a legacy
 * {@code bewerbi.security.jwt.secret} property is still set so an
 * operator notices it does nothing now.
 */
@Configuration
public class JwtSecretValidator {

    private static final Logger log = LoggerFactory.getLogger(JwtSecretValidator.class);

    private final Environment env;

    public JwtSecretValidator(Environment env) {
        this.env = env;
    }

    @PostConstruct
    public void warnIfLegacySecretSet() {
        String legacy = env.getProperty("bewerbi.security.jwt.secret");
        if (legacy != null && !legacy.isBlank()) {
            log.warn("bewerbi.security.jwt.secret is set but ignored since Iter 107 — "
                    + "RS256 is in use. Remove the property and configure "
                    + "bewerbi.security.jwt.private-key[-path] (signer / identity-service) and "
                    + "bewerbi.security.jwt.public-key[-path] (every verifier service) instead.");
        }
    }
}
