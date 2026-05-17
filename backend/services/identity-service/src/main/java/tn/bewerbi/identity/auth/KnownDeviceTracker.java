package tn.bewerbi.identity.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.StringRedisTemplate;

/**
 * "Has this user signed in from this device before?" lookup, backed by
 * Redis. Drives the new-device-sign-in mail (Iter 76) — the first time
 * an account sees a particular {@code (ip, userAgent)} pair we publish
 * a notification, and on every subsequent login from the same
 * fingerprint we stay quiet.
 *
 * <p>Storage shape: one Redis key per (user, fingerprint), value `1`,
 * with a 180-day TTL so a device that goes unused for half a year is
 * forgotten and a fresh sign-in from it counts as "new" again. That
 * balances inbox-noise (a device used last week shouldn't trigger
 * email) against catching legitimately-new sessions.
 *
 * <p>Fingerprint is SHA-256 of {@code "<ip>|<ua>"} — opaque and
 * fixed-size, so a hostile UA can't bloat Redis with multi-kB keys
 * and we don't store the raw IP next to the user ID.
 */
public class KnownDeviceTracker {

    private static final String KEY_PREFIX = "auth:device:";

    private final StringRedisTemplate redis;
    private final Duration ttl;

    public KnownDeviceTracker(StringRedisTemplate redis, Duration ttl) {
        this.redis = redis;
        this.ttl = ttl;
    }

    /**
     * Record the device for {@code userId} and return {@code true} when
     * the fingerprint is new (the caller should publish the
     * {@code NewDeviceSignIn} event).
     *
     * <p>If {@code ip} or {@code userAgent} is null/blank we treat the
     * device as "unknown shape" and silently skip — better than firing
     * an email on every load-balancer health probe.
     */
    public boolean recordAndCheckNew(UUID userId, String ip, String userAgent) {
        if (userId == null || ip == null || ip.isBlank()
                || userAgent == null || userAgent.isBlank()) {
            return false;
        }
        String key = KEY_PREFIX + userId + ":" + fingerprint(ip, userAgent);
        // setIfAbsent returns true when the key did NOT exist, i.e. new
        // device. The set call also stamps the TTL so the window
        // refreshes whenever the user comes back from the same device.
        Boolean wasNew = redis.opsForValue().setIfAbsent(key, "1", ttl);
        if (Boolean.TRUE.equals(wasNew)) return true;
        // Existing key — refresh the TTL so an active device doesn't
        // expire and start nagging the user again.
        redis.expire(key, ttl);
        return false;
    }

    /**
     * Drop every known-device entry for the user — called from
     * {@code AuthService.deleteAccount} so a hard-deleted account
     * doesn't leave per-device fingerprints lying around in Redis
     * past its 180-day TTL.
     */
    public void forgetUser(UUID userId) {
        if (userId == null) return;
        String pattern = KEY_PREFIX + userId + ":*";
        var options = org.springframework.data.redis.core.ScanOptions
                .scanOptions().match(pattern).count(100).build();
        java.util.List<String> batch = new java.util.ArrayList<>();
        redis.execute((org.springframework.data.redis.core.RedisCallback<Void>) connection -> {
            try (var cursor = connection.keyCommands().scan(options)) {
                while (cursor.hasNext()) {
                    batch.add(new String(cursor.next()));
                    if (batch.size() >= 500) {
                        redis.delete(batch);
                        batch.clear();
                    }
                }
            }
            return null;
        });
        if (!batch.isEmpty()) redis.delete(batch);
    }

    private static String fingerprint(String ip, String userAgent) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest((ip + "|" + userAgent).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    @Configuration(proxyBeanMethods = false)
    @ConditionalOnBean(StringRedisTemplate.class)
    public static class Config {
        @Bean
        public KnownDeviceTracker knownDeviceTracker(
                StringRedisTemplate redis,
                @Value("${bewerbi.security.device.ttlDays:180}") long ttlDays) {
            return new KnownDeviceTracker(redis, Duration.ofDays(ttlDays));
        }
    }
}
