package tn.bewerbi.common.security.audit;

import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

/**
 * Iter 113 — per-IP credential-stuffing throttling. Uses a hand-rolled
 * in-memory StringRedisTemplate so the test runs without Docker /
 * Testcontainers. Mockito can't mock StringRedisTemplate on JDK 26
 * (bytecode constraints), so a thin subclass is the pragmatic
 * substitute.
 */
class LoginAttemptTrackerTest {

    private FakeRedis redis;
    private LoginAttemptTracker tracker;

    @BeforeEach
    void setUp() {
        redis = new FakeRedis();
        // Per-account threshold 10, per-IP threshold 3 (test-easy),
        // 10-min window, 15-min lockout.
        tracker = new LoginAttemptTracker(redis, 10, 3,
                Duration.ofMinutes(10), Duration.ofMinutes(15));
    }

    @Test
    void blankIpIsNoOp() {
        tracker.recordIpFailure(null);
        tracker.recordIpFailure("");
        tracker.recordIpFailure("   ");
        tracker.recordIpFailure("unknown");
        assertTrue(redis.store.isEmpty(), "blank IP must not write any key");
        assertFalse(tracker.isIpLockedOut(null));
        assertFalse(tracker.isIpLockedOut(""));
        assertEquals(0, tracker.remainingIpLockoutSeconds(null));
    }

    @Test
    void singleFailureIncrementsCounter() {
        tracker.recordIpFailure("1.2.3.4");
        assertEquals("1", redis.store.get("auth:failed-ip:1.2.3.4"));
        assertFalse(tracker.isIpLockedOut("1.2.3.4"));
    }

    @Test
    void crossingThresholdLocksOut() {
        for (int i = 0; i < 3; i++) tracker.recordIpFailure("1.2.3.4");
        assertTrue(tracker.isIpLockedOut("1.2.3.4"));
        // Counter cleared once lockout is set, so it doesn't keep climbing.
        assertNull(redis.store.get("auth:failed-ip:1.2.3.4"));
    }

    @Test
    void failuresBelowThresholdDoNotLockOut() {
        tracker.recordIpFailure("1.2.3.4");
        tracker.recordIpFailure("1.2.3.4");
        assertFalse(tracker.isIpLockedOut("1.2.3.4"));
    }

    @Test
    void resetIpClearsBothKeys() {
        for (int i = 0; i < 3; i++) tracker.recordIpFailure("5.6.7.8");
        assertTrue(tracker.isIpLockedOut("5.6.7.8"));
        tracker.resetIp("5.6.7.8");
        assertFalse(tracker.isIpLockedOut("5.6.7.8"));
        assertNull(redis.store.get("auth:failed-ip:5.6.7.8"));
        assertNull(redis.store.get("auth:lock-ip:5.6.7.8"));
    }

    @Test
    void perAccountAxisStillWorks() {
        for (int i = 0; i < 10; i++) tracker.recordFailure("alice@example.com");
        assertTrue(tracker.isLockedOut("alice@example.com"));
        // …and is independent of the IP axis.
        assertFalse(tracker.isIpLockedOut("1.2.3.4"));
    }

    @Test
    void perAccountAndPerIpThresholdsAreIndependent() {
        // Two failures from the same IP across two different accounts:
        // neither account hits its threshold, but the IP counter climbs.
        tracker.recordFailure("alice@example.com");
        tracker.recordFailure("bob@example.com");
        tracker.recordIpFailure("1.2.3.4");
        tracker.recordIpFailure("1.2.3.4");
        tracker.recordIpFailure("1.2.3.4");
        assertTrue(tracker.isIpLockedOut("1.2.3.4"),
                "credential-stuffing rotating accounts should still trip the IP axis");
        assertFalse(tracker.isLockedOut("alice@example.com"));
        assertFalse(tracker.isLockedOut("bob@example.com"));
    }

    /**
     * Minimal StringRedisTemplate subclass that only overrides the methods
     * LoginAttemptTracker actually calls. Everything else throws so a
     * future refactor that adds a new Redis op breaks loudly here.
     */
    static class FakeRedis extends StringRedisTemplate {
        final Map<String, String> store = new HashMap<>();
        final Map<String, Long> ttl = new HashMap<>();

        @Override
        public ValueOperations<String, String> opsForValue() {
            return new ValueOperations<>() {
                @Override
                public void set(String key, String value) { store.put(key, value); }

                @Override
                public void set(String key, String value, java.time.Duration timeout) {
                    store.put(key, value);
                    ttl.put(key, timeout.getSeconds());
                }

                @Override
                public Long increment(String key) {
                    long n = Long.parseLong(store.getOrDefault(key, "0")) + 1;
                    store.put(key, Long.toString(n));
                    return n;
                }

                // The remaining ValueOperations methods aren't used by
                // LoginAttemptTracker — implementations that throw catch
                // accidental new dependencies in CI.
                @Override public Boolean setIfAbsent(String k, String v) { throw nope(); }
                @Override public Boolean setIfAbsent(String k, String v, long t, java.util.concurrent.TimeUnit u) { throw nope(); }
                @Override public Boolean setIfAbsent(String k, String v, java.time.Duration d) { throw nope(); }
                @Override public Boolean setIfAbsent(String k, String v, org.springframework.data.redis.core.types.Expiration e) { throw nope(); }
                @Override public Boolean setIfPresent(String k, String v) { throw nope(); }
                @Override public Boolean setIfPresent(String k, String v, long t, java.util.concurrent.TimeUnit u) { throw nope(); }
                @Override public Boolean setIfPresent(String k, String v, java.time.Duration d) { throw nope(); }
                @Override public Boolean setIfPresent(String k, String v, org.springframework.data.redis.core.types.Expiration e) { throw nope(); }
                @Override public void set(String k, String v, org.springframework.data.redis.core.types.Expiration e) { throw nope(); }
                @Override public Boolean set(String k, String v, java.util.function.Consumer<org.springframework.data.redis.core.SetSpec<String, String>> c) { throw nope(); }
                @Override public String setGet(String k, String v, long t, java.util.concurrent.TimeUnit u) { throw nope(); }
                @Override public String setGet(String k, String v, java.time.Duration d) { throw nope(); }
                @Override public String setGet(String k, String v, org.springframework.data.redis.core.types.Expiration e) { throw nope(); }
                @Override public String setGet(String k, String v, java.util.function.Consumer<org.springframework.data.redis.core.SetSpec<String, String>> c) { throw nope(); }
                @Override public void set(String k, String v, long offset) { throw nope(); }
                @Override public void set(String k, String v, long t, java.util.concurrent.TimeUnit u) { throw nope(); }
                @Override public void multiSet(java.util.Map<? extends String, ? extends String> map) { throw nope(); }
                @Override public Boolean multiSetIfAbsent(java.util.Map<? extends String, ? extends String> map) { throw nope(); }
                @Override public Boolean compareAndSet(String k, String expected, String update) { throw nope(); }
                @Override public String get(Object key) { return store.get((String) key); }
                @Override public String getAndDelete(String key) { return store.remove(key); }
                @Override public String getAndExpire(String key, long t, java.util.concurrent.TimeUnit u) { throw nope(); }
                @Override public String getAndExpire(String key, java.time.Duration d) { throw nope(); }
                @Override public String getAndExpire(String key, org.springframework.data.redis.core.types.Expiration expiration) { throw nope(); }
                @Override public String getAndPersist(String key) { throw nope(); }
                @Override public String getAndSet(String key, String value) { throw nope(); }
                @Override public java.util.List<String> multiGet(java.util.Collection<String> keys) { throw nope(); }
                @Override public Long increment(String k, long delta) { throw nope(); }
                @Override public Double increment(String k, double delta) { throw nope(); }
                @Override public Long decrement(String k) { throw nope(); }
                @Override public Long decrement(String k, long delta) { throw nope(); }
                @Override public Integer append(String key, String value) { throw nope(); }
                @Override public String get(String key, long start, long end) { throw nope(); }
                @Override public Long size(String key) { throw nope(); }
                @Override public Boolean setBit(String key, long offset, boolean value) { throw nope(); }
                @Override public Boolean getBit(String key, long offset) { throw nope(); }
                @Override public java.util.List<Long> bitField(String key, org.springframework.data.redis.connection.BitFieldSubCommands cmds) { throw nope(); }
                @Override public org.springframework.data.redis.core.RedisOperations<String, String> getOperations() { return null; }

                private RuntimeException nope() {
                    return new UnsupportedOperationException(
                            "FakeRedis ValueOperations: method not used by LoginAttemptTracker");
                }
            };
        }

        @Override
        public Boolean hasKey(String key) {
            return store.containsKey(key);
        }

        @Override
        public Boolean expire(String key, java.time.Duration timeout) {
            if (!store.containsKey(key)) return false;
            ttl.put(key, timeout.getSeconds());
            return true;
        }

        @Override
        public Long getExpire(String key) {
            return ttl.getOrDefault(key, -1L);
        }

        @Override
        public Boolean delete(String key) {
            ttl.remove(key);
            return store.remove(key) != null;
        }
    }
}
