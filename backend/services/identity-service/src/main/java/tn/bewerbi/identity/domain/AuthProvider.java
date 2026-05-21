package tn.bewerbi.identity.domain;

/**
 * Iter 159 — how a user signed up.
 *
 * <p>Drives two decisions throughout the identity-service:
 * <ul>
 *   <li>Login flow: EMAIL users need their bcrypt password verified;
 *       GOOGLE users have no local password and authenticate via a
 *       Google ID token verified server-side against Google's JWKS.</li>
 *   <li>Password operations: forgot-password / change-password / etc.
 *       must REJECT requests for GOOGLE-provider users (their password
 *       is at Google, not us) with a clear 409 error.</li>
 * </ul>
 *
 * <p>A future enhancement (account-linking) may attach a second provider
 * to an existing user. The current model treats it as exclusive — one
 * row per user → one provider.
 */
public enum AuthProvider {
    /** Local email + bcrypt password. The default for backwards compat
     *  with all pre-Iter-159 users (their existing column defaults to
     *  this on migration). */
    EMAIL,

    /** OAuth 2.0 with Google as the identity provider. Server verifies
     *  Google's ID token via JWKS; the user has no password_hash. */
    GOOGLE,
}
