package tn.bewerbi.identity.domain;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Iter 181 — pure-domain unit tests for {@link User}'s linking
 * helpers added in Iter 167 and the {@code isOauthOnly()} semantics
 * change that came with them. No Spring context — the entity's
 * behaviour stands on its own.
 *
 * <p>identity-service had zero unit tests until this file (the only
 * test was the broken IntegrationTest that needs Testcontainers).
 * This is the smallest reasonable foothold: pure Java, no IO, no
 * Spring, runs in milliseconds.
 */
class UserTest {

    private static final String EMAIL = "x@example.tn";
    private static final String HASH = "$2a$10$dummy";
    private static final String GOOGLE_SUB = "google-uid-1";

    @Test
    void emailPasswordUser_hasPassword_noGoogle_notOauthOnly() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);

        assertThat(u.hasPassword()).isTrue();
        assertThat(u.hasGoogle()).isFalse();
        assertThat(u.isOauthOnly()).isFalse();
        assertThat(u.getAuthProvider()).isEqualTo(AuthProvider.EMAIL);
    }

    @Test
    void googleUser_noPassword_hasGoogle_isOauthOnly() {
        User u = User.fromGoogle(EMAIL, GOOGLE_SUB, UserRole.APPLICANT);

        assertThat(u.hasPassword()).isFalse();
        assertThat(u.hasGoogle()).isTrue();
        assertThat(u.isOauthOnly()).isTrue();
        assertThat(u.getAuthProvider()).isEqualTo(AuthProvider.GOOGLE);
        // Google verified the email before issuing the token, so we
        // trust it as verified — important so the user isn't bounced
        // to "please verify your email" on first login.
        assertThat(u.isEmailVerified()).isTrue();
    }

    @Test
    void linkGoogle_onPasswordUser_addsGoogle_keepsPassword_notOauthOnly() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);
        u.linkGoogle(GOOGLE_SUB);

        assertThat(u.hasPassword()).isTrue();
        assertThat(u.hasGoogle()).isTrue();
        // Dual-auth user — not OAuth-only because they still have
        // a password.
        assertThat(u.isOauthOnly()).isFalse();
        assertThat(u.getGoogleSubject()).isEqualTo(GOOGLE_SUB);
    }

    @Test
    void linkGoogle_idempotentForSameSubject() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);
        u.linkGoogle(GOOGLE_SUB);
        // Re-linking to the same subject is a no-op, not an error.
        // Useful for retry-safe service code that can't easily check
        // the current state first.
        u.linkGoogle(GOOGLE_SUB);

        assertThat(u.getGoogleSubject()).isEqualTo(GOOGLE_SUB);
    }

    @Test
    void linkGoogle_throwsWhenSwitchingToDifferentSubject() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);
        u.linkGoogle(GOOGLE_SUB);

        // Re-linking to a *different* sub is an error — surfaces
        // the case where a user tries to swap their linked Google
        // account, which the service layer should explicitly handle
        // (unlink + link) rather than silently overwrite.
        assertThatThrownBy(() -> u.linkGoogle("different-google-sub"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already linked");
    }

    @Test
    void linkGoogle_throwsOnBlankSubject() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);

        assertThatThrownBy(() -> u.linkGoogle(""))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> u.linkGoogle(null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> u.linkGoogle("   "))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void unlinkGoogle_clearsSubject_keepsPassword() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);
        u.linkGoogle(GOOGLE_SUB);

        u.unlinkGoogle();

        assertThat(u.hasPassword()).isTrue();
        assertThat(u.hasGoogle()).isFalse();
        assertThat(u.getGoogleSubject()).isNull();
    }

    @Test
    void unlinkGoogle_idempotentWhenNotLinked() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);

        // No throw, no state change.
        u.unlinkGoogle();
        u.unlinkGoogle();

        assertThat(u.hasGoogle()).isFalse();
    }

    @Test
    void setInitialPassword_promotesGoogleUserToDualAuth() {
        User u = User.fromGoogle(EMAIL, GOOGLE_SUB, UserRole.APPLICANT);
        assertThat(u.isOauthOnly()).isTrue();

        u.setInitialPassword("$2a$10$new");

        assertThat(u.hasPassword()).isTrue();
        assertThat(u.hasGoogle()).isTrue();
        // OAuth-only is now false — the user can authenticate either
        // way. This is the whole point of Iter 167's helper.
        assertThat(u.isOauthOnly()).isFalse();
    }

    @Test
    void setInitialPassword_throwsWhenAlreadyHasPassword() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);

        // setInitialPassword is *initial* — using it on an account
        // that already has one is a programming error. The service
        // layer should have routed to changePassword instead.
        assertThatThrownBy(() -> u.setInitialPassword("$2a$10$new"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("changePassword");
    }

    @Test
    void hasPassword_falseForNullOrBlankHash() {
        User u = new User(EMAIL, HASH, UserRole.APPLICANT);
        assertThat(u.hasPassword()).isTrue();

        u.setPasswordHash(null);
        assertThat(u.hasPassword()).isFalse();

        u.setPasswordHash("");
        assertThat(u.hasPassword()).isFalse();

        u.setPasswordHash("   ");
        assertThat(u.hasPassword()).isFalse();
    }
}
