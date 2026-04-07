import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const SCHEDULES_ID = import.meta.env
    .VITE_APPWRITE_SCHEDULES_COLLECTION_ID;

export const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

// ── Fetch all schedule entries for a department ─

export const getSchedule = async departmentId => {
    const res = await databases.listDocuments(DB_ID, SCHEDULES_ID, [
        Query.equal("departmentId", departmentId),
        Query.limit(200)
    ]);
    return res.documents;
};

// ── Create a class entry ────────────────────────

export const createClass = async ({
    departmentId,
    day,
    courseCode,
    courseName,
    lecturer,
    venue,
    startTime,
    endTime
}) => {
    return await databases.createDocument(DB_ID, SCHEDULES_ID, ID.unique(), {
        departmentId,
        day,
        courseCode: courseCode.toUpperCase().trim(),
        courseName: courseName.trim(),
        lecturer: lecturer.trim(),
        venue: venue.trim(),
        startTime,
        endTime
    });
};

// ── Update a class entry ────────────────────────

export const updateClass = async (classId, updates) => {
    return await databases.updateDocument(
        DB_ID,
        SCHEDULES_ID,
        classId,
        updates
    );
};

// ── Delete a class entry ────────────────────────

export const deleteClass = async classId => {
    return await databases.deleteDocument(DB_ID, SCHEDULES_ID, classId);
};
