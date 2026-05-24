package tn.bewerbi.identity.auth;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Component;
import tn.bewerbi.identity.domain.LoginMethod;

/**
 * Iter 176 — Micrometer counters for the auth flow.
 *
 * <p>Audit-log entries are great for forensics but lousy for
 * dashboards; Prometheus queries like "google logins per minute"
 * or "lockout rate over the last 24h" need pre-aggregated counters.
 *
 * <p>The audit log + login_attempts table both stay as-is — these
 * counters are an additional sink on the same events. Cardinality
 * is bounded (method ∈ {PASSWORD, GOOGLE, REFRESH}, outcome ∈
 * {success, failure}, reason ∈ ~12 stable codes) so the dashboard
 * label-cost stays small.
 *
 * <p>{@code @ConditionalOnBean(MeterRegistry.class)} means tests
 * that don't wire Micrometer don't see this bean — {@link AuthService}
 * uses {@code ObjectProvider} to call it best-effort.
 */
@Component
@ConditionalOnBean(MeterRegistry.class)
public class AuthMetrics {

    private static final String METRIC_LOGIN = "auth.login.total";
    private static final String METRIC_LOGIN_FAILURE = "auth.login.failure.total";
    private static final String METRIC_LOCKOUT = "auth.lockout.total";
    private static final String METRIC_LINK = "auth.link.total";
    private static final String METRIC_ACCOUNT_ACTION = "auth.account.total";

    private final MeterRegistry registry;

    public AuthMetrics(MeterRegistry registry) {
        this.registry = registry;
    }

    /** Increment on every login attempt regardless of outcome. */
    public void recordLogin(LoginMethod method, boolean success) {
        Counter.builder(METRIC_LOGIN)
                .description("Total login attempts (success + failure)")
                .tag("method", method.name())
                .tag("outcome", success ? "success" : "failure")
                .register(registry)
                .increment();
    }

    /**
     * Increment on every login failure with the stable reason code.
     * Powers "top failure reasons" dashboards + alerting on sudden
     * spikes of a single code (e.g. RATE_LIMITED_IP burst = abuse).
     */
    public void recordFailure(LoginMethod method, String reason) {
        Counter.builder(METRIC_LOGIN_FAILURE)
                .description("Login failures by stable reason code")
                .tag("method", method.name())
                .tag("reason", reason == null ? "UNKNOWN" : reason)
                .register(registry)
                .increment();
    }

    /**
     * Increment when a rate-limiter triggers a lockout. {@code axis}
     * is {@code account} (per-email failure threshold hit) or {@code ip}
     * (per-IP threshold hit).
     */
    public void recordLockout(String axis) {
        Counter.builder(METRIC_LOCKOUT)
                .description("Lockouts triggered by the rate-limiter")
                .tag("axis", axis)
                .register(registry)
                .increment();
    }

    /**
     * Increment on Google link/unlink operations. {@code action} is
     * {@code link} / {@code unlink} / {@code set_initial_password},
     * {@code outcome} is {@code success} / {@code failure}.
     */
    public void recordProviderLinkAction(String action, boolean success) {
        Counter.builder(METRIC_LINK)
                .description("Provider linking actions (link / unlink / set-initial-password)")
                .tag("action", action)
                .tag("outcome", success ? "success" : "failure")
                .register(registry)
                .increment();
    }

    /**
     * Iter 189 — account-level actions: change-password, delete-account,
     * logout, logout-all. Same shape as recordProviderLinkAction but a
     * different meter name so dashboards can keep the two concerns apart.
     *
     * <p>{@code action} ∈ {@code change_password}, {@code delete_account},
     * {@code logout}, {@code logout_all}, {@code email_verify},
     * {@code email_verify_resend}, {@code password_reset_requested},
     * {@code password_reset_completed}.
     */
    public void recordAccountAction(String action, boolean success) {
        Counter.builder(METRIC_ACCOUNT_ACTION)
                .description("Account-level actions (change-password, delete, logout, verify-email)")
                .tag("action", action)
                .tag("outcome", success ? "success" : "failure")
                .register(registry)
                .increment();
    }
}
