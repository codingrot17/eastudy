import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const GROUP_STUDY_ID = import.meta.env
    .VITE_APPWRITE_GROUP_STUDY_COLLECTION_ID;

const INTERNAL = [
    "$id",
    "$collectionId",
    "$databaseId",
    "$createdAt",
    "$updatedAt",
    "$permissions"
];

function parseSession(doc) {
    let attendees = [];
    try {
        attendees = JSON.parse(doc.attendees || "[]");
    } catch {}
    return { ...doc, attendees };
}

export async function getSessions(departmentId) {
    const res = await databases.listDocuments(DB_ID, GROUP_STUDY_ID, [
        Query.equal("departmentId", departmentId),
        Query.orderAsc("date"),
        Query.limit(50)
    ]);
    return res.documents.map(parseSession);
}

export async function createSession({
    departmentId,
    createdBy,
    creatorName,
    title,
    location,
    date,
    time,
    maxSlots,
    isPrivate = false, // ← new
    password = null // ← new
}) {
    return await databases.createDocument(DB_ID, GROUP_STUDY_ID, ID.unique(), {
        departmentId,
        createdBy,
        creatorName,
        title,
        location,
        date,
        time,
        maxSlots: maxSlots || 0,
        attendees: "[]",
        status: "open",
        isPrivate,
        password: isPrivate && password ? password : null
    });
}

export async function joinSession(sessionId, currentAttendees, user) {
    const already = currentAttendees.some(a => a.authId === user.$id);
    if (already) return;
    const updated = [
        ...currentAttendees,
        { authId: user.$id, name: user.name }
    ];
    return await databases.updateDocument(DB_ID, GROUP_STUDY_ID, sessionId, {
        attendees: JSON.stringify(updated)
    });
}

export async function leaveSession(sessionId, currentAttendees, userId) {
    const updated = currentAttendees.filter(a => a.authId !== userId);
    return await databases.updateDocument(DB_ID, GROUP_STUDY_ID, sessionId, {
        attendees: JSON.stringify(updated)
    });
}

export async function cancelSession(sessionId) {
    return await databases.updateDocument(DB_ID, GROUP_STUDY_ID, sessionId, {
        status: "cancelled"
    });
}

export async function deleteSession(sessionId) {
    return await databases.deleteDocument(DB_ID, GROUP_STUDY_ID, sessionId);
}
