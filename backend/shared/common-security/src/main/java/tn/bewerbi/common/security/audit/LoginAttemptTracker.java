package tn.bewerbi.common.security.audit;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * Per-email failed-login counter backed by Redis. Layered on top of the gateway's coarse rate
 * limiter — that protects the service from absolute traffic; this one short-circuits credential
 * stuffing against a specific account.
 *
 * <p>{@code identity-service.AuthService} calls {@link #recordFailure(String)} on bad password and
 * {@link #reset(String)} on successful authentication. Before checking the password it calls
 * {@link #isLockedOut(String)} and returns {@code 429} if so.
 *
 * <p>Lockout: 10 failures within 10 minutes → block for 15 minutes. Tunable.
 */
public class LoginAttemptTracker {

    private static final String KEY_PREFIX = "auth:failed:";
    private static final String LOCKOUT_PREFIX = "auth:lock:";

    private final StringRedisTemplate redis;
    private final int maxFailures;
    private final Duration window;
    private final Duration lockout;

    public LoginAttemptTracker(StringRedisTemplate redis, int maxFailures, Duration window,
                               Duration lockout) {
        this.redis = redis;
        this.maxFailures = maxFailures;
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
                @Value("${bewerbi.security.login.windowSeconds:600}") long windowSec,
                @Value("${bewerbi.security.login.lockoutSeconds:900}") long lockoutSec) {
            return new LoginAttemptTracker(redis, maxFailures,
                    Duration.ofSeconds(windowSec), Duration.ofSeconds(lockoutSec));
        }
    }
}
