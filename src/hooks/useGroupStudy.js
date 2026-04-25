import { useState, useEffect, useCallback, useRef } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getSessions,
    createSession,
    joinSession,
    leaveSession,
    cancelSession,
    deleteSession,
    GROUP_STUDY_ID
} from "../appwrite/groupStudy";
import { fireNotif } from "../utils/notify";

export function useGroupStudy(departmentId) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Don't notify on first load — only for sessions created after mount
    const initialLoadDone = useRef(false);

    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getSessions(departmentId);
            setSessions(docs);
            initialLoadDone.current = true;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    // Real-time subscription
    useEffect(() => {
        if (!departmentId) return;
        fetch();

        const channel = `databases.${DB_ID}.collections.${GROUP_STUDY_ID}.documents`;
        const unsub = client.subscribe(channel, event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            let parsed;
            try {
                parsed = {
                    ...doc,
                    attendees: JSON.parse(doc.attendees || "[]")
                };
            } catch {
                parsed = { ...doc, attendees: [] };
            }

            if (event.events.some(e => e.includes("create"))) {
                setSessions(prev => {
                    const without = prev.filter(s => s.$id !== parsed.$id);
                    return sortSessions([parsed, ...without]);
                });

                // Notify about new study session (after initial load)
                if (initialLoadDone.current) {
                    const dateStr = parsed.date
                        ? new Date(
                              parsed.date + "T00:00:00"
                          ).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric"
                          })
                        : "";
                    fireNotif({
                        title: "📚 New Study Session",
                        body: `${parsed.title} — ${dateStr} at ${parsed.time || "TBD"} · ${parsed.location || ""}`,
                        tag: `group-study-${parsed.$id}`,
                        url: "/dashboard/student"
                    });
                }
            }

            if (event.events.some(e => e.includes("update"))) {
                setSessions(prev =>
                    sortSessions(
                        prev.map(s => (s.$id === parsed.$id ? parsed : s))
                    )
                );
            }

            if (event.events.some(e => e.includes("delete"))) {
                setSessions(prev => prev.filter(s => s.$id !== doc.$id));
            }
        });

        return () => unsub();
    }, [departmentId, fetch]);

    const create = async data => {
        return await createSession({ ...data, departmentId });
    };

    const join = async (sessionId, currentAttendees, user) => {
        return await joinSession(sessionId, currentAttendees, user);
    };

    const leave = async (sessionId, currentAttendees, userId) => {
        return await leaveSession(sessionId, currentAttendees, userId);
    };

    const cancel = async sessionId => {
        return await cancelSession(sessionId);
    };

    const remove = async sessionId => {
        await deleteSession(sessionId);
        setSessions(prev => prev.filter(s => s.$id !== sessionId));
    };

    return {
        sessions,
        loading,
        error,
        create,
        join,
        leave,
        cancel,
        remove,
        refresh: fetch
    };
}

function sortSessions(docs) {
    return [...docs].sort((a, b) => {
        if (a.status === "cancelled" && b.status !== "cancelled") return 1;
        if (a.status !== "cancelled" && b.status === "cancelled") return -1;
        return (a.date || "").localeCompare(b.date || "");
    });
}
