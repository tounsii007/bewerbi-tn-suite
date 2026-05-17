package tn.bewerbi.common.security;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Checks a candidate password against the Have-I-Been-Pwned
 * "Pwned Passwords" k-anonymity API. The SHA-1 of the password is
 * computed locally; only the first 5 hex chars cross the network, so
 * the API operator never learns the password — they only know that
 * *someone* asked about a 5-char prefix.
 *
 * <p>Disabled by default — opt in with
 * {@code bewerbi.security.password.breach-check.enabled=true}. Calls
 * out to the public {@code https://api.pwnedpasswords.com/range/}
 * endpoint, which is rate-limited and free for non-commercial use.
 *
 * <p>Fail-open semantics: if HIBP is unreachable, slow, or returns a
 * 5xx, the password is treated as not-breached. This keeps a
 * third-party outage from blocking new registrations — security
 * regressions are a worse trade-off than a temporarily-leaked password
 * slipping through.
 *
 * <p>Auto-wired into {@code AuthService} via {@code ObjectProvider}.
 * When the bean is absent, the breach check is simply skipped.
 */
public class BreachedPasswordChecker {

    private static final Logger log = LoggerFactory.getLogger(BreachedPasswordChecker.class);
    private static final URI API_BASE = URI.create("https://api.pwnedpasswords.com/range/");

    private final HttpClient http;
    private final Duration timeout;
    private final int minCount;

    public BreachedPasswordChecker(Duration timeout, int minCount) {
        this.http = HttpClient.newBuilder()
                .connectTimeout(timeout)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
        this.timeout = timeout;
        this.minCount = minCount;
    }

    /**
     * Returns {@code true} if HIBP reports the password as having
     * appeared in at least {@code minCount} breaches. Fail-open
     * (returns {@code false}) on any error.
     */
    public boolean isBreached(String password) {
        if (password == null || password.isBlank()) return false;
        String sha1Hex = sha1Hex(password).toUpperCase();
        String prefix = sha1Hex.substring(0, 5);
        String suffix = sha1Hex.substring(5);
        try {
            HttpRequest req = HttpRequest.newBuilder(API_BASE.resolve(prefix))
                    .timeout(timeout)
                    // Padding asks HIBP to return at least 800 entries so
                    // an observer can't trivially correlate the response
                    // size to the prefix. Free option, always set it.
                    .header("Add-Padding", "true")
                    .header("User-Agent", "bewerbi-tn-backend")
                    .GET()
                    .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() / 100 != 2) {
                log.warn("HIBP returned {} for prefix {}; failing open",
                        res.statusCode(), prefix);
                return false;
            }
            return containsBreachedSuffix(res.body(), suffix, minCount);
        } catch (Exception e) {
            log.warn("HIBP check failed ({}); failing open", e.getMessage());
            return false;
        }
    }

    /** Package-private for testing. */
    static boolean containsBreachedSuffix(String body, String suffix, int minCount) {
        for (String line : body.split("\\r?\\n")) {
            int colon = line.indexOf(':');
            if (colon <= 0) continue;
            String candidate = line.substring(0, colon);
            if (!candidate.equalsIgnoreCase(suffix)) continue;
            try {
                int count = Integer.parseInt(line.substring(colon + 1).trim());
                return count >= minCount;
            } catch (NumberFormatException ignore) {
                return true;
            }
        }
        return false;
    }

    private static String sha1Hex(String s) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            return HexFormat.of().formatHex(md.digest(s.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-1 unavailable", e);
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnProperty(value = "bewerbi.security.password.breach-check.enabled",
            havingValue = "true")
    public static class Config {
        @Bean
        public BreachedPasswordChecker breachedPasswordChecker(
                @Value("${bewerbi.security.password.breach-check.timeoutMs:1500}") long timeoutMs,
                @Value("${bewerbi.security.password.breach-check.minCount:10}") int minCount) {
            return new BreachedPasswordChecker(Duration.ofMillis(timeoutMs), minCount);
        }
    }
}
