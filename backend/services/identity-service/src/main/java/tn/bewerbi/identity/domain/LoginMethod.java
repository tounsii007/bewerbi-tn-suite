package tn.bewerbi.identity.domain;

/**
 * Iter 159 — how a particular login attempt was made.
 *
 * <p>Sits on {@link LoginAttempt} (the persisted login-history rows).
 * Distinct from {@link AuthProvider} which is the user's signup
 * provider — a single user could in principle log in via multiple
 * methods over their lifetime (e.g. password fallback during a Google
 * outage, future account-linking, etc.).
 */
public enum LoginMethod {
    /** Email + bcrypt password against /api/v1/auth/login. */
    PASSWORD,

    /** Google ID token via /api/v1/auth/google. */
    GOOGLE,

    /** Refresh-token rotation via /api/v1/auth/refresh. Recorded so
     *  unusual session activity (one token re-used many times from
     *  many IPs) shows up in the per-user history. */
    REFRESH,
}
