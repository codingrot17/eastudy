import { databases, DB_ID, DEPARTMENTS_ID, USERS_ID } from "./config";
import { ID, Query } from "appwrite";
import { cachedFetch, invalidate, invalidatePrefix } from "./appwriteCache";

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
    const schoolAbbr = abbreviate(school);
    const deptAbbr = abbreviate(dept);
    const lvl = level.replace("L", "");
    const suffix = randomSuffix(4);
    return `${schoolAbbr}-${deptAbbr}${lvl}-${suffix}`;
};

// ── Check Duplicate ─────────────────────────────

export const checkDepartmentExists = async (school, name, level, session) => {
    const res = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
        Query.equal("school", school),
        Query.equal("name", name),
        Query.equal("level", level),
        Query.equal("session", session)
    ]);
    return res.total > 0;
};

// ── Create ──────────────────────────────────────

export const createDepartment = async ({
    name,
    level,
    session,
    school,
    studentCount,
    repId,
    code
}) => {
    const doc = await databases.createDocument(
        DB_ID,
        DEPARTMENTS_ID,
        ID.unique(), // always generates a fresh unique ID
        { name, level, session, school, studentCount, repId, code }
    );
    invalidatePrefix("dept:");
    return doc;
};

export const createUserProfile = async ({
    authId,
    name,
    email,
    role,
    departmentId = null
}) => {
    // Guard: check if a profile already exists for this authId.
    // This prevents the "document already exists" crash when signup
    // is retried (e.g. after a network hiccup or StrictMode double-mount).
    try {
        const existing = await databases.listDocuments(DB_ID, USERS_ID, [
            Query.equal("authId", authId),
            Query.limit(1)
        ]);
        if (existing.total > 0) {
            // Profile already exists — return it rather than crashing
            console.warn(
                "[createUserProfile] Profile already exists for",
                authId,
                "— returning existing"
            );
            return existing.documents[0];
        }
    } catch (err) {
        // If the check itself fails (permissions, network), log and proceed
        // to attempt creation — Appwrite will throw a 409 which we handle below
        console.warn("[createUserProfile] Pre-check failed:", err?.message);
    }

    try {
        return await databases.createDocument(
            DB_ID,
            USERS_ID,
            ID.unique(), // always a fresh ID — never reuse authId as document ID
            { authId, name, email, role, departmentId }
        );
    } catch (err) {
        // 409 = document with this content already exists (race condition)
        // Fetch and return the existing profile instead of surfacing the error
        if (err?.code === 409) {
            const res = await databases.listDocuments(DB_ID, USERS_ID, [
                Query.equal("authId", authId),
                Query.limit(1)
            ]);
            if (res.total > 0) return res.documents[0];
        }
        throw err;
    }
};

// ── Reads — these are the hot paths, all cached ─

export const getUserProfile = async authId => {
    return cachedFetch(
        `profile:${authId}`,
        async () => {
            const res = await databases.listDocuments(DB_ID, USERS_ID, [
                Query.equal("authId", authId)
            ]);
            return res.total > 0 ? res.documents[0] : null;
        },
        300_000 // 5 minutes
    );
};

export const getDepartmentByRepId = async repId => {
    return cachedFetch(
        `dept:rep:${repId}`,
        async () => {
            const res = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
                Query.equal("repId", repId)
            ]);
            return res.total > 0 ? res.documents[0] : null;
        },
        120_000
    );
};

export const getDepartmentByCode = async code => {
    const normalized = code.toUpperCase().trim();
    return cachedFetch(
        `dept:code:${normalized}`,
        async () => {
            const res = await databases.listDocuments(DB_ID, DEPARTMENTS_ID, [
                Query.equal("code", normalized)
            ]);
            return res.total > 0 ? res.documents[0] : null;
        },
        120_000
    );
};

export const getDepartmentById = async id => {
    return cachedFetch(
        `dept:id:${id}`,
        () => databases.getDocument(DB_ID, DEPARTMENTS_ID, id),
        120_000
    );
};

export const getDepartmentStudents = async departmentId => {
    return cachedFetch(
        `dept:students:${departmentId}`,
        async () => {
            const res = await databases.listDocuments(DB_ID, USERS_ID, [
                Query.equal("departmentId", departmentId),
                Query.equal("role", "student"),
                Query.limit(100)
            ]);
            return res.documents;
        },
        60_000
    );
};

// ── Assistant rep operations ─────────────────────

export const assignAssistantRep = async (userAuthId, departmentId) => {
    const userRes = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("authId", userAuthId)
    ]);
    if (userRes.total === 0) throw new Error("User not found");

    const userDoc = userRes.documents[0];

    await databases.updateDocument(DB_ID, USERS_ID, userDoc.$id, {
        role: "assistant",
        departmentId
    });

    const dept = await databases.getDocument(
        DB_ID,
        DEPARTMENTS_ID,
        departmentId
    );
    const result = await databases.updateDocument(
        DB_ID,
        DEPARTMENTS_ID,
        dept.$id,
        { assistantRepId: userAuthId }
    );

    invalidate(`profile:${userAuthId}`);
    invalidate(`dept:id:${departmentId}`);
    return result;
};

export const removeAssistantRep = async (userAuthId, departmentId) => {
    const userRes = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("authId", userAuthId)
    ]);
    if (userRes.total === 0) throw new Error("User not found");

    const userDoc = userRes.documents[0];

    await databases.updateDocument(DB_ID, USERS_ID, userDoc.$id, {
        role: "student"
    });

    const result = await databases.updateDocument(
        DB_ID,
        DEPARTMENTS_ID,
        departmentId,
        { assistantRepId: null }
    );

    invalidate(`profile:${userAuthId}`);
    invalidate(`dept:id:${departmentId}`);
    return result;
};

export const getUserByEmail = async email => {
    const res = await databases.listDocuments(DB_ID, USERS_ID, [
        Query.equal("email", email.toLowerCase().trim())
    ]);
    return res.total > 0 ? res.documents[0] : null;
};

export const getAssistantProfile = async assistantRepId => {
    if (!assistantRepId) return null;
    return cachedFetch(
        `profile:assistant:${assistantRepId}`,
        async () => {
            const res = await databases.listDocuments(DB_ID, USERS_ID, [
                Query.equal("authId", assistantRepId)
            ]);
            return res.total > 0 ? res.documents[0] : null;
        },
        120_000
    );
};