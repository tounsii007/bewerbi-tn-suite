package tn.bewerbi.identity.auth.google;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.JWKSourceBuilder;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTClaimsVerifier;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;

import java.net.URI;
import java.text.ParseException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Iter 160 — verifies a Google-issued OIDC ID token.
 *
 * <p>Verification chain (each step rejects the token if it fails):
 * <ol>
 *   <li>Signature: RS256 via Google's JWKS at
 *       {@code https://www.googleapis.com/oauth2/v3/certs}. JWKS is
 *       cached in-memory by the Nimbus JWKSource (defaults: refresh
 *       every 5 min, retry on 5xx).</li>
 *   <li>{@code iss} is {@code https://accounts.google.com} OR
 *       {@code accounts.google.com}.</li>
 *   <li>{@code aud} matches our configured Google OAuth client ID.</li>
 *   <li>{@code exp} not in the past (60s skew allowed).</li>
 *   <li>{@code email_verified} is true — only Google-verified emails
 *       create accounts.</li>
 * </ol>
 *
 * <p>On any failure, throws {@link GoogleTokenException} with a stable
 * code so the caller can map it to a LoginAttempt.failureReason. No
 * stack trace leaks past the controller — only the code.
 *
 * <p>Wiring: only registered as a Spring bean when
 * {@code bewerbi.security.google.client-id} is set, so dev / CI builds
 * without Google credentials don't fail to start. Callers can use
 * {@code @Autowired(required = false)} to detect "Google not enabled".
 */
@Component
@ConditionalOnProperty(name = "bewerbi.security.google.client-id")
public class GoogleIdTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(GoogleIdTokenVerifier.class);

    private static final String JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> ALLOWED_ISSUERS = Set.of(
            "https://accounts.google.com",
            "accounts.google.com"
    );

    private final String clientId;
    private final ConfigurableJWTProcessor<SecurityContext> processor;

    public GoogleIdTokenVerifier(
            @Value("${bewerbi.security.google.client-id}") String clientId) throws Exception {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException(
                    "bewerbi.security.google.client-id must be set to enable Google sign-in");
        }
        this.clientId = clientId;
        this.processor = buildProcessor(clientId);
        log.info("GoogleIdTokenVerifier ready (clientId ends with …{})",
                clientId.length() > 6 ? clientId.substring(clientId.length() - 6) : "?");
    }

    private static ConfigurableJWTProcessor<SecurityContext> buildProcessor(String aud)
            throws Exception {
        JWKSource<SecurityContext> jwkSource = JWKSourceBuilder
                .create(URI.create(JWKS_URL).toURL())
                .retrying(true)
                .build();
        JWSKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwkSource);

        ConfigurableJWTProcessor<SecurityContext> p = new DefaultJWTProcessor<>();
        p.setJWSKeySelector(keySelector);

        // Required claims + audience match + small clock skew.
        var required = new HashSet<>(List.of("iss", "sub", "aud", "exp", "iat", "email"));
        p.setJWTClaimsSetVerifier(new DefaultJWTClaimsVerifier<>(
                aud, /* expectedClaims */ null, required) {
            @Override
            public void verify(JWTClaimsSet claims, SecurityContext ctx)
                    throws com.nimbusds.jwt.proc.BadJWTException {
                super.verify(claims, ctx);
                String iss = claims.getIssuer();
                if (iss == null || !ALLOWED_ISSUERS.contains(iss)) {
                    throw new com.nimbusds.jwt.proc.BadJWTException(
                            "Unexpected issuer: " + iss);
                }
            }
        });
        return p;
    }

    /**
     * Verify the given Google ID token and return its essential claims.
     * Throws {@link GoogleTokenException} on any failure (signature,
     * audience, expiry, unverified email).
     */
    public VerifiedGoogleUser verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new GoogleTokenException("OAUTH_TOKEN_MISSING", "ID token is empty");
        }
        JWTClaimsSet claims;
        try {
            claims = processor.process(idToken, null);
        } catch (ParseException e) {
            throw new GoogleTokenException("OAUTH_TOKEN_MALFORMED", "Not a valid JWT");
        } catch (com.nimbusds.jwt.proc.BadJWTException e) {
            // Audience / issuer / exp errors land here from
            // DefaultJWTClaimsVerifier — bucket as "INVALID".
            log.debug("Google ID token rejected: {}", e.getMessage());
            throw new GoogleTokenException("OAUTH_TOKEN_INVALID", e.getMessage());
        } catch (Exception e) {
            // Signature failures, JWKS fetch errors, etc.
            log.warn("Google ID token verification failed: {}", e.getMessage());
            throw new GoogleTokenException("OAUTH_TOKEN_INVALID", "Verification failed");
        }

        // Defense-in-depth — the claims verifier should already enforce these,
        // but a future config change could relax them. Belt + braces.
        if (!clientId.equals(claims.getAudience() == null || claims.getAudience().isEmpty()
                ? null : claims.getAudience().get(0))) {
            throw new GoogleTokenException("OAUTH_AUDIENCE_MISMATCH",
                    "Token audience does not match our client ID");
        }
        Object emailVerifiedObj = claims.getClaim("email_verified");
        boolean emailVerified = emailVerifiedObj instanceof Boolean b ? b
                : "true".equalsIgnoreCase(String.valueOf(emailVerifiedObj));
        if (!emailVerified) {
            throw new GoogleTokenException("OAUTH_EMAIL_UNVERIFIED",
                    "Google reports the email as unverified");
        }

        String email = stringClaim(claims, "email");
        String sub = claims.getSubject();
        if (email == null || sub == null) {
            throw new GoogleTokenException("OAUTH_CLAIMS_INCOMPLETE",
                    "Token missing email or sub");
        }
        return new VerifiedGoogleUser(
                sub,
                email.toLowerCase(),
                stringClaim(claims, "given_name"),
                stringClaim(claims, "family_name"),
                stringClaim(claims, "name"),
                stringClaim(claims, "picture"),
                stringClaim(claims, "locale"));
    }

    private static String stringClaim(JWTClaimsSet claims, String name) {
        try {
            return claims.getStringClaim(name);
        } catch (ParseException ignored) {
            return null;
        }
    }

    /** Parsed + verified Google identity. {@code subject} is Google's
     *  stable {@code sub} claim — preferred over email for lookups since
     *  the email can change at Google. */
    public record VerifiedGoogleUser(
            String subject,
            String email,
            String givenName,
            String familyName,
            String name,
            String pictureUrl,
            String locale) {}

    /** Stable error codes — never change them, dashboards group on them. */
    public static final class GoogleTokenException extends RuntimeException {
        private final String code;

        public GoogleTokenException(String code, String message) {
            super(message);
            this.code = code;
        }

        public String code() { return code; }
    }
}
