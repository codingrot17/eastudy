import { useState, useEffect, useCallback, useRef } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getSchedule,
    createClass,
    updateClass,
    deleteClass,
    SCHEDULES_ID,
    DAYS
} from "../appwrite/schedule";

/**
 * useSchedule — fetches, subscribes real-time, and fires local push
 * notifications when the rep adds/edits a class (student-side).
 *
 * @param {string} departmentId
 * @param {{ enableNotifications?: boolean }} options
 */
export function useSchedule(
    departmentId,
    { enableNotifications = false } = {}
) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const initialLoadDone = useRef(false);

    // ── Fetch ───────────────────────────────────
    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getSchedule(departmentId);
            setEntries(sortEntries(docs));
            initialLoadDone.current = true;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    // ── Real-time subscription ──────────────────
    useEffect(() => {
        if (!departmentId) return;
        fetch();

        const channel = `databases.${DB_ID}.collections.${SCHEDULES_ID}.documents`;
        const unsubscribe = client.subscribe(channel, async event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            const isCreate = event.events.some(e => e.includes("create"));
            const isUpdate = event.events.some(e => e.includes("update"));
            const isDelete = event.events.some(e => e.includes("delete"));

            if (isCreate) {
                setEntries(prev =>
                    sortEntries([doc, ...prev.filter(e => e.$id !== doc.$id)])
                );
                // Notify student of new class
                if (enableNotifications && initialLoadDone.current) {
                    await fireNotification({
                        title: `📅 New Class Added — ${doc.day}`,
                        body: `${doc.courseCode} · ${doc.courseName} at ${doc.startTime} in ${doc.venue}`,
                        tag: `schedule-create-${doc.$id}`
                    });
                }
            }

            if (isUpdate) {
                setEntries(prev =>
                    sortEntries(prev.map(e => (e.$id === doc.$id ? doc : e)))
                );
                // Notify student of timetable change
                if (enableNotifications && initialLoadDone.current) {
                    await fireNotification({
                        title: `🔄 Schedule Updated — ${doc.day}`,
                        body: `${doc.courseCode} · ${doc.courseName} is now at ${doc.startTime} in ${doc.venue}`,
                        tag: `schedule-update-${doc.$id}`
                    });
                }
            }

            if (isDelete) {
                setEntries(prev => prev.filter(e => e.$id !== doc.$id));
                // Notify student of cancelled class
                if (enableNotifications && initialLoadDone.current) {
                    await fireNotification({
                        title: `❌ Class Removed`,
                        body: `${doc.courseCode} · ${doc.courseName} on ${doc.day} has been removed from the schedule.`,
                        tag: `schedule-delete-${doc.$id}`
                    });
                }
            }
        });

        return () => unsubscribe();
    }, [departmentId, fetch, enableNotifications]);

    // ── Grouped by day ──────────────────────────
    const byDay = DAYS.reduce((acc, day) => {
        acc[day] = entries.filter(e => e.day === day);
        return acc;
    }, {});

    // ── Actions ─────────────────────────────────
    const addClass = async data => {
        return await createClass({ ...data, departmentId });
    };

    const editClass = async (id, updates) => {
        return await updateClass(id, updates);
    };

    const removeClass = async id => {
        return await deleteClass(id);
    };

    return {
        entries,
        byDay,
        loading,
        error,
        addClass,
        editClass,
        removeClass,
        refresh: fetch
    };
}

// Sort by day order then start time
function sortEntries(docs) {
    return [...docs].sort((a, b) => {
        const dayDiff = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.startTime.localeCompare(b.startTime);
    });
}

// Fire a service worker notification (requires permission)
async function fireNotification({ title, body, tag }) {
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
            data: { url: "/dashboard/student" }
        });
    } catch (err) {
        console.warn("[useSchedule] Notification failed:", err);
    }
}
