package tn.bewerbi.identity.auth;

import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.RSAKey;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.bewerbi.common.security.RsaKeyProvider;

/**
 * Exposes the public half of the RSA signing key at the standard
 * {@code /.well-known/jwks.json} location so downstream verifiers
 * (gateway, other microservices, future external IdP federation)
 * can fetch + cache it instead of being pinned to a file mount.
 *
 * <p>Public route — explicitly permitAll'd in
 * {@code SecurityOverrides}. The endpoint exposes only public-key
 * material; no risk of leaking signing capability.
 */
@RestController
public class JwksController {

    private final JWKSet jwkSet;

    public JwksController(RsaKeyProvider.RsaKeys keys) {
        RSAKey rsa = new RSAKey.Builder(keys.publicKey())
                .keyID(keys.keyId())
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(com.nimbusds.jose.JWSAlgorithm.RS256)
                .build();
        this.jwkSet = new JWKSet(rsa);
    }

    /** Standard OIDC discovery endpoint for the platform's public key(s). */
    @GetMapping(path = "/.well-known/jwks.json", produces = "application/json")
    public Map<String, Object> jwks() {
        return jwkSet.toJSONObject();
    }
}
