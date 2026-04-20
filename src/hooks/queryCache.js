/**
 * queryCache — simple in-memory TTL cache for Appwrite queries.
 *
 * WHY:
 * Under heavy traffic, every student mounting a dashboard tab fires
 * multiple Appwrite listDocuments calls. With 300 students online,
 * that's thousands of requests per minute for data that changes slowly
 * (schedule, materials, stats).
 *
 * This cache stores query results in memory with a TTL. If the same
 * query is called within the TTL window, it returns the cached result
 * instantly without hitting Appwrite. Real-time subscriptions still
 * update the UI immediately — the cache only prevents cold re-fetches.
 *
 * TTL guide:
 *   - Dashboard stats: 60s (changes rarely mid-session)
 *   - Schedule: 120s (real-time subscription handles live changes)
 *   - Materials: 60s
 *   - Posts: 30s (more active)
 *   - Announcements: 30s
 *
 * The cache is scoped to the browser session (in-memory only).
 * It clears automatically on page reload.
 */

const cache = new Map();

/**
 * Get a cached value.
 * @param {string} key
 * @returns {any|null} cached value or null if expired/missing
 */
export function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

/**
 * Store a value with a TTL.
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds - how long to cache (default 60s)
 */
export function setCached(key, value, ttlSeconds = 60) {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlSeconds * 1000
    });
}

/**
 * Invalidate a cached entry immediately.
 * Call this after mutations (create, update, delete).
 * @param {string} keyPrefix - invalidates all keys starting with this
 */
export function invalidateCache(keyPrefix) {
    for (const key of cache.keys()) {
        if (key.startsWith(keyPrefix)) {
            cache.delete(key);
        }
    }
}

/**
 * Wrapper — fetches from cache if fresh, otherwise calls fetcher and caches.
 *
 * @param {string} key - unique cache key
 * @param {Function} fetcher - async function that returns the data
 * @param {number} ttlSeconds
 * @returns {Promise<any>}
 *
 * Example:
 *   const data = await withCache(
 *     `schedule:${departmentId}`,
 *     () => getSchedule(departmentId),
 *     120
 *   );
 */
export async function withCache(key, fetcher, ttlSeconds = 60) {
    const cached = getCached(key);
    if (cached !== null) return cached;

    const result = await fetcher();
    setCached(key, result, ttlSeconds);
    return result;
}
