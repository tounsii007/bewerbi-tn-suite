package tn.bewerbi.identity.auth;

import java.security.MessageDigest;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

/**
 * Redis-backed registry of valid refresh-token hashes.
 *
 * We never store tokens in plaintext — only SHA-256 fingerprints — so a
 * Redis dump doesn't leak credentials. Each hash is saved with a TTL matching
 * the refresh-token lifetime, which gives us automatic expiry without a
 * background sweeper.
 *
 * Rotation: every successful refresh rotates the token (the old hash is
 * deleted, a new one issued). Attempted reuse of a rotated token means
 * the hash is already absent → the call is rejected.
 */
@Component
public class RefreshTokenStore {

    private static final String KEY_PREFIX = "auth:refresh:";

    private final StringRedisTemplate redis;

    public RefreshTokenStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void remember(UUID userId, String token, Duration ttl) {
        redis.opsForValue().set(key(userId, token), "1", ttl);
    }

    public boolean isKnown(UUID userId, String token) {
        return Boolean.TRUE.equals(redis.hasKey(key(userId, token)));
    }

    public void revoke(UUID userId, String token) {
        redis.delete(key(userId, token));
    }

    /**
     * Invalidate every refresh token of the user (e.g. "sign out all devices"
     * or automatic-reuse detection).
     *
     * <p>Uses SCAN (cursor) instead of {@code KEYS} because KEYS is O(N)
     * and blocks the Redis main thread — fine for a small dev instance,
     * bad once a node has hundreds of thousands of session keys. SCAN is
     * non-blocking and incremental.
     */
    public void revokeAll(UUID userId) {
        String pattern = KEY_PREFIX + userId + ":*";
        ScanOptions options = ScanOptions.scanOptions().match(pattern).count(100).build();
        List<String> batch = new ArrayList<>();
        redis.execute((org.springframework.data.redis.core.RedisCallback<Void>) connection -> {
            try (Cursor<byte[]> cursor = connection.keyCommands().scan(options)) {
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

    private static String key(UUID userId, String token) {
        return KEY_PREFIX + userId + ":" + hash(token);
    }

    static String hash(String token) {
        try {
            var md = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(md.digest(token.getBytes()));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
