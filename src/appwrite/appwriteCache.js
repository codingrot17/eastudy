/**
 * appwriteCache.js
 *
 * A lightweight in-memory cache + request deduplication layer for Appwrite.
 *
 * TWO problems it solves:
 *
 * 1. DEDUPLICATION — if StudentHomeTab and StudentScheduleTab both mount at the
 *    same time and both call getDepartmentById("xyz"), without this they fire two
 *    simultaneous Appwrite requests for identical data. With this, the second call
 *    joins the first in-flight request and both get the same result.
 *
 * 2. CACHING — once a response is fetched, it's served from memory for `ttl`
 *    milliseconds. On launch day with 500 students, getDepartmentById for the
 *    same department ID is called ~500 times. With a 2-minute cache this becomes
 *    1 real Appwrite read per 2 minutes instead of 500.
 *
 * Usage:
 *   import { cachedFetch } from "./appwriteCache";
 *
 *   // Instead of: const doc = await databases.getDocument(...)
 *   const doc = await cachedFetch(
 *     `dept:${departmentId}`,           // cache key
 *     () => databases.getDocument(...), // fetcher
 *     120_000                           // TTL in ms (optional, default 60s)
 *   );
 *
 * Cache invalidation:
 *   import { invalidate, invalidatePrefix } from "./appwriteCache";
 *   invalidate("dept:xyz");            // bust one key
 *   invalidatePrefix("dept:");         // bust all dept keys
 */

// cache: Map<key, { data, expiresAt }>
const cache = new Map();

// inflight: Map<key, Promise> — for deduplication
const inflight = new Map();

const DEFAULT_TTL = 60_000; // 60 seconds

/**
 * cachedFetch — the main entry point.
 *
 * @param {string} key      - unique cache key
 * @param {function} fetcher - async function that returns the data
 * @param {number} ttl      - how long to cache in ms (default 60s)
 */
export async function cachedFetch(key, fetcher, ttl = DEFAULT_TTL) {
    // 1. Serve from cache if fresh
    const entry = cache.get(key);
    if (entry && Date.now() < entry.expiresAt) {
        return entry.data;
    }

    // 2. Deduplicate: if there's already an in-flight request for this key,
    //    return the same promise instead of firing a new one
    if (inflight.has(key)) {
        return inflight.get(key);
    }

    // 3. Fire the real request
    const promise = fetcher()
        .then(data => {
            cache.set(key, { data, expiresAt: Date.now() + ttl });
            inflight.delete(key);
            return data;
        })
        .catch(err => {
            inflight.delete(key);
            throw err;
        });

    inflight.set(key, promise);
    return promise;
}

/**
 * invalidate — bust a single cache entry.
 * Call this after a write so the next read fetches fresh data.
 */
export function invalidate(key) {
    cache.delete(key);
    // Note: don't cancel inflight — let it complete and just don't cache it
}

/**
 * invalidatePrefix — bust all entries whose key starts with the given prefix.
 * Useful for "invalidate all department-related cache after an update".
 */
export function invalidatePrefix(prefix) {
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key);
    }
}

/**
 * getCacheSize — returns number of cached entries (useful for debugging).
 */
export function getCacheSize() {
    return cache.size;
}
