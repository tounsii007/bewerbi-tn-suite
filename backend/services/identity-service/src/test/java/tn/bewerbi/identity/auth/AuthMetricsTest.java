package tn.bewerbi.identity.auth;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import tn.bewerbi.identity.domain.LoginMethod;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Iter 187 — pure-unit tests for {@link AuthMetrics}.
 *
 * <p>Counters are part of the operational contract — renaming a tag
 * silently breaks every dashboard query that depends on it. These
 * tests pin the meter names + tag names + tag-value sets so a rename
 * has to be intentional (it'll fail the test) and visible (it'll
 * touch this file).
 *
 * <p>{@code SimpleMeterRegistry} is in-memory, no IO, runs in micros.
 */
class AuthMetricsTest {

    private SimpleMeterRegistry registry;
    private AuthMetrics metrics;

    @BeforeEach
    void setUp() {
        registry = new SimpleMeterRegistry();
        metrics = new AuthMetrics(registry);
    }

    @Test
    void recordLogin_emitsMethodAndOutcomeTags() {
        metrics.recordLogin(LoginMethod.PASSWORD, true);
        metrics.recordLogin(LoginMethod.PASSWORD, false);
        metrics.recordLogin(LoginMethod.GOOGLE, true);

        // Counters segregate by tag combination — three separate series.
        assertThat(count("auth.login.total", "method", "PASSWORD", "outcome", "success"))
                .isEqualTo(1.0);
        assertThat(count("auth.login.total", "method", "PASSWORD", "outcome", "failure"))
                .isEqualTo(1.0);
        assertThat(count("auth.login.total", "method", "GOOGLE", "outcome", "success"))
                .isEqualTo(1.0);
    }

    @Test
    void recordLogin_accumulatesAcrossCalls() {
        for (int i = 0; i < 5; i++) {
            metrics.recordLogin(LoginMethod.PASSWORD, true);
        }
        assertThat(count("auth.login.total", "method", "PASSWORD", "outcome", "success"))
                .isEqualTo(5.0);
    }

    @Test
    void recordFailure_keepsReasonCodesStable() {
        metrics.recordFailure(LoginMethod.PASSWORD, "RATE_LIMITED_IP");
        metrics.recordFailure(LoginMethod.GOOGLE, "OAUTH_TOKEN_INVALID");

        assertThat(count("auth.login.failure.total",
                "method", "PASSWORD", "reason", "RATE_LIMITED_IP")).isEqualTo(1.0);
        assertThat(count("auth.login.failure.total",
                "method", "GOOGLE", "reason", "OAUTH_TOKEN_INVALID")).isEqualTo(1.0);
    }

    @Test
    void recordFailure_substitutesUnknownReasonForNull() {
        // Defensive: a programmer might call recordFailure(METHOD, null)
        // by mistake. Don't crash, don't emit a null tag value.
        metrics.recordFailure(LoginMethod.PASSWORD, null);
        assertThat(count("auth.login.failure.total",
                "method", "PASSWORD", "reason", "UNKNOWN")).isEqualTo(1.0);
    }

    @Test
    void recordLockout_segregatesAxis() {
        metrics.recordLockout("account");
        metrics.recordLockout("account");
        metrics.recordLockout("ip");

        assertThat(count("auth.lockout.total", "axis", "account")).isEqualTo(2.0);
        assertThat(count("auth.lockout.total", "axis", "ip")).isEqualTo(1.0);
    }

    @Test
    void recordProviderLinkAction_segregatesActionAndOutcome() {
        metrics.recordProviderLinkAction("link", true);
        metrics.recordProviderLinkAction("link", false);
        metrics.recordProviderLinkAction("unlink", true);
        metrics.recordProviderLinkAction("set_initial_password", true);

        assertThat(count("auth.link.total", "action", "link", "outcome", "success"))
                .isEqualTo(1.0);
        assertThat(count("auth.link.total", "action", "link", "outcome", "failure"))
                .isEqualTo(1.0);
        assertThat(count("auth.link.total", "action", "unlink", "outcome", "success"))
                .isEqualTo(1.0);
        assertThat(count("auth.link.total",
                "action", "set_initial_password", "outcome", "success")).isEqualTo(1.0);
    }

    @Test
    void recordAccountAction_segregatesByActionAndOutcome() {
        // Iter 189 — the new account-level meter.
        metrics.recordAccountAction("change_password", true);
        metrics.recordAccountAction("change_password", false);
        metrics.recordAccountAction("change_password", false);
        metrics.recordAccountAction("logout", true);
        metrics.recordAccountAction("logout_all", true);
        metrics.recordAccountAction("delete_account", true);
        metrics.recordAccountAction("delete_account", false);

        assertThat(count("auth.account.total",
                "action", "change_password", "outcome", "success")).isEqualTo(1.0);
        assertThat(count("auth.account.total",
                "action", "change_password", "outcome", "failure")).isEqualTo(2.0);
        assertThat(count("auth.account.total",
                "action", "logout", "outcome", "success")).isEqualTo(1.0);
        assertThat(count("auth.account.total",
                "action", "logout_all", "outcome", "success")).isEqualTo(1.0);
        assertThat(count("auth.account.total",
                "action", "delete_account", "outcome", "success")).isEqualTo(1.0);
        assertThat(count("auth.account.total",
                "action", "delete_account", "outcome", "failure")).isEqualTo(1.0);
    }

    @Test
    void linkAndAccountAreSeparateMeters() {
        // Both meters use the same tag names {action, outcome}; make
        // sure they live in different series so an "account-actions"
        // dashboard panel doesn't accidentally pull in provider-link
        // counts (or vice versa).
        metrics.recordProviderLinkAction("link", true);
        metrics.recordAccountAction("change_password", true);

        assertThat(count("auth.link.total", "action", "link", "outcome", "success"))
                .isEqualTo(1.0);
        assertThat(count("auth.account.total",
                "action", "change_password", "outcome", "success")).isEqualTo(1.0);
        // Sanity: link total has NO change_password tag value.
        assertThat(count("auth.link.total",
                "action", "change_password", "outcome", "success")).isEqualTo(0.0);
    }

    /** Helper to fetch the count for a (name, tagPairs...) coordinate. */
    private double count(String name, String... tagPairs) {
        var search = registry.find(name);
        for (int i = 0; i < tagPairs.length; i += 2) {
            search = search.tag(tagPairs[i], tagPairs[i + 1]);
        }
        var counter = search.counter();
        return counter == null ? 0.0 : counter.count();
    }
}
