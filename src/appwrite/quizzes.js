import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const QUIZZES_ID = import.meta.env.VITE_APPWRITE_QUIZZES_COLLECTION_ID;
export const QUIZ_ATTEMPTS_ID = import.meta.env
    .VITE_APPWRITE_QUIZ_ATTEMPTS_COLLECTION_ID;

// Appwrite internal fields — always strip before updateDocument
const INTERNAL = [
    "$id",
    "$collectionId",
    "$databaseId",
    "$createdAt",
    "$updatedAt",
    "$permissions"
];

function parseQuiz(doc) {
    let questions = [];
    try {
        questions = JSON.parse(doc.questions || "[]");
    } catch {
        questions = [];
    }
    return { ...doc, questions };
}

export async function createQuiz({
    title,
    description,
    departmentId,
    repId,
    questions,
    durationMinutes,
    opensAt,
    closesAt
}) {
    return await databases.createDocument(DB_ID, QUIZZES_ID, ID.unique(), {
        title,
        description: description || "",
        departmentId,
        repId,
        questions: JSON.stringify(questions),
        durationMinutes: durationMinutes || 0,
        opensAt: opensAt || null,
        closesAt: closesAt || null,
        published: false
    });
}

export async function updateQuiz(quizId, updates) {
    const payload = { ...updates };
    INTERNAL.forEach(k => delete payload[k]);
    if (payload.questions && typeof payload.questions !== "string") {
        payload.questions = JSON.stringify(payload.questions);
    }
    return await databases.updateDocument(DB_ID, QUIZZES_ID, quizId, payload);
}

export async function deleteQuiz(quizId) {
    return await databases.deleteDocument(DB_ID, QUIZZES_ID, quizId);
}

export async function getQuizzes(departmentId) {
    const res = await databases.listDocuments(DB_ID, QUIZZES_ID, [
        Query.equal("departmentId", departmentId),
        Query.orderDesc("$createdAt"),
        Query.limit(50)
    ]);
    return res.documents.map(parseQuiz);
}

export async function getQuiz(quizId) {
    const doc = await databases.getDocument(DB_ID, QUIZZES_ID, quizId);
    return parseQuiz(doc);
}

// ── Attempts ─────────────────────────────────────

/**
 * Submit a new attempt.
 * quizVersion = quiz.$updatedAt so we can detect stale attempts when
 * the rep edits the quiz after a student already submitted.
 */
export async function submitAttempt({
    quizId,
    studentId,
    departmentId,
    answers,
    score,
    totalQuestions,
    timeTakenSeconds,
    quizVersion
}) {
    return await databases.createDocument(
        DB_ID,
        QUIZ_ATTEMPTS_ID,
        ID.unique(),
        {
            quizId,
            studentId,
            departmentId,
            answers: JSON.stringify(answers),
            score,
            totalQuestions,
            timeTakenSeconds,
            quizVersion: quizVersion || ""
        }
    );
}

/**
 * Get a student's most recent attempt at a quiz.
 * Returns null if never attempted.
 */
export async function getMyAttempt(quizId, studentId) {
    const res = await databases.listDocuments(DB_ID, QUIZ_ATTEMPTS_ID, [
        Query.equal("quizId", quizId),
        Query.equal("studentId", studentId),
        Query.orderDesc("$createdAt"),
        Query.limit(1)
    ]);
    if (res.total === 0) return null;
    const doc = res.documents[0];
    return { ...doc, answers: JSON.parse(doc.answers || "{}") };
}

/**
 * Delete a student's attempt so they can retake.
 */
export async function deleteAttempt(attemptId) {
    return await databases.deleteDocument(DB_ID, QUIZ_ATTEMPTS_ID, attemptId);
}

/**
 * Get all attempts for a quiz (for rep leaderboard).
 * Returns enriched with studentId — caller resolves names separately.
 */
export async function getQuizAttempts(quizId) {
    const res = await databases.listDocuments(DB_ID, QUIZ_ATTEMPTS_ID, [
        Query.equal("quizId", quizId),
        Query.orderDesc("score"),
        Query.limit(100)
    ]);
    return res.documents.map(doc => ({
        ...doc,
        answers: JSON.parse(doc.answers || "{}")
    }));
}
