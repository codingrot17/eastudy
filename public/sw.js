const SHELL_CACHE = "eastudy-shell-v3";
const DATA_CACHE = "eastudy-data-v3";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.svg"];

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

    if (request.method !== "GET") return;

    // Navigate: try network, fall back to shell
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request).catch(() => caches.match("/index.html"))
        );
        return;
    }

    // Appwrite API: stale-while-revalidate with TTL
    if (
        url.hostname.includes("appwrite.io") ||
        url.hostname.includes("cloud.appwrite")
    ) {
        event.respondWith(
            caches.open(DATA_CACHE).then(async cache => {
                const cached = await cache.match(request);

                if (cached) {
                    const cachedDate = cached.headers.get("sw-cached-at");
                    if (cachedDate) {
                        const age = (Date.now() - parseInt(cachedDate)) / 1000;
                        if (age < DATA_CACHE_MAX_AGE_SECONDS) {
                            revalidateInBackground(request, cache);
                            return cached;
                        }
                    }
                }

                try {
                    const response = await fetch(request);
                    if (response.ok) {
                        const body = await response.arrayBuffer();
                        const headers = new Headers(response.headers);
                        headers.set("sw-cached-at", Date.now().toString());
                        cache.put(
                            request,
                            new Response(body, {
                                status: response.status,
                                statusText: response.statusText,
                                headers
                            })
                        );
                        return new Response(body, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: new Headers(response.headers)
                        });
                    }
                    return response;
                } catch {
                    if (cached) return cached;
                    throw new Error("Offline and no cached data");
                }
            })
        );
        return;
    }

    // Shell assets: cache-first
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
            const body = await response.arrayBuffer();
            const headers = new Headers(response.headers);
            headers.set("sw-cached-at", Date.now().toString());
            cache.put(
                request,
                new Response(body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers
                })
            );
        })
        .catch(() => {});
}

// ── Push Notifications ──────────────────────────
self.addEventListener("push", event => {
    // Default payload if nothing comes through
    let data = {
        title: "Eastudy",
        body: "You have a new update",
        icon: "/favicon.svg",
        tag: "eastudy-update",
        url: "/dashboard/student"
    };

    if (event.data) {
        try {
            const parsed = event.data.json();
            data = { ...data, ...parsed };
        } catch {
            data.body = event.data.text();
        }
    }

    // Increment badge count
    const badgePromise = self.navigator?.setAppBadge
        ? self.navigator.setAppBadge(1).catch(() => {})
        : Promise.resolve();

    const notifPromise = self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/favicon.svg",
        badge: "/favicon.svg",
        tag: data.tag || "eastudy-update",
        // renotify: true ensures the notification appears even if same tag exists
        renotify: true,
        vibrate: [200, 100, 200],
        // Store the URL in data so notificationclick can use it
        data: { url: data.url || "/dashboard/student" },
        // Actions (optional — shown on Android)
        actions: data.actions || []
    });

    event.waitUntil(Promise.all([notifPromise, badgePromise]));
});

// ── Notification click ──────────────────────────
self.addEventListener("notificationclick", event => {
    event.notification.close();

    const url = event.notification.data?.url || "/";

    // Clear badge when user taps notification
    if (self.navigator?.clearAppBadge) {
        self.navigator.clearAppBadge().catch(() => {});
    }

    event.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then(clients => {
                // If the app is already open, focus and navigate it
                const existing = clients.find(c =>
                    c.url.includes(self.location.origin)
                );
                if (existing) {
                    existing.focus();
                    existing.navigate(url);
                } else {
                    // Otherwise open a new window
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
    // Placeholder for future background sync logic
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
            const op =
                count > 0
                    ? self.navigator.setAppBadge(count)
                    : self.navigator.clearAppBadge();
            op.catch(() => {});
        }
    }

    // Clear data cache on logout so fresh data loads on next login
    if (event.data?.type === "CLEAR_DATA_CACHE") {
        caches.delete(DATA_CACHE).catch(() => {});
    }
});
