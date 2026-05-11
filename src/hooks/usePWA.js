import { useState, useEffect, useCallback, useRef } from "react";
import { databases, DB_ID } from "../appwrite/config";
import { ID, Query } from "appwrite";

const PUSH_SUBS_ID = import.meta.env.VITE_APPWRITE_PUSH_SUBS_COLLECTION_ID;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

// ── VAPID key converter ──────────────────────────
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

// ── Save push subscription to Appwrite ──────────
// Exported so PWAProvider can call it after permission is granted
export async function savePushSubscription(subscription, userId, departmentId) {
    if (!subscription || !userId || !departmentId) return;
    if (!PUSH_SUBS_ID) {
        console.warn("[PWA] VITE_APPWRITE_PUSH_SUBS_COLLECTION_ID not set");
        return;
    }

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        console.warn("[PWA] Push subscription missing required fields");
        return;
    }

    try {
        // Check for existing sub with this endpoint to avoid duplicates
        const existing = await databases.listDocuments(DB_ID, PUSH_SUBS_ID, [
            Query.equal("userId", userId),
            Query.equal("endpoint", json.endpoint),
            Query.limit(1)
        ]);
        if (existing.total > 0) {
            // Update departmentId in case user switched departments
            const doc = existing.documents[0];
            if (doc.departmentId !== departmentId) {
                await databases.updateDocument(DB_ID, PUSH_SUBS_ID, doc.$id, {
                    departmentId
                });
            }
            return;
        }

        await databases.createDocument(DB_ID, PUSH_SUBS_ID, ID.unique(), {
            userId,
            departmentId,
            endpoint: json.endpoint,
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
            userAgent: navigator.userAgent.slice(0, 200)
        });

        console.log("[PWA] Push subscription saved for user:", userId);
    } catch (err) {
        // Don't crash the app if subscription save fails
        console.warn("[PWA] Failed to save push subscription:", err?.message);
    }
}

// ── Subscribe to push manager ────────────────────
async function subscribeToPush(registration) {
    if (!VAPID_PUBLIC_KEY) {
        console.warn("[PWA] VITE_VAPID_PUBLIC_KEY not set — push disabled");
        return null;
    }
    try {
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        return sub;
    } catch (err) {
        console.warn("[PWA] Push subscribe failed:", err?.message);
        return null;
    }
}

// ── Service Worker registration ──────────────────
export async function registerSW() {
    if (!("serviceWorker" in navigator)) return null;
    try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
            scope: "/"
        });
        // Wait for the SW to be ready (handles refresh/update)
        await navigator.serviceWorker.ready;
        return reg;
    } catch (err) {
        console.warn("[PWA] SW registration failed:", err?.message);
        return null;
    }
}

// ── Main usePWA hook ─────────────────────────────
export function usePWA() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [notifPermission, setNotifPermission] = useState(
        typeof Notification !== "undefined"
            ? Notification.permission
            : "default"
    );
    const [swRegistration, setSwRegistration] = useState(null);
    const [pushSubscription, setPushSubscription] = useState(null);

    // Track whether we've already tried to auto-save the sub on mount
    const autoSavedRef = useRef(false);

    // ── Detect standalone (installed) mode ──────
    useEffect(() => {
        const mq = window.matchMedia("(display-mode: standalone)");
        setIsInstalled(mq.matches || navigator.standalone === true);
        const handler = e => setIsInstalled(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // ── Capture beforeinstallprompt ─────────────
    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    // ── Register SW + load existing subscription ─
    useEffect(() => {
        registerSW().then(reg => {
            if (!reg) return;
            setSwRegistration(reg);

            // Check if we already have an active push subscription
            reg.pushManager?.getSubscription().then(sub => {
                if (sub) {
                    setPushSubscription(sub);
                }
            });
        });
    }, []);

    // ── Install ─────────────────────────────────
    const install = useCallback(async () => {
        if (!installPrompt) return false;
        setIsInstalling(true);
        try {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            if (outcome === "accepted") {
                setInstallPrompt(null);
                setIsInstalled(true);
                return true;
            }
        } finally {
            setIsInstalling(false);
        }
        return false;
    }, [installPrompt]);

    // ── Request notification permission + subscribe ──
    // This is the main entry point — always pass userId and departmentId
    const requestNotifPermission = useCallback(
        async (userId, departmentId) => {
            if (!("Notification" in window)) return "denied";

            const permission = await Notification.requestPermission();
            setNotifPermission(permission);

            if (permission !== "granted" || !swRegistration) return permission;

            // Subscribe to push
            let sub = await swRegistration.pushManager.getSubscription();
            if (!sub) {
                sub = await subscribeToPush(swRegistration);
            }

            if (sub) {
                setPushSubscription(sub);
                // Save to Appwrite — fire and forget
                if (userId && departmentId) {
                    savePushSubscription(sub, userId, departmentId).catch(
                        console.warn
                    );
                }
            }

            return permission;
        },
        [swRegistration]
    );

    // ── Auto-save subscription if permission already granted ──
    // Handles the case where user granted permission previously,
    // app reloads, SW finds the existing sub, but Appwrite doc was deleted
    const ensureSubscriptionSaved = useCallback(
        async (userId, departmentId) => {
            if (autoSavedRef.current) return;
            if (!pushSubscription || !userId || !departmentId) return;
            if (Notification.permission !== "granted") return;

            autoSavedRef.current = true;
            savePushSubscription(pushSubscription, userId, departmentId).catch(
                console.warn
            );
        },
        [pushSubscription]
    );

    // ── Show a local notification via SW ────────
    const sendLocalNotification = useCallback(
        async (title, body, options = {}) => {
            if (!swRegistration) return;
            if (Notification.permission !== "granted") return;
            try {
                await swRegistration.showNotification(title, {
                    body,
                    icon: "/favicon.svg",
                    badge: "/favicon.svg",
                    vibrate: [200, 100, 200],
                    tag: options.tag || "eastudy",
                    renotify: true,
                    data: { url: options.url || "/" },
                    ...options
                });
            } catch (err) {
                console.warn("[PWA] showNotification failed:", err?.message);
            }
        },
        [swRegistration]
    );

    // ── App badge ────────────────────────────────
    const setBadge = useCallback(async count => {
        if (!("setAppBadge" in navigator)) return;
        try {
            if (count > 0) await navigator.setAppBadge(count);
            else await navigator.clearAppBadge();
        } catch {}
    }, []);

    return {
        canInstall: !!installPrompt && !isInstalled,
        isInstalled,
        isInstalling,
        install,
        notifPermission,
        pushSubscription,
        requestNotifPermission,
        ensureSubscriptionSaved,
        sendLocalNotification,
        setBadge,
        swRegistration
    };
}
