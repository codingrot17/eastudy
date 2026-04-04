import { databases, DB_ID, DEPARTMENTS_ID, USERS_ID } from "./config";
import { ID, Query } from "appwrite";

// ── Code Generator ──────────────────────────────

const abbreviate = str =>
    str
        .split(" ")
        .map(w => w[0]?.toUpperCase() ?? "")
        .join("")
        .slice(0, 4);

const randomSuffix = (len = 4) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from(
        { length: len },
        () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
};

export const generateCode = (school, dept, level) => {
    const schoolAbbr = abbreviate(school); // e.g. LASU
    const deptAbbr = abbreviate(dept); // e.g. CS
    const lvl = level.replace("L", ""); // e.g. 300
    const suffix = randomSuffix(4); // e.g. X7K2
    return `${schoolAbbr}-${deptAbbr}${lvl}-${suffix}`; // LASU-CS300-X7K2
};

// ── Check Duplicate Department ──────────────────

export const checkDepartmentExists = async (school, name, level, session) => {
    const res = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
        Query.equal("school", school),
        Query.equal("name", name),
        Query.equal("level", level),
        Query.equal("session", session)
    ]);
    return res.total > 0;
};

// ── Create Department ───────────────────────────

export const createDepartment = async ({
    name,
    level,
    session,
    school,
    studentCount,
    repId,
    code
}) => {
    return await databases.createDocument(DB_ID, DEPARTMENTS_ID, ID.unique(), {
        name,
        level,
        session,
        school,
        studentCount,
        repId,
        code
    });
};

// ── Create User Profile ─────────────────────────

export const createUserProfile = async ({
    authId,
    name,
    email,
    role,
    departmentId = null
}) => {
    return await databases.createDocument(DB_ID, USERS_ID, ID.unique(), {
        authId,
        name,
        email,
        role,
        departmentId
    });
};

// ── Get User Profile by authId ──────────────────

export const getUserProfile = async authId => {
    const res = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("authId", authId)
    ]);
    return res.total > 0 ? res.documents[0] : null;
};

// ── Get Department by repId ─────────────────────

export const getDepartmentByRepId = async repId => {
    const res = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
        Query.equal("repId", repId)
    ]);
    return res.total > 0 ? res.documents[0] : null;
};
// ── Get Department by code ─────────────────────

export const getDepartmentByCode = async code => {
    const res = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
        Query.equal("code", code.toUpperCase().trim())
    ]);

    return res.total > 0 ? res.documents[0] : null;
};

// ── Get Department by ID ─────────────────────
export const getDepartmentById = async id => {
    return await databases.getDocument(DB_ID, DEPARTMENTS_ID, id);
};

// ── Get students in a department ────────────────

export const getDepartmentStudents = async departmentId => {
    const res = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("departmentId", departmentId),
        Query.equal("role", "student"),
        Query.limit(100)
    ]);
    return res.documents;
};

// ── Assign assistant rep ────────────────────────

export const assignAssistantRep = async (userId, departmentId) => {
    // Update user role to assistant
    const userRes = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("authId", userId)
    ]);
    if (userRes.total === 0) throw new Error("User not found");

    const userDoc = userRes.documents[0];
    await databases.updateDocument(DB_ID, USERS_ID, userDoc.$id, {
        role: "assistant"
    });

    // Update department with assistantRepId
    const deptRes = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
        Query.equal("$id", departmentId)
    ]);
    if (deptRes.total === 0) throw new Error("Department not found");

    return await databases.updateDocument(DB_ID, DEPARTMENTS_ID, departmentId, {
        assistantRepId: userId
    });
};

// ── Remove assistant rep ────────────────────────

export const removeAssistantRep = async (userId, departmentId) => {
    // Demote back to student
    const userRes = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("authId", userId)
    ]);
    if (userRes.total === 0) throw new Error("User not found");

    const userDoc = userRes.documents[0];
    await databases.updateDocument(DB_ID, USERS_ID, userDoc.$id, {
        role: "student"
    });

    // Remove from department
    return await databases.updateDocument(DB_ID, DEPARTMENTS_ID, departmentId, {
        assistantRepId: null
    });
};

// ── Get user profile by authId (for assistant lookup) ──

export const getUserByEmail = async email => {
    const res = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("email", email.toLowerCase().trim())
    ]);
    return res.total > 0 ? res.documents[0] : null;
};

// ── Get department assistant ────────────────────

export const getAssistantProfile = async assistantRepId => {
    if (!assistantRepId) return null;
    const res = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("authId", assistantRepId)
    ]);
    return res.total > 0 ? res.documents[0] : null;
};
