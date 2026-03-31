import { useState, useEffect, useCallback } from "react";
import { client} from "../appwrite/config";
import {
    getAnnouncements,
    createAnnouncement,
    togglePin,
    deleteAnnouncement,
    ANNOUNCEMENTS_ID
} from "../appwrite/announcements";
import { DB_ID } from "../appwrite/config";

export function useAnnouncements(departmentId) {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch ───────────────────────────────────────
    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getAnnouncements(departmentId);
            // Pinned first, then by date
            setAnnouncements(sortAnnouncements(docs));
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

        // Subscribe to changes in this collection
        const channel = `databases.${DB_ID}.collections.${ANNOUNCEMENTS_ID}.documents`;
        const unsubscribe = client.subscribe(channel, event => {
            const doc = event.payload;

            // Only handle events for this department
            if (doc.departmentId !== departmentId) return;

            if (event.events.some(e => e.includes("create"))) {
                setAnnouncements(prev =>
                    sortAnnouncements([
                        doc,
                        ...prev.filter(a => a.$id !== doc.$id)
                    ])
                );
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
    }, [departmentId, fetch]);

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

// Pinned announcements always float to top
function sortAnnouncements(docs) {
    return [...docs].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.$createdAt) - new Date(a.$createdAt);
    });
}
