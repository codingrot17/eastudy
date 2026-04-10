import { useState, useEffect, useCallback } from "react";
import {
    getQuizzes,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    submitAttempt,
    getMyAttempt,
    getQuizAttempts
} from "../appwrite/quizzes";

/**
 * useQuizzes — shared between rep and student.
 * repMode: true = full CRUD visible; false = student view (published only)
 */
export function useQuizzes(departmentId, { repMode = false } = {}) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getQuizzes(departmentId);
            // Students only see published quizzes
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

    // Rep actions
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

/**
 * useQuizAttempt — for a single student on a single quiz
 */
export function useQuizAttempt(quizId, studentId) {
    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!quizId || !studentId) {
            setLoading(false);
            return;
        }
        getMyAttempt(quizId, studentId)
            .then(setAttempt)
            .catch(() => setAttempt(null))
            .finally(() => setLoading(false));
    }, [quizId, studentId]);

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
            timeTakenSeconds
        });
        setAttempt(result);
        return result;
    };

    return { attempt, loading, submit };
}

/**
 * useQuizResults — for rep to see all attempts on a quiz
 */
export function useQuizResults(quizId) {
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!quizId) return;
        getQuizAttempts(quizId)
            .then(setAttempts)
            .catch(() => setAttempts([]))
            .finally(() => setLoading(false));
    }, [quizId]);

    return { attempts, loading };
}
