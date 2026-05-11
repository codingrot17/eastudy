/**
 * useNotifications.js
 *
 * Centralized hook that:
 * 1. Auto-saves the push subscription to Appwrite on mount if
 *    permission is already granted (covers re-installs, logout/login)
 * 2. Manages the unread badge count across all notification types
 * 3. Provides a unified `notify()` function used by all hooks
 *
 * Usage: mount once in DashboardLayout, pass user + department.
 * Individual hooks (useAnnouncements, usePosts, etc.) call fireNotif()
 * from utils/notify.js directly — this hook handles the meta layer.
 */

import { useEffect, useCallback, useRef, useState } from "react";
import { usePWAContext } from "../components/pwa/PWAProvider";
import { fireNotif } from "../utils/notify";

export function useNotifications(user, department) {
    const pwa = usePWAContext();
    const [unreadCount, setUnreadCount] = useState(0);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // ── Auto-save subscription on mount ──────────────────────────────────────
    // If the user already granted permission (e.g. on a previous visit),
    // the SW has a subscription but it may not be in Appwrite (e.g. after
    // logout + login, or if the collection doc was deleted).
    // ensureSubscriptionSaved is a no-op if already saved.
    useEffect(() => {
        if (!user?.$id || !department?.$id) return;
        if (Notification.permission !== "granted") return;
        pwa?.ensureSubscriptionSaved?.(user.$id, department.$id);
    }, [user?.$id, department?.$id, pwa?.pushSubscription]);

    // ── Badge counter ─────────────────────────────────────────────────────────
    const incrementBadge = useCallback(() => {
        if (!mountedRef.current) return;
        setUnreadCount(n => {
            const next = n + 1;
            pwa?.setBadge?.(next);
            return next;
        });
    }, [pwa]);

    const clearBadge = useCallback(() => {
        if (!mountedRef.current) return;
        setUnreadCount(0);
        pwa?.setBadge?.(0);
    }, [pwa]);

    // ── Notify helper ─────────────────────────────────────────────────────────
    // Wraps fireNotif and increments the badge
    const notify = useCallback(
        async opts => {
            await fireNotif(opts);
            incrementBadge();
        },
        [incrementBadge]
    );

    return {
        unreadCount,
        incrementBadge,
        clearBadge,
        notify
    };
}
