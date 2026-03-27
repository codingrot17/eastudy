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
