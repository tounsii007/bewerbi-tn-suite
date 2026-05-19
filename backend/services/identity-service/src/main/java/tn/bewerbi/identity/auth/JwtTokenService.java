package tn.bewerbi.identity.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import tn.bewerbi.common.security.RsaKeyProvider;
import tn.bewerbi.identity.domain.User;

/**
 * Mints and validates JWTs for the identity-service.
 *
 * <p>Iter 107 cut: HS256 → RS256. The signing key (private RSA) lives only
 * on this service; verifier services load just the public key. The JWT
 * header now carries a {@code kid} claim that matches the JWKS endpoint
 * served at {@code /.well-known/jwks.json}, so any future key rotation
 * can be staged without a flag day.
 */
@Service
public class JwtTokenService {

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final String keyId;

    @Value("${bewerbi.security.jwt.issuer}") private String issuer;
    @Value("${bewerbi.security.jwt.access-ttl-minutes}") private int accessMin;
    @Value("${bewerbi.security.jwt.refresh-ttl-days}") private int refreshDays;

    public JwtTokenService(JwtEncoder encoder, JwtDecoder decoder,
                           RsaKeyProvider.RsaKeys keys) {
        this.encoder = encoder;
        this.decoder = decoder;
        this.keyId = keys.keyId();
    }

    /** Exposed so callers can surface the TTL to the client. */
    public int accessTtlSeconds() { return accessMin * 60; }
    public long refreshTtlSeconds() { return (long) refreshDays * 24 * 3600; }

    public AccessToken issueAccess(User user) {
        var now = Instant.now();
        var expires = now.plus(Duration.ofMinutes(accessMin));
        var claims = JwtClaimsSet.builder()
                .issuer(issuer).issuedAt(now).expiresAt(expires)
                .subject(user.getId().toString())
                .claim("email", user.getEmail())
                .claim("roles", List.of(user.getRole().name()))
                .claim("token_type", "access")
                .claim("locale", user.getPreferredLocale())
                .build();
        var headers = JwsHeader.with(SignatureAlgorithm.RS256).keyId(keyId).build();
        String token = encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
        return new AccessToken(token, expires);
    }

    public RefreshToken issueRefresh(UUID userId) {
        var now = Instant.now();
        var expires = now.plus(Duration.ofDays(refreshDays));
        var claims = JwtClaimsSet.builder()
                .issuer(issuer).issuedAt(now).expiresAt(expires)
                .subject(userId.toString()).claim("token_type", "refresh").build();
        var headers = JwsHeader.with(SignatureAlgorithm.RS256).keyId(keyId).build();
        String token = encoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
        return new RefreshToken(token, expires);
    }

    public UUID validateRefresh(String token) {
        var decoded = decoder.decode(token);
        if (!"refresh".equals(decoded.getClaimAsString("token_type"))) {
            throw new IllegalArgumentException("Not a refresh token");
        }
        return UUID.fromString(decoded.getSubject());
    }

    public record AccessToken(String token, Instant expiresAt) {}
    public record RefreshToken(String token, Instant expiresAt) {}
}
