import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const POSTS_ID = import.meta.env.VITE_APPWRITE_POSTS_COLLECTION_ID;
export const COMMENTS_ID = import.meta.env.VITE_APPWRITE_COMMENTS_COLLECTION_ID;

// ── Helpers ─────────────────────────────────────

function parsePost(doc) {
    let reactions = {};
    try {
        reactions = JSON.parse(doc.reactions || "{}");
    } catch {}
    return { ...doc, reactions };
}

function parseComment(doc) {
    return { ...doc };
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
    type, // "text" | "resource" | "question"
    content,
    url = null
}) {
    return await databases.createDocument(DB_ID, POSTS_ID, ID.unique(), {
        departmentId,
        authorId,
        authorName,
        authorRole,
        type,
        content,
        url,
        reactions: "{}",
        commentCount: 0,
        pinned: false
    });
}

export async function deletePost(postId) {
    return await databases.deleteDocument(DB_ID, POSTS_ID, postId);
}

export async function pinPost(postId, pinned) {
    return await databases.updateDocument(DB_ID, POSTS_ID, postId, { pinned });
}

/**
 * Toggle a reaction emoji for a user.
 * Reads current reactions, adds or removes userId from the emoji array,
 * then writes back. Returns updated reactions object.
 */
export async function toggleReaction(postId, currentReactions, emoji, userId) {
    const updated = { ...currentReactions };
    if (!updated[emoji]) updated[emoji] = [];

    const idx = updated[emoji].indexOf(userId);
    if (idx === -1) {
        updated[emoji] = [...updated[emoji], userId];
    } else {
        updated[emoji] = updated[emoji].filter(id => id !== userId);
        if (updated[emoji].length === 0) delete updated[emoji];
    }

    await databases.updateDocument(DB_ID, POSTS_ID, postId, {
        reactions: JSON.stringify(updated)
    });
    return updated;
}

// ── Comments ─────────────────────────────────────

export async function getComments(postId) {
    const res = await databases.listDocuments(DB_ID, COMMENTS_ID, [
        Query.equal("postId", postId),
        Query.orderAsc("$createdAt"),
        Query.limit(50)
    ]);
    return res.documents.map(parseComment);
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

    // Increment commentCount on the post (best-effort)
    try {
        const post = await databases.getDocument(DB_ID, POSTS_ID, postId);
        await databases.updateDocument(DB_ID, POSTS_ID, postId, {
            commentCount: (post.commentCount || 0) + 1
        });
    } catch {}

    return comment;
}

export async function deleteComment(commentId, postId) {
    await databases.deleteDocument(DB_ID, COMMENTS_ID, commentId);

    // Decrement commentCount on the post (best-effort)
    try {
        const post = await databases.getDocument(DB_ID, POSTS_ID, postId);
        await databases.updateDocument(DB_ID, POSTS_ID, postId, {
            commentCount: Math.max(0, (post.commentCount || 1) - 1)
        });
    } catch {}
}
