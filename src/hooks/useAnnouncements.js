import { useState, useEffect, useCallback, useRef } from "react";
import { client } from "../appwrite/config";
import {
    getAnnouncements,
    createAnnouncement,
    togglePin,
    deleteAnnouncement,
    ANNOUNCEMENTS_ID
} from "../appwrite/announcements";
import { DB_ID } from "../appwrite/config";

export function useAnnouncements(
    departmentId,
    { enableNotifications = false } = {}
) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Track if initial load is done so we don't notify on first fetch
    const initialLoadDone = useRef(false);

    // ── Fetch ───────────────────────────────────────
    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getAnnouncements(departmentId);
            setAnnouncements(sortAnnouncements(docs));
            initialLoadDone.current = true;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    // ── Real-time subscription ───────────────────────
    useEffect(() => {
        if (!departmentId) return;
        fetch();

        const channel = `databases.${DB_ID}.collections.${ANNOUNCEMENTS_ID}.documents`;
        const unsubscribe = client.subscribe(channel, async event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            if (event.events.some(e => e.includes("create"))) {
                setAnnouncements(prev =>
                    sortAnnouncements([
                        doc,
                        ...prev.filter(a => a.$id !== doc.$id)
                    ])
                );

                // Fire local notification for new announcements (students only)
                if (
                    enableNotifications &&
                    initialLoadDone.current &&
                    "serviceWorker" in navigator
                ) {
                    const reg = await navigator.serviceWorker.ready.catch(
                        () => null
                    );
                    if (reg && Notification.permission === "granted") {
                        const title = doc.pinned
                            ? `📌 Pinned: ${doc.repName || "Your Rep"}`
                            : `📢 ${doc.repName || "Your Rep"}`;
                        const body =
                            doc.content.length > 100
                                ? doc.content.slice(0, 97) + "..."
                                : doc.content;

                        reg.showNotification(title, {
                            body,
                            icon: "/favicon.svg",
                            badge: "/favicon.svg",
                            tag: `announcement-${doc.$id}`,
                            renotify: true,
                            vibrate: [200, 100, 200],
                            data: { url: "/dashboard/student" }
                        }).catch(() => {});
                    }
                }
            }
            if (event.events.some(e => e.includes("update"))) {
                setAnnouncements(prev =>
                    sortAnnouncements(
                        prev.map(a => (a.$id === doc.$id ? doc : a))
                    )
                );
            }
            if (event.events.some(e => e.includes("delete"))) {
                setAnnouncements(prev => prev.filter(a => a.$id !== doc.$id));
            }
        });

        return () => unsubscribe();
    }, [departmentId, fetch, enableNotifications]);

    // ── Actions ─────────────────────────────────────
    const post = async ({ content, pinned, repId, repName }) => {
        return await createAnnouncement({
            content,
            departmentId,
            repId,
            repName,
            pinned
        });
    };

    const pin = async (id, currentPinned) => {
        return await togglePin(id, !currentPinned);
    };

    const remove = async id => {
        return await deleteAnnouncement(id);
    };

    return { announcements, loading, error, post, pin, remove, refresh: fetch };
}

function sortAnnouncements(docs) {
    return [...docs].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.$createdAt) - new Date(a.$createdAt);
    });
}
