package tn.bewerbi.identity.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import tn.bewerbi.common.security.TokenHasher;

/**
 * Redis-backed registry of valid refresh-token hashes.
 *
 * <p>Tokens are never persisted in plaintext. Since Iter 112 the
 * fingerprint is HMAC-SHA-256 keyed by a server-side pepper (see
 * {@link TokenHasher}); a Redis dump alone is therefore useless even
 * if the token-domain entropy assumption were ever wrong. Each hash
 * is stored with a TTL matching the refresh-token lifetime, which
 * gives us automatic expiry without a background sweeper.
 *
 * <p>Rotation: every successful refresh rotates the token (the old hash
 * is deleted, a new one issued). Attempted reuse of a rotated token
 * means the hash is already absent → the call is rejected. The
 * lookup path tries both the new HMAC and the legacy SHA-256 hash
 * during the migration window so pre-Iter-112 Redis rows keep
 * validating until they expire / rotate.
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
        remember(userId, token, ttl, userAgent, null);
    }

    /**
     * Same as {@link #remember(UUID, String, Duration, String)} but
     * also captures the client IP. Payload format gains a 4th slot:
     * {@code <createdAt>|<lastUsedAt>|<ua>|<ip>}. Older 3-slot rows
     * stay parseable in {@link #list} (IP collapses to empty string).
     */
    public void remember(UUID userId, String token, Duration ttl,
                         String userAgent, String ip) {
        String ua = sanitise(userAgent, 200);
        String safeIp = sanitise(ip, 45); // IPv6 textual max
        long now = Instant.now().getEpochSecond();
        String payload = now + "|" + now + "|" + ua + "|" + safeIp;
        redis.opsForValue().set(key(userId, token), payload, ttl);
    }

    private static String sanitise(String value, int maxLen) {
        if (value == null) return "";
        String safe = value.replace('|', ' ');
        return safe.length() > maxLen ? safe.substring(0, maxLen) : safe;
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
        // Limit 4 so we keep both UA (slot 2) AND IP (slot 3) if the row
        // was written with the Iter 92 4-field format. Older 3-field
        // rows leave the IP slot empty.
        String[] parts = existing.split("\\|", 4);
        String createdAt = parts.length > 0 ? parts[0] : "0";
        String ua = parts.length > 2 ? parts[2] : "";
        String ip = parts.length > 3 ? parts[3] : "";
        String updated = createdAt + "|" + Instant.now().getEpochSecond()
                + "|" + ua + "|" + ip;
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
        if (Boolean.TRUE.equals(redis.hasKey(key(userId, token)))) return true;
        // Iter 112 migration window: legacy Redis rows keyed by the
        // pre-pepper SHA-256 still validate until they naturally expire.
        // The pepper alone is enough audit-wise — once existing sessions
        // have rotated (30-day TTL on refresh tokens), all live rows
        // are HMAC-keyed and this fallback becomes dead code.
        return Boolean.TRUE.equals(redis.hasKey(legacyKey(userId, token)));
    }

    public void revoke(UUID userId, String token) {
        redis.delete(key(userId, token));
        redis.delete(legacyKey(userId, token));
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
                    String ip = "";
                    if (value != null) {
                        // Limit 4 covers the Iter 92 format
                        // (createdAt|lastUsedAt|ua|ip); 3-segment Iter 55
                        // rows and 2-segment legacy rows still parse.
                        String[] parts = value.split("\\|", 4);
                        if (parts.length >= 1) {
                            try { createdAt = Long.parseLong(parts[0]); }
                            catch (NumberFormatException ignore) { }
                        }
                        if (parts.length >= 2) {
                            try { lastUsedAt = Long.parseLong(parts[1]); }
                            catch (NumberFormatException ignore) {
                                // Pre-Iter 55: `createdAt|ua`.
                                ua = parts[1];
                            }
                        }
                        if (parts.length >= 3) ua = parts[2];
                        if (parts.length >= 4) ip = parts[3];
                    }
                    if (lastUsedAt == 0) lastUsedAt = createdAt;
                    Long ttl = redis.getExpire(fullKey);
                    out.add(new SessionInfo(hash, createdAt, lastUsedAt, ua, ip,
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
            /** Client IP at session-issue time. Empty for legacy rows
             *  written before Iter 92. */
            String ip,
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

    /** Pre-Iter-112 key shape — plain SHA-256, no pepper. Used only on
     *  the read path during the migration window so existing live
     *  sessions keep working until they rotate. */
    private static String legacyKey(UUID userId, String token) {
        return KEY_PREFIX + userId + ":" + TokenHasher.legacySha256(token);
    }

    /**
     * Public hash entry point — Iter 112 routes through the peppered
     * HMAC-SHA-256. Same 64-hex-char output shape as the previous
     * SHA-256, so the session-handle UX (DELETE /sessions/{hash}) and
     * Iter 88 GDPR cascade keep working unchanged.
     */
    static String hash(String token) {
        return TokenHasher.hash(token);
    }
}
