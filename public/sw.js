const SHELL_CACHE = "eastudy-shell-v2";
const DATA_CACHE = "eastudy-data-v2";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.svg"];

// How long to serve Appwrite GET responses from cache before going to network
// This means on a slow/dead connection students still see their last-known schedule
const DATA_CACHE_MAX_AGE_SECONDS = 300; // 5 minutes

// ── Install ─────────────────────────────────────
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(SHELL_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────
self.addEventListener("activate", event => {
    const CURRENT = [SHELL_CACHE, DATA_CACHE];
    event.waitUntil(
        caches
            .keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(k => !CURRENT.includes(k))
                        .map(k => caches.delete(k))
                )
            )
    );
    self.clients.claim();
});

// ── Fetch ────────────────────────────────────────
self.addEventListener("fetch", event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET
    if (request.method !== "GET") return;

    // ── Navigation (HTML) — network first, shell fallback ──
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/index.html"))
        );
        return;
    }

    // ── Appwrite API GET calls — stale-while-revalidate with max age ──
    // This is the key fix for slow networks:
    // Students on 2G get their cached announcements/schedule instantly
    // while the fresh data loads in the background.
    if (
        url.hostname.includes("appwrite.io") ||
        url.hostname.includes("cloud.appwrite")
    ) {
        event.respondWith(
            caches.open(DATA_CACHE).then(async cache => {
                const cached = await cache.match(request);

                // Check if cached response is still fresh
                if (cached) {
                    const cachedDate = cached.headers.get("sw-cached-at");
                    if (cachedDate) {
                        const age = (Date.now() - parseInt(cachedDate)) / 1000;
                        if (age < DATA_CACHE_MAX_AGE_SECONDS) {
                            // Serve fresh cache, revalidate in background
                            revalidateInBackground(request, cache);
                            return cached;
                        }
                    }
                }

                // Cache miss or stale — go to network
                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        // Clone and add our own timestamp header before caching
                        const headers = new Headers(response.headers);
                        headers.set("sw-cached-at", Date.now().toString());
                        const toCacheResponse = new Response(
                            await response.clone().blob(),
                            {
                                status: response.status,
                                statusText: response.statusText,
                                headers
                            }
                        );
                        cache.put(request, toCacheResponse);
                    }
                    return response;
                } catch {
                    // Completely offline — serve stale cache as last resort
                    if (cached) return cached;
                    throw new Error("Offline and no cached data");
                }
            })
        );
        return;
    }

    // ── JS/CSS/fonts: stale-while-revalidate ──
    event.respondWith(
        caches.open(SHELL_CACHE).then(async cache => {
            const cached = await cache.match(request);
            const networkPromise = fetch(request)
                .then(response => {
                    if (response.ok) cache.put(request, response.clone());
                    return response;
                })
                .catch(() => cached);

            return cached || networkPromise;
        })
    );
});

function revalidateInBackground(request, cache) {
    fetch(request)
        .then(async response => {
            if (!response.ok) return;
            const headers = new Headers(response.headers);
            headers.set("sw-cached-at", Date.now().toString());
            const toCache = new Response(await response.clone().blob(), {
                status: response.status,
                statusText: response.statusText,
                headers
            });
            cache.put(request, toCache);
        })
        .catch(() => {});
}

// ── Push Notifications ──────────────────────────
self.addEventListener("push", event => {
    let data = {
        title: "Eastudy",
        body: "You have a new update",
        icon: "/favicon.svg",
        tag: "eastudy-update"
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch {
            data.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || "/favicon.svg",
            badge: "/favicon.svg",
            tag: data.tag || "eastudy-update",
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url: data.url || "/" },
            actions: data.actions || []
        })
    );
});

// ── Notification click ──────────────────────────
self.addEventListener("notificationclick", event => {
    event.notification.close();
    const url = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(clients => {
                const existing = clients.find(c =>
                    c.url.includes(self.location.origin)
                );
                if (existing) {
                    existing.focus();
                    existing.navigate(url);
                } else {
                    self.clients.openWindow(url);
                }
            })
    );
});

// ── Background Sync ─────────────────────────────
self.addEventListener("sync", event => {
    if (event.tag === "sync-pending") {
        event.waitUntil(syncPending());
    }
});

async function syncPending() {
    console.log("[SW] Background sync triggered");
}

// ── Message handler ─────────────────────────────
self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") self.skipWaiting();

    if (event.data?.type === "SET_BADGE") {
        const count = event.data.count || 0;
        if (self.navigator?.setAppBadge) {
            count > 0
                ? self.navigator.setAppBadge(count)
                : self.navigator.clearAppBadge();
        }
    }

    // Allow pages to clear the data cache (e.g. after logout)
    if (event.data?.type === "CLEAR_DATA_CACHE") {
        caches.delete(DATA_CACHE);
    }
});
