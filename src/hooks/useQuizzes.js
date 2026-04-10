import { useState, useEffect, useCallback } from "react";
import { databases, DB_ID, USERS_ID } from "../appwrite/config";
import { Query } from "appwrite";
import {
    getQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitAttempt,
    getMyAttempt,
    deleteAttempt,
    getQuizAttempts
} from "../appwrite/quizzes";

// ── Shared list hook ─────────────────────────────

export function useQuizzes(departmentId, { repMode = false } = {}) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getQuizzes(departmentId);
            setQuizzes(repMode ? docs : docs.filter(q => q.published));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId, repMode]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const create = async data => {
        const quiz = await createQuiz({ ...data, departmentId });
        await fetch();
        return quiz;
    };

    const update = async (quizId, data) => {
        const quiz = await updateQuiz(quizId, data);
        await fetch();
        return quiz;
    };

    const remove = async quizId => {
        await deleteQuiz(quizId);
        setQuizzes(prev => prev.filter(q => q.$id !== quizId));
    };

    const togglePublish = async (quizId, currentPublished) => {
        await updateQuiz(quizId, { published: !currentPublished });
        setQuizzes(prev =>
            prev.map(q =>
                q.$id === quizId ? { ...q, published: !currentPublished } : q
            )
        );
    };

    return {
        quizzes,
        loading,
        error,
        create,
        update,
        remove,
        togglePublish,
        refresh: fetch
    };
}

// ── Single attempt hook ──────────────────────────

/**
 * useQuizAttempt
 *
 * - Checks if student has an existing attempt
 * - If the quiz was updated AFTER the attempt was submitted (quizVersion mismatch),
 *   the old attempt is automatically cleared so the student must retake
 * - retake() lets a student manually delete their attempt and try again
 * - submit() stores the new attempt with the current quiz version
 */
export function useQuizAttempt(quizId, studentId, quizUpdatedAt) {
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retaking, setRetaking] = useState(false);

    const loadAttempt = useCallback(async () => {
        if (!quizId || !studentId) {
            setLoading(false);
            return;
        }
        try {
            const a = await getMyAttempt(quizId, studentId);

            if (a && quizUpdatedAt && a.quizVersion !== quizUpdatedAt) {
                // Quiz was edited after this attempt — delete stale attempt silently
                await deleteAttempt(a.$id);
                setAttempt(null);
            } else {
                setAttempt(a);
            }
        } catch {
            setAttempt(null);
        } finally {
            setLoading(false);
        }
    }, [quizId, studentId, quizUpdatedAt]);

    useEffect(() => {
        loadAttempt();
    }, [loadAttempt]);

    const submit = async ({
        departmentId,
        answers,
        score,
        totalQuestions,
        timeTakenSeconds
    }) => {
        const result = await submitAttempt({
            quizId,
            studentId,
            departmentId,
            answers,
            score,
            totalQuestions,
            timeTakenSeconds,
            quizVersion: quizUpdatedAt || ""
        });
        setAttempt(result);
        return result;
    };

    /**
     * Manually retake — deletes the existing attempt and resets state.
     * The QuizRunner will re-mount and the student can answer again.
     */
    const retake = async () => {
        if (!attempt) return;
        setRetaking(true);
        try {
            await deleteAttempt(attempt.$id);
            setAttempt(null);
        } finally {
            setRetaking(false);
        }
    };

    return { attempt, loading, retaking, submit, retake };
}

// ── Results hook with name resolution ───────────

/**
 * useQuizResults
 *
 * Fetches all attempts for a quiz, then resolves each studentId to a
 * real name + email by querying the users collection.
 */
export function useQuizResults(quizId) {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!quizId) return;

        const load = async () => {
            try {
                const raw = await getQuizAttempts(quizId);
                if (raw.length === 0) {
                    setAttempts([]);
                    return;
                }

                // Deduplicate studentIds to minimise Appwrite queries
                const uniqueIds = [...new Set(raw.map(a => a.studentId))];

                // Fetch user profiles in one batched query (up to 100)
                const res = await databases.listDocuments(DB_ID, USERS_ID, [
                    Query.equal("authId", uniqueIds),
                    Query.limit(100)
                ]);

                // Build lookup map: authId → { name, email }
                const profileMap = {};
                res.documents.forEach(u => {
                    profileMap[u.authId] = { name: u.name, email: u.email };
                });

                // Enrich each attempt
                const enriched = raw.map(a => ({
                    ...a,
                    studentName: profileMap[a.studentId]?.name || "Unknown",
                    studentEmail: profileMap[a.studentId]?.email || a.studentId
                }));

                setAttempts(enriched);
            } catch {
                setAttempts([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [quizId]);

    return { attempts, loading };
}
