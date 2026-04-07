import { useState, useEffect, useCallback } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getSchedule,
    createClass,
    updateClass,
    deleteClass,
    SCHEDULES_ID,
    DAYS
} from "../appwrite/schedule";

export function useSchedule(departmentId) {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Fetch ───────────────────────────────────
    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getSchedule(departmentId);
            setEntries(sortEntries(docs));
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
        const unsubscribe = client.subscribe(channel, event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            if (event.events.some(e => e.includes("create"))) {
                setEntries(prev =>
                    sortEntries([doc, ...prev.filter(e => e.$id !== doc.$id)])
                );
            }
            if (event.events.some(e => e.includes("update"))) {
                setEntries(prev =>
                    sortEntries(prev.map(e => (e.$id === doc.$id ? doc : e)))
                );
            }
            if (event.events.some(e => e.includes("delete"))) {
                setEntries(prev => prev.filter(e => e.$id !== doc.$id));
            }
        });

        return () => unsubscribe();
    }, [departmentId, fetch]);

    // ── Grouped by day (for rendering) ─────────
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
