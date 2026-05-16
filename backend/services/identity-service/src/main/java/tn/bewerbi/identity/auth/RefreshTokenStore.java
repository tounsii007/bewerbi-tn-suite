package tn.bewerbi.identity.auth;

import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
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

    /**
     * Persist a freshly-issued refresh token's hash with metadata. Stored
     * as a tiny pipe-delimited string instead of JSON so we don't pull in
     * Jackson on this hot path:
     *   {@code <createdAtEpochSec>|<lastUsedAtEpochSec>|<ua>}
     * The user-agent is truncated to 200 chars so a hostile client
     * can't bloat Redis. If null/blank, just the timestamps are stored.
     */
    public void remember(UUID userId, String token, Duration ttl, String userAgent) {
        String ua = userAgent == null ? "" : userAgent.replace('|', ' ');
        if (ua.length() > 200) ua = ua.substring(0, 200);
        long now = Instant.now().getEpochSecond();
        String payload = now + "|" + now + "|" + ua;
        redis.opsForValue().set(key(userId, token), payload, ttl);
    }

    /**
     * Bump {@code lastUsedAt} without changing the createdAt / UA / TTL.
     * Called from AuthService.refresh on the *new* token (we want the
     * "now active" indicator on the freshly-rotated session, not the
     * one we just revoked).
     */
    public void touch(UUID userId, String token) {
        String k = key(userId, token);
        String existing = redis.opsForValue().get(k);
        if (existing == null) return;
        Long ttl = redis.getExpire(k);
        String[] parts = existing.split("\\|", 3);
        String createdAt = parts.length > 0 ? parts[0] : "0";
        String ua = parts.length > 2 ? parts[2] : "";
        String updated = createdAt + "|" + Instant.now().getEpochSecond() + "|" + ua;
        if (ttl != null && ttl > 0) {
            redis.opsForValue().set(k, updated, Duration.ofSeconds(ttl));
        } else {
            redis.opsForValue().set(k, updated);
        }
    }

    /** Back-compat shim — equivalent to {@link #remember(UUID, String, Duration, String)}
     * with no User-Agent. Keep callers that don't have the request context. */
    public void remember(UUID userId, String token, Duration ttl) {
        remember(userId, token, ttl, null);
    }

    public boolean isKnown(UUID userId, String token) {
        return Boolean.TRUE.equals(redis.hasKey(key(userId, token)));
    }

    public void revoke(UUID userId, String token) {
        redis.delete(key(userId, token));
    }

    /** Revoke by the *hash* of the token, used by the session-listing UI
     * where the user picks one of N sessions to terminate. The plain
     * token only ever lives client-side; from the server's POV, the
     * hash IS the session identifier. */
    public boolean revokeByHash(UUID userId, String tokenHash) {
        return Boolean.TRUE.equals(redis.delete(KEY_PREFIX + userId + ":" + tokenHash));
    }

    /** Returns one entry per active refresh token of the user. Most recently
     *  used first — typically the device the user is currently on. */
    public List<SessionInfo> list(UUID userId) {
        String prefix = KEY_PREFIX + userId + ":";
        ScanOptions options = ScanOptions.scanOptions().match(prefix + "*").count(100).build();
        List<SessionInfo> out = new ArrayList<>();
        redis.execute((org.springframework.data.redis.core.RedisCallback<Void>) connection -> {
            try (Cursor<byte[]> cursor = connection.keyCommands().scan(options)) {
                while (cursor.hasNext()) {
                    String fullKey = new String(cursor.next());
                    String hash = fullKey.substring(prefix.length());
                    String value = redis.opsForValue().get(fullKey);
                    long createdAt = 0;
                    long lastUsedAt = 0;
                    String ua = "";
                    if (value != null) {
                        String[] parts = value.split("\\|", 3);
                        if (parts.length >= 1) {
                            try { createdAt = Long.parseLong(parts[0]); }
                            catch (NumberFormatException ignore) { }
                        }
                        if (parts.length >= 2) {
                            try { lastUsedAt = Long.parseLong(parts[1]); }
                            catch (NumberFormatException ignore) {
                                // Backwards-compat: pre-Iter 55 rows have
                                // only `createdAt|ua`; treat the second
                                // segment as UA in that case.
                                ua = parts[1];
                            }
                        }
                        if (parts.length >= 3) ua = parts[2];
                    }
                    if (lastUsedAt == 0) lastUsedAt = createdAt;
                    Long ttl = redis.getExpire(fullKey);
                    out.add(new SessionInfo(hash, createdAt, lastUsedAt, ua,
                            ttl == null ? -1 : ttl));
                }
            }
            return null;
        });
        out.sort(Comparator.comparingLong(SessionInfo::lastUsedAt).reversed());
        return out;
    }

    public record SessionInfo(
            /** SHA-256 of the refresh token — stable handle for revoke. */
            String tokenHash,
            /** Unix-epoch seconds when the session was issued. */
            long createdAt,
            /** Unix-epoch seconds when the session last rotated. */
            long lastUsedAt,
            /** Truncated User-Agent of the issuing request. */
            String userAgent,
            /** Remaining TTL in seconds; -1 if none. */
            long expiresInSeconds) {}

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
