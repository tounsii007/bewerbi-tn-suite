package tn.bewerbi.common.i18n.cache;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Supplier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * In-process L1 cache that sits in front of the Redis-backed {@code MessageClient}. The Redis
 * cache already keeps i18n payloads fast (~1-2 ms RTT inside a cluster), but at the volume
 * services hit it during request handling, a small local cache shaves another order of
 * magnitude off the hot path.
 *
 * <p>Trade-off: cache invalidation is eventual. The shorter TTL keeps stale data exposure
 * bounded — the default 60s matches what most i18n-driven UI elements can tolerate.
 *
 * <p>Not Caffeine — deliberately. The cache is tiny (per-service, per-locale), and a
 * {@code ConcurrentHashMap} with expiry timestamps is enough; one fewer dependency.
 */
public class L1MessageCache {

    private static final Logger log = LoggerFactory.getLogger(L1MessageCache.class);

    private record Entry(Object value, long expiresAt) {}

    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private final long ttlMillis;

    public L1MessageCache(Duration ttl) {
        this.ttlMillis = ttl.toMillis();
    }

    /** Returns the cached value or {@code null} when missing/expired. */
    public Object get(String key) {
        Entry e = store.get(key);
        if (e == null) return null;
        if (e.expiresAt < System.currentTimeMillis()) {
            store.remove(key, e);
            return null;
        }
        return e.value;
    }

    @SuppressWarnings("unchecked")
    public <T> T getOrLoad(String key, Supplier<T> loader) {
        Entry e = store.get(key);
        long now = System.currentTimeMillis();
        if (e != null && e.expiresAt >= now) {
            return (T) e.value;
        }
        T loaded = loader.get();
        if (loaded != null) {
            store.put(key, new Entry(loaded, now + ttlMillis));
        }
        return loaded;
    }

    /** Drops a single key — usually invoked from an event consumer when the i18n DB changes. */
    public void invalidate(String key) {
        if (store.remove(key) != null && log.isDebugEnabled()) {
            log.debug("L1 invalidate key={}", key);
        }
    }

    public void invalidateAll() {
        int size = store.size();
        store.clear();
        log.info("L1 invalidate-all ({} entries)", size);
    }

    public int size() {
        return store.size();
    }
}
