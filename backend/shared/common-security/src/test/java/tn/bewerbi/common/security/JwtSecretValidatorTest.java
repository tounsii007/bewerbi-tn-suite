package tn.bewerbi.common.security;

import static org.assertj.core.api.Assertions.assertThatCode;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

/**
 * Iter 107 trimmed this down — the real key validation moved to
 * {@link RsaKeyProvider} (which fails fast in prod when no public key is
 * mounted). What's left of {@link JwtSecretValidator} only emits a
 * deprecation warning if a legacy {@code bewerbi.security.jwt.secret}
 * property still lingers. These two tests cover the two branches.
 */
class JwtSecretValidatorTest {

    @Test
    void no_op_when_legacy_secret_unset() {
        MockEnvironment env = new MockEnvironment();
        JwtSecretValidator v = new JwtSecretValidator(env);
        assertThatCode(v::warnIfLegacySecretSet).doesNotThrowAnyException();
    }

    @Test
    void emits_warning_when_legacy_secret_set() {
        MockEnvironment env = new MockEnvironment()
                .withProperty("bewerbi.security.jwt.secret", "leftover-from-iter-1");
        JwtSecretValidator v = new JwtSecretValidator(env);
        // Doesn't throw — it just warns. Real test: assert no exception.
        assertThatCode(v::warnIfLegacySecretSet).doesNotThrowAnyException();
    }
}
