import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const POSTS_ID = import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID;
export const COMMENTS_ID = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;

// ── Helpers ─────────────────────────────────────

export function parsePost(doc) {
    let reactions = {};
    try {
        // Appwrite stores reactions as a JSON string.
        // After an optimistic update the value may already be a parsed
        // object — handle both cases defensively.
        reactions =
            typeof doc.reactions === "string"
                ? JSON.parse(doc.reactions || "{}")
                : (doc.reactions ?? {});
    } catch {
        reactions = {};
    }

    return {
        ...doc,
        reactions,
        fileId: doc.fileId ?? null,
        mimeType: doc.mimeType ?? null,
        fileName: doc.fileName ?? null,
        sourceType: doc.sourceType ?? "none"
    };
}

// ── Posts ────────────────────────────────────────

export async function getPosts(departmentId, limit = 30) {
    const res = await databases.listDocuments(DB_ID, POSTS_ID, [
        Query.equal("departmentId", departmentId),
        Query.orderDesc("$createdAt"),
        Query.limit(limit)
    ]);
    return res.documents.map(parsePost);
}

export async function createPost({
    departmentId,
    authorId,
    authorName,
    authorRole,
    type,
    content,
    url = null,
    fileId = null,
    mimeType = null,
    fileName = null,
    sourceType = "none"
}) {
    const payload = {
        departmentId,
        authorId,
        authorName,
        authorRole,
        type,
        content,
        reactions: "{}",
        commentCount: 0,
        pinned: false,
        url: url ?? null,
        fileId: fileId ?? null,
        mimeType: mimeType ?? null,
        fileName: fileName ?? null,
        // Always a real string — never null — so Appwrite never stores null
        sourceType: sourceType ?? "none"
    };

    return await databases.createDocument(
        DB_ID,
        POSTS_ID,
        ID.unique(),
        payload
    );
}

export async function deletePost(postId) {
    return await databases.deleteDocument(DB_ID, POSTS_ID, postId);
}

export async function pinPost(postId, pinned) {
    return await databases.updateDocument(DB_ID, POSTS_ID, postId, { pinned });
}

/**
 * toggleReaction
 *
 * Re-fetches the latest reactions before writing to avoid race conditions.
 * Returns the new reactions OBJECT so usePosts can reconcile the
 * optimistic state with server truth after the write succeeds.
 * Throws on failure so usePosts can revert the optimistic update.
 */
export async function toggleReaction(postId, emoji, userId) {
    const fresh = await databases.getDocument(DB_ID, POSTS_ID, postId);

    let reactions = {};
    try {
        reactions =
            typeof fresh.reactions === "string"
                ? JSON.parse(fresh.reactions || "{}")
                : (fresh.reactions ?? {});
    } catch {
        reactions = {};
    }

    if (!reactions[emoji]) reactions[emoji] = [];
    const idx = reactions[emoji].indexOf(userId);
    if (idx === -1) {
        reactions[emoji] = [...reactions[emoji], userId];
    } else {
        reactions[emoji] = reactions[emoji].filter(id => id !== userId);
        if (reactions[emoji].length === 0) delete reactions[emoji];
    }

    // Must write a JSON string — Appwrite attribute is type String
    await databases.updateDocument(DB_ID, POSTS_ID, postId, {
        reactions: JSON.stringify(reactions)
    });

    // Return the object so the caller can sync optimistic → server state
    return reactions;
}

// ── Comments ─────────────────────────────────────

export async function getComments(postId) {
    const res = await databases.listDocuments(DB_ID, COMMENTS_ID, [
        Query.equal("postId", postId),
        Query.orderAsc("$createdAt"),
        Query.limit(50)
    ]);
    return res.documents;
}

export async function createComment({
    postId,
    departmentId,
    authorId,
    authorName,
    authorRole,
    content
}) {
    const comment = await databases.createDocument(
        DB_ID,
        COMMENTS_ID,
        ID.unique(),
        { postId, departmentId, authorId, authorName, authorRole, content }
    );

    databases
        .getDocument(DB_ID, POSTS_ID, postId)
        .then(post =>
            databases.updateDocument(DB_ID, POSTS_ID, postId, {
                commentCount: (post.commentCount || 0) + 1
            })
        )
        .catch(() => {});

    return comment;
}

export async function deleteComment(commentId, postId) {
    await databases.deleteDocument(DB_ID, COMMENTS_ID, commentId);

    databases
        .getDocument(DB_ID, POSTS_ID, postId)
        .then(post =>
            databases.updateDocument(DB_ID, POSTS_ID, postId, {
                commentCount: Math.max(0, (post.commentCount || 1) - 1)
            })
        )
        .catch(() => {});
}
