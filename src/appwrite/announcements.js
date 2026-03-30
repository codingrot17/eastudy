import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;

// ── Fetch all announcements for a department ────

export const getAnnouncements = async departmentId => {
    const res = await databases.listDocuments(DB_ID, ANNOUNCEMENTS_ID, [
        Query.equal("departmentId", departmentId),
        Query.orderDesc("$createdAt"),
        Query.limit(50)
    ]);
    return res.documents;
};

// ── Create announcement ─────────────────────────

export const createAnnouncement = async ({
    content,
    departmentId,
    repId,
    repName,
    pinned = false
}) => {
    return await databases.createDocument(
        DB_ID,
        ANNOUNCEMENTS_ID,
        ID.unique(),
        { content, departmentId, repId, repName, pinned }
    );
};

// ── Toggle pin ──────────────────────────────────

export const togglePin = async (announcementId, pinned) => {
    return await databases.updateDocument(
        DB_ID,
        ANNOUNCEMENTS_ID,
        announcementId,
        { pinned }
    );
};

// ── Delete announcement ─────────────────────────

export const deleteAnnouncement = async announcementId => {
    return await databases.deleteDocument(
        DB_ID,
        ANNOUNCEMENTS_ID,
        announcementId
    );
};

export { ANNOUNCEMENTS_ID };
