package tn.bewerbi.common.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

/**
 * Bridges Spring's @Value-loaded secret into TokenHasher's static
 * {@link TokenHasher#init} before any service-bean touches the hasher.
 * Same pattern as {@link FieldEncryptionBootstrap} — needed because
 * TokenHasher is also used from places (KafkaListener, JPA converters
 * in flight, etc.) where Spring constructor injection isn't available.
 */
@Configuration
public class TokenHasherBootstrap {

    public TokenHasherBootstrap(
            @Value("${bewerbi.security.token-pepper:}") String pepper,
            Environment env) {
        boolean prodProfile = env.acceptsProfiles(Profiles.of("prod"));
        TokenHasher.init(pepper, prodProfile);
    }
}
