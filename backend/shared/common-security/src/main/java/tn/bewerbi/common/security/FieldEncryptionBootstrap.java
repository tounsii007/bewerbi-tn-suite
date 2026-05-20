package tn.bewerbi.common.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

/**
 * Bridges the Spring secret store and the static {@link FieldEncryption}
 * helper. Has to run before any JPA converter touches the cipher, so it
 * is wired by {@link CommonSecurityAutoConfiguration} early enough for
 * Hibernate's converter initialization.
 *
 * <p>JPA {@code @Converter}s are not Spring beans — Hibernate calls
 * their no-arg constructor itself. Injecting a runtime secret would
 * otherwise require ugly workarounds (ApplicationContextAware, manual
 * {@code @Inject} via Hibernate's {@code BeanContainer}). A static
 * initializer behind a single Spring-managed bootstrap bean is the
 * least-magic option.
 */
@Configuration
public class FieldEncryptionBootstrap {

    public FieldEncryptionBootstrap(
            @Value("${bewerbi.security.field-encryption.key:}") String key,
            Environment env) {
        boolean prodProfile = env.acceptsProfiles(Profiles.of("prod"));
        FieldEncryption.init(key, prodProfile);
    }
}
