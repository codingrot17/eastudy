import { useState, useEffect, useCallback, useRef } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getMessages,
    sendMessage,
    deleteMessage,
    SESSION_MESSAGES_ID
} from "../appwrite/sessionChat";

/**
 * useSessionChat
 *
 * Manages real-time messages for a single study session.
 * Subscribes to Appwrite real-time on mount, unsubscribes on unmount.
 *
 * @param {string|null} sessionId  - the group_study document $id
 * @param {string|null} departmentId
 */
export function useSessionChat(sessionId, departmentId) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    // ── Fetch history ────────────────────────────
    const fetchMessages = useCallback(async () => {
        if (!sessionId || !SESSION_MESSAGES_ID) {
            setLoading(false);
            return;
        }
        if (mounted.current) setLoading(true);
        try {
            const docs = await getMessages(sessionId);
            if (mounted.current) setMessages(docs);
        } catch (err) {
            if (mounted.current) setError(err.message);
        } finally {
            if (mounted.current) setLoading(false);
        }
    }, [sessionId]);

    // ── Real-time subscription ───────────────────
    useEffect(() => {
        if (!sessionId || !SESSION_MESSAGES_ID) return;
        fetchMessages();

        const channel = `databases.${DB_ID}.collections.${SESSION_MESSAGES_ID}.documents`;
        const unsub = client.subscribe(channel, event => {
            if (!mounted.current) return;
            const doc = event.payload;

            // Only handle messages for this session
            if (doc.sessionId !== sessionId) return;

            if (event.events.some(e => e.includes("create"))) {
                setMessages(prev => {
                    // Deduplicate — optimistic message may already be in list
                    const exists = prev.some(m => m.$id === doc.$id);
                    if (exists) return prev;
                    return [...prev, doc];
                });
            }
            if (event.events.some(e => e.includes("delete"))) {
                setMessages(prev => prev.filter(m => m.$id !== doc.$id));
            }
        });

        return () => unsub();
    }, [sessionId, fetchMessages]);

    // ── Send a message ───────────────────────────
    const send = useCallback(
        async ({
            authorId,
            authorName,
            authorRole,
            content,
            fileId,
            mimeType,
            fileName,
            sourceType
        }) => {
            if (!sessionId || !departmentId) return;
            if (!content?.trim() && !fileId) return;

            setSending(true);

            // Optimistic update — add a temp message immediately
            const tempId = `temp-${Date.now()}`;
            const tempMsg = {
                $id: tempId,
                sessionId,
                departmentId,
                authorId,
                authorName,
                authorRole,
                content: content ?? null,
                fileId: fileId ?? null,
                mimeType: mimeType ?? null,
                fileName: fileName ?? null,
                sourceType: sourceType ?? "none",
                $createdAt: new Date().toISOString(),
                _optimistic: true
            };
            setMessages(prev => [...prev, tempMsg]);

            try {
                const saved = await sendMessage({
                    sessionId,
                    departmentId,
                    authorId,
                    authorName,
                    authorRole,
                    content,
                    fileId,
                    mimeType,
                    fileName,
                    sourceType
                });

                // Replace temp with real doc
                setMessages(prev =>
                    prev.map(m => (m.$id === tempId ? saved : m))
                );
                return saved;
            } catch (err) {
                // Remove temp on failure
                setMessages(prev => prev.filter(m => m.$id !== tempId));
                throw err;
            } finally {
                setSending(false);
            }
        },
        [sessionId, departmentId]
    );

    // ── Delete a message ─────────────────────────
    const remove = useCallback(async messageId => {
        setMessages(prev => prev.filter(m => m.$id !== messageId));
        try {
            await deleteMessage(messageId);
        } catch {
            // Real-time will reconcile if delete failed
        }
    }, []);

    return {
        messages,
        loading,
        error,
        sending,
        send,
        remove,
        refresh: fetchMessages
    };
}
