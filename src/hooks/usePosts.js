import { useState, useEffect, useCallback } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getPosts,
    createPost,
    deletePost,
    pinPost,
    toggleReaction,
    getComments,
    createComment,
    deleteComment,
    parsePost,
    POSTS_ID,
    COMMENTS_ID
} from "../appwrite/posts";

// ── Posts hook ───────────────────────────────────

export function usePosts(departmentId) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getPosts(departmentId);
            setPosts(sortPosts(docs));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    useEffect(() => {
        if (!departmentId) return;
        fetch();

        const channel = `databases.${DB_ID}.collections.${POSTS_ID}.documents`;
        const unsub = client.subscribe(channel, event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            // Always normalise through parsePost — handles reactions string→object
            // AND file fields null→defaults. Without this, real-time events
            // delivered raw Appwrite docs straight into state.
            const parsed = parsePost(doc);

            if (event.events.some(e => e.includes("create"))) {
                setPosts(prev =>
                    sortPosts([
                        parsed,
                        ...prev.filter(p => p.$id !== parsed.$id)
                    ])
                );
            }
            if (event.events.some(e => e.includes("update"))) {
                setPosts(prev =>
                    sortPosts(
                        prev.map(p => (p.$id === parsed.$id ? parsed : p))
                    )
                );
            }
            if (event.events.some(e => e.includes("delete"))) {
                setPosts(prev => prev.filter(p => p.$id !== doc.$id));
            }
        });

        return () => unsub();
    }, [departmentId, fetch]);

    const post = async ({
        authorId,
        authorName,
        authorRole,
        type,
        content,
        url,
        fileId,
        mimeType,
        fileName,
        sourceType
    }) => {
        return await createPost({
            departmentId,
            authorId,
            authorName,
            authorRole,
            type,
            content,
            url,
            fileId,
            mimeType,
            fileName,
            sourceType
        });
    };

    const remove = async postId => {
        await deletePost(postId);
        setPosts(prev => prev.filter(p => p.$id !== postId));
    };

    const pin = async (postId, currentPinned) => {
        return await pinPost(postId, !currentPinned);
    };

    /**
     * react — optimistic UI with server reconciliation.
     *
     * 1. Apply optimistic update immediately for snappy UX.
     * 2. Call toggleReaction which re-fetches server state before writing
     *    (avoids clobbering concurrent reactions from other users).
     * 3. On success: apply the server-confirmed reactions object to state
     *    so local state exactly matches what was persisted.
     * 4. On failure: revert the optimistic update.
     *
     * This fixes the bug where reactions disappeared on refresh:
     * the optimistic object was correct but if the server write failed
     * silently the DB was never updated, so refresh showed no reaction.
     */
    const react = async (postId, currentReactions, emoji, userId) => {
        // Step 1 — optimistic update
        const optimistic = { ...currentReactions };
        if (!optimistic[emoji]) optimistic[emoji] = [];
        const idx = optimistic[emoji].indexOf(userId);
        if (idx === -1) {
            optimistic[emoji] = [...optimistic[emoji], userId];
        } else {
            optimistic[emoji] = optimistic[emoji].filter(id => id !== userId);
            if (optimistic[emoji].length === 0) delete optimistic[emoji];
        }

        setPosts(prev =>
            prev.map(p =>
                p.$id === postId ? { ...p, reactions: optimistic } : p
            )
        );

        // Step 2 — server write (re-fetches latest before writing)
        try {
            const serverReactions = await toggleReaction(postId, emoji, userId);

            // Step 3 — reconcile with confirmed server state
            // This ensures what's in state exactly matches the DB,
            // so a refresh shows the same value.
            setPosts(prev =>
                prev.map(p =>
                    p.$id === postId ? { ...p, reactions: serverReactions } : p
                )
            );
        } catch (err) {
            // Step 4 — revert on failure
            console.warn("[usePosts] Reaction failed:", err?.message);
            setPosts(prev =>
                prev.map(p =>
                    p.$id === postId ? { ...p, reactions: currentReactions } : p
                )
            );
        }
    };

    return { posts, loading, error, post, remove, pin, react, refresh: fetch };
}

// ── Comments hook ────────────────────────────────

export function useComments(postId) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetch = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const docs = await getComments(postId);
            setComments(docs);
        } catch {
            // Don't crash — just show empty
        } finally {
            setLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (!postId) return;
        fetch();

        const channel = `databases.${DB_ID}.collections.${COMMENTS_ID}.documents`;
        const unsub = client.subscribe(channel, event => {
            const doc = event.payload;
            if (doc.postId !== postId) return;

            if (event.events.some(e => e.includes("create"))) {
                setComments(prev =>
                    [...prev.filter(c => c.$id !== doc.$id), doc].sort(
                        (a, b) =>
                            new Date(a.$createdAt) - new Date(b.$createdAt)
                    )
                );
            }
            if (event.events.some(e => e.includes("delete"))) {
                setComments(prev => prev.filter(c => c.$id !== doc.$id));
            }
        });

        return () => unsub();
    }, [postId, fetch]);

    const add = async ({
        departmentId,
        authorId,
        authorName,
        authorRole,
        content
    }) => {
        return await createComment({
            postId,
            departmentId,
            authorId,
            authorName,
            authorRole,
            content
        });
    };

    const remove = async commentId => {
        await deleteComment(commentId, postId);
        setComments(prev => prev.filter(c => c.$id !== commentId));
    };

    return { comments, loading, add, remove, refresh: fetch };
}

// ── Sort: pinned first, then newest ─────────────

function sortPosts(docs) {
    return [...docs].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.$createdAt) - new Date(a.$createdAt);
    });
}
