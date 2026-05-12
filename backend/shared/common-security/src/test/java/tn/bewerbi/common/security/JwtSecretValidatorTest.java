package tn.bewerbi.common.security;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.util.ReflectionTestUtils;

class JwtSecretValidatorTest {

    @Test
    void fails_on_blank_secret_in_prod() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        JwtSecretValidator v = new JwtSecretValidator(env);
        ReflectionTestUtils.setField(v, "secret", "");
        assertThatThrownBy(v::validate).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void warns_only_in_dev_with_blank_secret() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("dev");
        JwtSecretValidator v = new JwtSecretValidator(env);
        ReflectionTestUtils.setField(v, "secret", "");
        assertThatCode(v::validate).doesNotThrowAnyException();
    }

    @Test
    void fails_on_short_secret_in_prod() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        JwtSecretValidator v = new JwtSecretValidator(env);
        ReflectionTestUtils.setField(v, "secret", "too-short");
        assertThatThrownBy(v::validate).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void fails_on_dev_default_in_prod() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        JwtSecretValidator v = new JwtSecretValidator(env);
        ReflectionTestUtils.setField(v, "secret",
                "a-dev-only-shared-jwt-secret-change-me-in-production-256-bit");
        assertThatThrownBy(v::validate).isInstanceOf(IllegalStateException.class);
    }

    @Test
    void accepts_long_random_secret_in_prod() {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles("prod");
        JwtSecretValidator v = new JwtSecretValidator(env);
        ReflectionTestUtils.setField(v, "secret",
                "QGxK4nFhSrG3kRQDfTw9zJpVx2YN7sB1cMjL8aRtUvE0iH6oP5wYzXkLmA9bNqCs");
        assertThatCode(v::validate).doesNotThrowAnyException();
    }
}
