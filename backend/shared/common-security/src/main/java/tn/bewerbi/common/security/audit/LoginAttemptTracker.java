package tn.bewerbi.common.security.audit;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Per-email and per-IP failed-login counter backed by Redis. Layered on top of the gateway's
 * coarse rate limiter — that protects the service from absolute traffic; this one short-circuits
 * credential stuffing.
 *
 * <p>Two independent axes:
 * <ul>
 *   <li><b>Per-account</b> (Iter 47): 10 failures / 10 min on the email
 *       triggers a 15-min lockout. Defends a single account against a
 *       focused brute-force.</li>
 *   <li><b>Per-IP</b> (Iter 113): a higher threshold (default 50 / 10 min)
 *       on the IP triggers a 15-min lockout. Catches credential-stuffing
 *       that rotates accounts but stays on a single source — the
 *       attacker pattern where no single account ever hits the per-
 *       account limit but the IP probes thousands of (email, password)
 *       combinations.</li>
 * </ul>
 * Thresholds are independent: per-IP is intentionally looser to keep
 * legitimate shared IPs (offices, NAT) from being false-positived.
 *
 * <p>{@code AuthService} consults both axes before bcrypt; either one
 * being locked → 429 with {@code Retry-After}. On bad password both
 * counters increment; on success both reset for the active key.
 *
 * <p>If the per-IP IP is null/blank/"unknown" (no servlet request
 * context, async test, etc.) the per-IP logic is skipped — there is
 * no usable key to lock.
 */
public class LoginAttemptTracker {

    private static final String KEY_PREFIX = "auth:failed:";
    private static final String LOCKOUT_PREFIX = "auth:lock:";
    private static final String IP_KEY_PREFIX = "auth:failed-ip:";
    private static final String IP_LOCKOUT_PREFIX = "auth:lock-ip:";

    private final StringRedisTemplate redis;
    private final int maxFailures;
    private final int maxIpFailures;
    private final Duration window;
    private final Duration lockout;

    public LoginAttemptTracker(StringRedisTemplate redis, int maxFailures, int maxIpFailures,
                               Duration window, Duration lockout) {
        this.redis = redis;
        this.maxFailures = maxFailures;
        this.maxIpFailures = maxIpFailures;
        this.window = window;
        this.lockout = lockout;
    }

    public boolean isLockedOut(String email) {
        return Boolean.TRUE.equals(redis.hasKey(LOCKOUT_PREFIX + normalize(email)));
    }

    public long remainingLockoutSeconds(String email) {
        Long ttl = redis.getExpire(LOCKOUT_PREFIX + normalize(email));
        return ttl == null ? 0 : Math.max(0, ttl);
    }

    public void recordFailure(String email) {
        String k = KEY_PREFIX + normalize(email);
        Long count = redis.opsForValue().increment(k);
        if (count != null && count == 1L) {
            redis.expire(k, window);
        }
        if (count != null && count >= maxFailures) {
            redis.opsForValue().set(LOCKOUT_PREFIX + normalize(email), "1", lockout);
            redis.delete(k);
        }
    }

    public void reset(String email) {
        redis.delete(KEY_PREFIX + normalize(email));
        redis.delete(LOCKOUT_PREFIX + normalize(email));
    }

    /** Per-IP variant of {@link #isLockedOut}. Returns false for blank IPs. */
    public boolean isIpLockedOut(String ip) {
        if (isBlankIp(ip)) return false;
        return Boolean.TRUE.equals(redis.hasKey(IP_LOCKOUT_PREFIX + ip));
    }

    public long remainingIpLockoutSeconds(String ip) {
        if (isBlankIp(ip)) return 0;
        Long ttl = redis.getExpire(IP_LOCKOUT_PREFIX + ip);
        return ttl == null ? 0 : Math.max(0, ttl);
    }

    public void recordIpFailure(String ip) {
        if (isBlankIp(ip)) return;
        String k = IP_KEY_PREFIX + ip;
        Long count = redis.opsForValue().increment(k);
        if (count != null && count == 1L) {
            redis.expire(k, window);
        }
        if (count != null && count >= maxIpFailures) {
            redis.opsForValue().set(IP_LOCKOUT_PREFIX + ip, "1", lockout);
            redis.delete(k);
        }
    }

    public void resetIp(String ip) {
        if (isBlankIp(ip)) return;
        redis.delete(IP_KEY_PREFIX + ip);
        redis.delete(IP_LOCKOUT_PREFIX + ip);
    }

    private static boolean isBlankIp(String ip) {
        if (ip == null) return true;
        String t = ip.trim();
        return t.isEmpty() || "unknown".equalsIgnoreCase(t);
    }

    private static String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnBean(StringRedisTemplate.class)
    public static class Config {
        @Bean
        public LoginAttemptTracker loginAttemptTracker(
                StringRedisTemplate redis,
                @Value("${bewerbi.security.login.maxFailures:10}") int maxFailures,
                @Value("${bewerbi.security.login.maxIpFailures:50}") int maxIpFailures,
                @Value("${bewerbi.security.login.windowSeconds:600}") long windowSec,
                @Value("${bewerbi.security.login.lockoutSeconds:900}") long lockoutSec) {
            return new LoginAttemptTracker(redis, maxFailures, maxIpFailures,
                    Duration.ofSeconds(windowSec), Duration.ofSeconds(lockoutSec));
        }
    }
}
