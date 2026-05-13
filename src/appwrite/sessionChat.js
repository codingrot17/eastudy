import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const SESSION_MESSAGES_ID = import.meta.env
    .VITE_APPWRITE_SESSION_MESSAGES_COLLECTION_ID;

/**
 * Appwrite collection schema for session_messages:
 *
 * sessionId     string   required
 * departmentId  string   required
 * authorId      string   required
 * authorName    string   required
 * authorRole    string   required  (rep | assistant | student)
 * content       string   nullable  (text message, up to 1000 chars)
 * fileId        string   nullable  (Appwrite storage file ID)
 * mimeType      string   nullable
 * fileName      string   nullable
 * sourceType    string   default="none"  (none | file)
 * $createdAt    auto
 */

export async function getMessages(sessionId, limit = 100) {
    if (!SESSION_MESSAGES_ID) {
        console.warn("[sessionChat] SESSION_MESSAGES_ID not set");
        return [];
    }
    const res = await databases.listDocuments(DB_ID, SESSION_MESSAGES_ID, [
        Query.equal("sessionId", sessionId),
        Query.orderAsc("$createdAt"),
        Query.limit(limit)
    ]);
    return res.documents;
}

export async function sendMessage({
    sessionId,
    departmentId,
    authorId,
    authorName,
    authorRole,
    content,
    fileId = null,
    mimeType = null,
    fileName = null,
    sourceType = "none"
}) {
    if (!SESSION_MESSAGES_ID) {
        throw new Error("SESSION_MESSAGES_ID not configured");
    }
    return await databases.createDocument(
        DB_ID,
        SESSION_MESSAGES_ID,
        ID.unique(),
        {
            sessionId,
            departmentId,
            authorId,
            authorName,
            authorRole,
            content: content ?? null,
            fileId: fileId ?? null,
            mimeType: mimeType ?? null,
            fileName: fileName ?? null,
            sourceType: sourceType ?? "none"
        }
    );
}

export async function deleteMessage(messageId) {
    if (!SESSION_MESSAGES_ID) return;
    return await databases.deleteDocument(
        DB_ID,
        SESSION_MESSAGES_ID,
        messageId
    );
}
