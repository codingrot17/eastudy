import { useState, useEffect, useCallback, useRef } from "react";
import { client, databases, DB_ID, USERS_ID } from "../appwrite/config";
import { Query } from "appwrite";
import {
    getQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitAttempt,
    getMyAttempt,
    deleteAttempt,
    getQuizAttempts,
    QUIZZES_ID
} from "../appwrite/quizzes";
import { fireNotif } from "../utils/notify";

// ── Shared list hook ─────────────────────────────

export function useQuizzes(departmentId, { repMode = false } = {}) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Track which quizzes were already published on first load so we don't
    // fire a stale notification for quizzes published before the tab opened.
    const initialPublished = useRef(null);

    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getQuizzes(departmentId);
            const filtered = repMode ? docs : docs.filter(q => q.published);
            setQuizzes(filtered);
            if (initialPublished.current === null) {
                initialPublished.current = new Set(
                    docs.filter(q => q.published).map(q => q.$id)
                );
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId, repMode]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    // Real-time subscription — notify students when a quiz is published
    useEffect(() => {
        if (!departmentId || !QUIZZES_ID) return;

        const channel = `databases.${DB_ID}.collections.${QUIZZES_ID}.documents`;
        const unsub = client.subscribe(channel, event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            const isCreate = event.events.some(e => e.includes("create"));
            const isUpdate = event.events.some(e => e.includes("update"));
            const isDelete = event.events.some(e => e.includes("delete"));

            if (isCreate || isUpdate) {
                const wasPublished =
                    initialPublished.current?.has(doc.$id) ?? false;
                const isNowPublished = doc.published;

                // Fire notification only when a quiz just flipped to published
                if (!repMode && isNowPublished && !wasPublished) {
                    fireNotif({
                        title: "📝 New Quiz Available",
                        body: `${doc.title} — tap to take it now`,
                        tag: `quiz-published-${doc.$id}`,
                        url: "/dashboard/student"
                    });
                }

                if (isNowPublished) {
                    initialPublished.current?.add(doc.$id);
                } else {
                    initialPublished.current?.delete(doc.$id);
                }

                if (isCreate) {
                    if (repMode || doc.published) {
                        setQuizzes(prev => [
                            doc,
                            ...prev.filter(q => q.$id !== doc.$id)
                        ]);
                    }
                } else {
                    setQuizzes(prev => {
                        const updated = prev.map(q =>
                            q.$id === doc.$id ? { ...q, ...doc } : q
                        );
                        return repMode
                            ? updated
                            : updated.filter(q => q.published);
                    });
                }
            }

            if (isDelete) {
                setQuizzes(prev => prev.filter(q => q.$id !== doc.$id));
                initialPublished.current?.delete(doc.$id);
            }
        });

        return () => unsub();
    }, [departmentId, repMode]);

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

                const uniqueIds = [...new Set(raw.map(a => a.studentId))];

                const res = await databases.listDocuments(DB_ID, USERS_ID, [
                    Query.equal("authId", uniqueIds),
                    Query.limit(100)
                ]);

                const profileMap = {};
                res.documents.forEach(u => {
                    profileMap[u.authId] = { name: u.name, email: u.email };
                });

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
