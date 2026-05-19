package tn.bewerbi.common.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

/**
 * Source of the RSA key pair used to sign / verify JWTs. Replaces the
 * Iter 1 setup where every microservice shared the same HS256 secret
 * — which meant a compromise in any one service yielded a token-forging
 * key for the whole platform.
 *
 * <p>Two roles:
 * <ul>
 *   <li><b>identity-service</b> (signer + verifier) — both private and
 *       public key are configured.</li>
 *   <li><b>everything else</b> (verifier-only) — only the public key
 *       is configured. Even a full RCE in any verifier-only service
 *       cannot mint new tokens.</li>
 * </ul>
 *
 * <h2>Key sources (in order)</h2>
 * <ol>
 *   <li>{@code bewerbi.security.jwt.private-key} / {@code public-key}
 *       — inline PEM string in env / yaml.</li>
 *   <li>{@code bewerbi.security.jwt.private-key-path} / {@code public-key-path}
 *       — filesystem path to a {@code .pem} file (PKCS8 for the
 *       private key, X.509 SubjectPublicKeyInfo for the public).</li>
 *   <li>Auto-generated 2048-bit RSA pair on startup — DEV ONLY. Fails
 *       fast under the {@code prod} profile so production never accidentally
 *       runs with an ephemeral key (would invalidate every issued
 *       token on every restart and leave forensic gaps).</li>
 * </ol>
 *
 * <h2>Generating production keys</h2>
 * <pre>
 *   openssl genrsa -out private.pem 2048
 *   openssl rsa -in private.pem -pubout -out public.pem
 * </pre>
 * Mount {@code private.pem} only on the identity-service pod;
 * mount {@code public.pem} on every other pod (+ identity-service).
 */
@Configuration
public class RsaKeyProvider {

    private static final Logger log = LoggerFactory.getLogger(RsaKeyProvider.class);

    @Value("${bewerbi.security.jwt.private-key:}")
    private String privateKeyPem;

    @Value("${bewerbi.security.jwt.private-key-path:}")
    private String privateKeyPath;

    @Value("${bewerbi.security.jwt.public-key:}")
    private String publicKeyPem;

    @Value("${bewerbi.security.jwt.public-key-path:}")
    private String publicKeyPath;

    /** Key identifier embedded in the JWS header + JWKS response.
     *  Lets clients pre-compute key rotation without re-issuing tokens. */
    @Value("${bewerbi.security.jwt.key-id:bewerbi-default}")
    private String keyId;

    private final Environment env;
    private final boolean prodProfile;

    private RSAPrivateKey privateKey;
    private RSAPublicKey publicKey;
    private boolean keysGenerated;

    public RsaKeyProvider(Environment env) {
        this.env = env;
        this.prodProfile = isProdProfile(env);
        loadOrGenerate();
    }

    @Bean
    public RsaKeys rsaKeys() {
        return new RsaKeys(privateKey, publicKey, keyId);
    }

    /** Returned bean — package data over the raw key types for DI. */
    public record RsaKeys(RSAPrivateKey privateKey, RSAPublicKey publicKey, String keyId) {
        public boolean hasSigner() {
            return privateKey != null;
        }
    }

    private void loadOrGenerate() {
        Optional<RSAPublicKey> pub = resolvePublicKey();
        Optional<RSAPrivateKey> priv = resolvePrivateKey();

        if (pub.isPresent() && priv.isPresent()) {
            this.publicKey = pub.get();
            this.privateKey = priv.get();
            log.info("Loaded RSA key pair (signer mode) — kid={}", keyId);
            return;
        }
        if (pub.isPresent()) {
            // Verifier-only: this service can verify tokens but cannot mint
            // new ones. Exactly what we want for everything except identity.
            this.publicKey = pub.get();
            log.info("Loaded RSA public key (verifier-only mode) — kid={}", keyId);
            return;
        }

        if (prodProfile) {
            throw new IllegalStateException(
                    "RSA keys missing under the `prod` profile. Set "
                            + "bewerbi.security.jwt.public-key(-path) on every service "
                            + "and additionally bewerbi.security.jwt.private-key(-path) on "
                            + "identity-service. Generate with `openssl genrsa -out "
                            + "private.pem 2048 && openssl rsa -in private.pem -pubout "
                            + "-out public.pem`.");
        }

        // Dev fallback — generate an ephemeral pair. Logs at WARN so it's
        // hard to miss in a CI log if someone deploys without keys.
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            KeyPair kp = gen.generateKeyPair();
            this.privateKey = (RSAPrivateKey) kp.getPrivate();
            this.publicKey = (RSAPublicKey) kp.getPublic();
            this.keysGenerated = true;
            log.warn("No RSA keys configured — generated an ephemeral 2048-bit pair "
                    + "for this JVM. DEV ONLY. Tokens will be invalidated on restart.");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("RSA unavailable", e);
        }
    }

    private Optional<RSAPublicKey> resolvePublicKey() {
        return resolvePem(publicKeyPem, publicKeyPath).map(RsaKeyProvider::parsePublicKey);
    }

    private Optional<RSAPrivateKey> resolvePrivateKey() {
        return resolvePem(privateKeyPem, privateKeyPath).map(RsaKeyProvider::parsePrivateKey);
    }

    /** Shared loader — public so reactive consumers (the gateway) can
     *  reuse the same code path without depending on the servlet-based
     *  auto-configuration in this module. */
    public static Optional<String> resolvePem(String inline, String path) {
        if (inline != null && !inline.isBlank()) return Optional.of(inline);
        if (path != null && !path.isBlank()) return Optional.of(readPath(path));
        return Optional.empty();
    }

    /** Parse a PEM-encoded X.509 SubjectPublicKeyInfo into an RSA public key. */
    public static RSAPublicKey parsePublicKey(String pem) {
        try {
            byte[] der = pemBody(pem);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return (RSAPublicKey) kf.generatePublic(new X509EncodedKeySpec(der));
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Invalid RSA public key: " + e.getMessage(), e);
        }
    }

    /** Parse a PEM-encoded PKCS8 private key into an RSA private key. */
    public static RSAPrivateKey parsePrivateKey(String pem) {
        try {
            byte[] der = pemBody(pem);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return (RSAPrivateKey) kf.generatePrivate(new PKCS8EncodedKeySpec(der));
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Invalid RSA private key (expect PKCS8 PEM): "
                    + e.getMessage(), e);
        }
    }

    /** Accepts {@code classpath:foo/bar.pem} as well as plain filesystem
     *  paths so the same property can pin a dev key from common-security's
     *  resources or a prod key from a mounted secret file. */
    private static String readPath(String path) {
        try {
            if (path.startsWith("classpath:")) {
                String resource = path.substring("classpath:".length());
                try (var in = RsaKeyProvider.class.getClassLoader()
                        .getResourceAsStream(resource)) {
                    if (in == null) {
                        throw new IllegalStateException(
                                "RSA key not on classpath: " + resource);
                    }
                    return new String(in.readAllBytes(), StandardCharsets.UTF_8);
                }
            }
            return Files.readString(Path.of(path), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read RSA key file: " + path, e);
        }
    }

    /** Strip the {@code -----BEGIN ...-----} headers + whitespace, return raw DER. */
    private static byte[] pemBody(String pem) {
        String body = pem.replaceAll("-----BEGIN [^-]+-----", "")
                .replaceAll("-----END [^-]+-----", "")
                .replaceAll("\\s", "");
        return Base64.getDecoder().decode(body);
    }

    private static boolean isProdProfile(Environment env) {
        for (String p : env.getActiveProfiles()) {
            if ("prod".equalsIgnoreCase(p) || "production".equalsIgnoreCase(p)) return true;
        }
        return false;
    }
}
