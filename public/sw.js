const CACHE_NAME = "eastudy-v1";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.svg"];

// ── Install: cache static shell ─────────────────
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────
self.addEventListener("activate", event => {
    event.waitUntil(
        caches
            .keys()
            .then(keys =>
                Promise.all(
                    keys
                        .filter(key => key !== CACHE_NAME)
                        .map(key => caches.delete(key))
                )
            )
    );
    self.clients.claim();
});

// ── Fetch: network first, fallback to cache ─────
self.addEventListener("fetch", event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and Appwrite API calls (always network)
    if (request.method !== "GET") return;
    if (
        url.hostname.includes("appwrite") ||
        url.hostname.includes("cloud.appwrite")
    )
        return;

    // For navigation requests (HTML pages), serve cached shell
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/index.html"))
        );
        return;
    }

    // For JS/CSS/fonts: stale-while-revalidate
    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const cached = await cache.match(request);
            const networkPromise = fetch(request)
                .then(response => {
                    if (response.ok) {
                        cache.put(request, response.clone());
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || networkPromise;
        })
    );
});

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

    const options = {
        body: data.body,
        icon: data.icon || "/favicon.svg",
        badge: "/favicon.svg",
        tag: data.tag || "eastudy-update",
        renotify: true,
        vibrate: [200, 100, 200],
        data: { url: data.url || "/" },
        actions: data.actions || []
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

// ── Notification click ──────────────────────────
self.addEventListener("notificationclick", event => {
    event.notification.close();
    const url = event.notification.data?.url || "/";

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(clients => {
                // Focus existing window if open
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
    // Placeholder for future offline-queue sync
    console.log("[SW] Background sync triggered");
}

// ── Message handler ─────────────────────────────
self.addEventListener("message", event => {
    if (event.data?.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
    if (event.data?.type === "SET_BADGE") {
        const count = event.data.count || 0;
        if (self.navigator?.setAppBadge) {
            count > 0
                ? self.navigator.setAppBadge(count)
                : self.navigator.clearAppBadge();
        }
    }
});
