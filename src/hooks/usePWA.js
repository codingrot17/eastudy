import { useState, useEffect, useCallback } from "react";
import { databases, DB_ID } from "../appwrite/config";
import { ID, Query } from "appwrite"; // Added Query import

const PUSH_SUBS_ID = import.meta.env.VITE_APPWRITE_PUSH_SUBS_COLLECTION_ID;

// ── Service Worker Registration ─────────────────
export async function registerSW() {
    if (!("serviceWorker" in navigator)) return null;
    try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
            scope: "/"
        });
        console.log("[PWA] Service worker registered");
        return reg;
    } catch (err) {
        console.warn("[PWA] SW registration failed:", err);
        return null;
    }
}

// ── Subscribe to push (Moved to module-level) ───
export async function savePushSubscription(subscription, userId, departmentId) {
    if (!subscription || !userId || !departmentId) return;

    const json = subscription.toJSON();

    // Check if already saved (avoid duplicates)
    try {
        const existing = await databases.listDocuments(DB_ID, PUSH_SUBS_ID, [
            Query.equal("userId", userId),
            Query.equal("endpoint", json.endpoint),
            Query.limit(1)
        ]);
        if (existing.total > 0) return; // already stored
    } catch {}

    await databases.createDocument(DB_ID, PUSH_SUBS_ID, ID.unique(), {
        userId,
        departmentId,
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
        userAgent: navigator.userAgent.slice(0, 200)
    });
}

// ── Main usePWA hook ────────────────────────────
export function usePWA() {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [notifPermission, setNotifPermission] = useState(
        typeof Notification !== "undefined"
            ? Notification.permission
            : "default"
    );
    const [pushSubscription, setPushSubscription] = useState(null);
    const [swRegistration, setSwRegistration] = useState(null);

    // Detect if already installed (standalone mode)
    useEffect(() => {
        const mq = window.matchMedia("(display-mode: standalone)");
        setIsInstalled(mq.matches || navigator.standalone === true);

        const handler = e => setIsInstalled(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Capture install prompt
    useEffect(() => {
        const handler = e => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    // Register SW on mount
    useEffect(() => {
        registerSW().then(reg => {
            if (reg) {
                setSwRegistration(reg);
                // Check existing push subscription
                reg.pushManager?.getSubscription().then(sub => {
                    if (sub) setPushSubscription(sub);
                });
            }
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

    // ── Request push notification permission ────
    const requestNotifPermission = useCallback(
        async (userId, departmentId) => {
            if (!("Notification" in window)) return "denied";

            const permission = await Notification.requestPermission();
            setNotifPermission(permission);

            if (permission === "granted" && swRegistration) {
                try {
                    const VAPID_PUBLIC_KEY = import.meta.env
                        .VITE_VAPID_PUBLIC_KEY;
                    if (!VAPID_PUBLIC_KEY) return permission;

                    // Subscribe to push
                    const sub = await swRegistration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey:
                            urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    });
                    setPushSubscription(sub);

                    // Save to Appwrite — fire and forget
                    savePushSubscription(sub, userId, departmentId).catch(
                        console.warn
                    );
                } catch (err) {
                    console.warn("[PWA] Push subscription failed:", err);
                }
            }

            return permission;
        },
        [swRegistration]
    );

    // ── Send local notification (works without backend) ──
    const sendLocalNotification = useCallback(
        async (title, body, options = {}) => {
            if (!swRegistration) return;
            if (Notification.permission !== "granted") return;

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
        },
        [swRegistration]
    );

    // ── Set app badge ───────────────────────────
    const setBadge = useCallback(async count => {
        if (!("setAppBadge" in navigator)) return;
        try {
            if (count > 0) {
                await navigator.setAppBadge(count);
            } else {
                await navigator.clearAppBadge();
            }
        } catch {}
    }, []);

    return {
        // Install
        canInstall: !!installPrompt && !isInstalled,
        isInstalled,
        isInstalling,
        install,
        // Notifications
        notifPermission,
        pushSubscription,
        requestNotifPermission,
        sendLocalNotification, // Removed subscribeToPush
        // Badge
        setBadge,
        // SW
        swRegistration
    };
}

// ── Utility ─────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
