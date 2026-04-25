/**
 * notify.js — thin wrapper around Service Worker showNotification.
 *
 * Usage:
 *   import { fireNotif } from "../utils/notify";
 *   await fireNotif({ title: "...", body: "...", tag: "...", url: "/" });
 *
 * Safe to call even if SW isn't registered or permission isn't granted —
 * it silently no-ops in those cases.
 */

/**
 * @param {{ title: string, body: string, tag?: string, url?: string }} opts
 */
export async function fireNotif({ title, body, tag = "eastudy", url = "/" }) {
    if (!("serviceWorker" in navigator)) return;
    if (Notification.permission !== "granted") return;
    try {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
            body,
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            tag,
            renotify: true,
            vibrate: [200, 100, 200],
            data: { url }
        });
    } catch {
        // Silently swallow — notifications are best-effort
    }
}
