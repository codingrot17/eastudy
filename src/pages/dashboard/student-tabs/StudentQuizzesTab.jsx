import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    Clock,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    Trophy,
    RefreshCw,
    RotateCcw,
    Loader2
} from "lucide-react";
import { useQuizzes, useQuizAttempt } from "../../../hooks/useQuizzes";
import Button from "../../../components/ui/Button";

export default function StudentQuizzesTab({ department, user }) {
    const { quizzes, loading, error, refresh } = useQuizzes(department?.$id, {
        repMode: false
    });
    const [activeQuiz, setActiveQuiz] = useState(null);

    // When the rep updates a quiz that the student is currently viewing,
    // close the runner so the stale-version detection re-runs.
    const handleDone = () => {
        setActiveQuiz(null);
        refresh();
    };

    if (activeQuiz) {
        return (
            <QuizRunner
                quiz={activeQuiz}
                userId={user?.$id}
                departmentId={department?.$id}
                onDone={handleDone}
                onBack={() => setActiveQuiz(null)}
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Quizzes</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Tests from your rep
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse"
                        >
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 mb-3" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : quizzes.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                        <ClipboardList size={24} className="text-amber-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No quizzes yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Your rep hasn't published any quizzes yet. Check back
                        soon.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {quizzes.map(quiz => (
                        <QuizCard
                            key={quiz.$id}
                            quiz={quiz}
                            userId={user?.$id}
                            onStart={() => setActiveQuiz(quiz)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Quiz Card ────────────────────────────────────

function QuizCard({ quiz, userId, onStart }) {
    // Pass quiz.$updatedAt so stale attempt detection works
    const { attempt, loading, retaking, retake } = useQuizAttempt(
        quiz.$id,
        userId,
        quiz.$updatedAt
    );

    const pct = attempt
        ? Math.round((attempt.score / attempt.totalQuestions) * 100)
        : null;

    return (
        <div
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col gap-3 ${
                attempt
                    ? "border-green-200 dark:border-green-800"
                    : "border-slate-100 dark:border-slate-800"
            }`}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{quiz.title}</p>
                    {quiz.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            {quiz.description}
                        </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <ClipboardList size={11} />
                            {quiz.questions.length} question
                            {quiz.questions.length !== 1 ? "s" : ""}
                        </span>
                        {quiz.durationMinutes > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={11} /> {quiz.durationMinutes} min
                            </span>
                        )}
                    </div>
                </div>

                {/* Score badge */}
                {!loading && attempt && (
                    <div className="shrink-0 flex flex-col items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3">
                        <Trophy size={16} className="text-amber-500 mb-1" />
                        <p className="font-extrabold text-green-700 dark:text-green-400 text-lg leading-none">
                            {pct}%
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                            {attempt.score}/{attempt.totalQuestions}
                        </p>
                    </div>
                )}
            </div>

            {/* Score bar */}
            {!loading && attempt && (
                <div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`h-full rounded-full ${
                                pct >= 70
                                    ? "bg-green-500"
                                    : pct >= 40
                                      ? "bg-amber-500"
                                      : "bg-red-400"
                            }`}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1 text-right">
                        {pct >= 70
                            ? "Great job! 🎉"
                            : pct >= 40
                              ? "Not bad 👍"
                              : "Keep practising 💪"}
                    </p>
                </div>
            )}

            {/* Actions */}
            {loading ? (
                <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : attempt ? (
                // Already submitted — show retake option
                <div className="flex gap-2">
                    <button
                        onClick={retake}
                        disabled={retaking}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {retaking ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <RotateCcw size={15} />
                        )}
                        {retaking ? "Resetting..." : "Retake Quiz"}
                    </button>
                </div>
            ) : (
                <Button size="sm" onClick={onStart} className="w-full">
                    Start Quiz <ArrowRight size={15} className="ml-1" />
                </Button>
            )}
        </div>
    );
}

// ── Quiz Runner ──────────────────────────────────

function QuizRunner({ quiz, userId, departmentId, onDone, onBack }) {
    // Pass quiz.$updatedAt so version is stamped on the new attempt
    const { submit } = useQuizAttempt(quiz.$id, userId, quiz.$updatedAt);

    const [answers, setAnswers] = useState({});
    const [currentQ, setCurrentQ] = useState(0);
    const [phase, setPhase] = useState("quiz"); // quiz | result
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(
        quiz.durationMinutes > 0 ? quiz.durationMinutes * 60 : null
    );
    const startTime = useRef(Date.now());
    const timerRef = useRef(null);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || phase !== "quiz") return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, phase]);

    const handleAnswer = (qIdx, optIdx) => {
        setAnswers(p => ({ ...p, [qIdx]: optIdx }));
    };

    const handleSubmit = useCallback(async () => {
        clearTimeout(timerRef.current);
        setSubmitting(true);
        const timeTaken = Math.round((Date.now() - startTime.current) / 1000);

        let score = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.answer) score++;
        });

        try {
            await submit({
                departmentId,
                answers,
                score,
                totalQuestions: quiz.questions.length,
                timeTakenSeconds: timeTaken
            });
        } catch {
            // network error — still show result locally
        }

        setResult({
            score,
            total: quiz.questions.length,
            pct: Math.round((score / quiz.questions.length) * 100)
        });
        setPhase("result");
        setSubmitting(false);
    }, [answers, quiz, submit, departmentId]);

    const q = quiz.questions[currentQ];
    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;

    // ── Result screen ────────────────────────────
    if (phase === "result" && result) {
        return (
            <div className="flex flex-col gap-6">
                <button
                    onClick={onDone}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Quizzes
                </button>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center gap-5 text-center">
                    <div
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold border-4 ${
                            result.pct >= 70
                                ? "bg-green-50 dark:bg-green-900/20 border-green-400 text-green-700 dark:text-green-400"
                                : result.pct >= 40
                                  ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-700 dark:text-amber-400"
                                  : "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400"
                        }`}
                    >
                        {result.pct}%
                    </div>

                    <div>
                        <p className="text-2xl font-extrabold">
                            {result.pct >= 70
                                ? "Great job! 🎉"
                                : result.pct >= 40
                                  ? "Not bad! 👍"
                                  : "Keep practising 💪"}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            You scored {result.score} out of {result.total}
                        </p>
                    </div>

                    {/* Answer review */}
                    <div className="w-full flex flex-col gap-3 text-left mt-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Review
                        </p>
                        {quiz.questions.map((q, i) => {
                            const studentAns = answers[i] ?? -1;
                            const correct = studentAns === q.answer;
                            return (
                                <div
                                    key={i}
                                    className={`rounded-xl border p-4 flex flex-col gap-2 ${
                                        correct
                                            ? "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10"
                                            : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                                    }`}
                                >
                                    <p className="text-sm font-semibold">
                                        {i + 1}. {q.question}
                                    </p>
                                    <div className="flex flex-col gap-1">
                                        {q.options.map((opt, oi) => (
                                            <div
                                                key={oi}
                                                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                                                    oi === q.answer
                                                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold"
                                                        : oi === studentAns &&
                                                            !correct
                                                          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 line-through"
                                                          : "text-slate-600 dark:text-slate-400"
                                                }`}
                                            >
                                                {oi === q.answer && (
                                                    <CheckCircle size={12} />
                                                )}
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Button onClick={onDone} className="w-full">
                        Done
                    </Button>
                </div>
            </div>
        );
    }

    // ── Quiz screen ──────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{quiz.title}</p>
                    <p className="text-xs text-slate-400">
                        {answered}/{total} answered
                    </p>
                </div>
                {timeLeft !== null && (
                    <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ${
                            timeLeft < 60
                                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        }`}
                    >
                        <Clock size={14} />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-primary-700 rounded-full"
                    animate={{ width: `${((currentQ + 1) / total) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Question card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.22 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-5"
                >
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Question {currentQ + 1} of {total}
                    </span>
                    <p className="font-bold text-lg leading-snug">
                        {q.question}
                    </p>

                    <div className="flex flex-col gap-3">
                        {q.options.map((opt, oi) => (
                            <button
                                key={oi}
                                onClick={() => handleAnswer(currentQ, oi)}
                                className={`w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-sm transition-all ${
                                    answers[currentQ] === oi
                                        ? "border-primary-700 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                                        : "border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                <span className="font-bold mr-3 text-slate-400">
                                    {String.fromCharCode(65 + oi)}.
                                </span>
                                {opt}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3">
                <button
                    onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
                    disabled={currentQ === 0}
                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
                >
                    <ArrowLeft size={16} className="inline mr-1" /> Prev
                </button>

                {currentQ < total - 1 ? (
                    <Button
                        onClick={() => setCurrentQ(p => p + 1)}
                        className="flex-1"
                    >
                        Next <ArrowRight size={16} className="ml-1" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || answered < total}
                        className="flex-1"
                    >
                        {submitting
                            ? "Submitting..."
                            : `Submit (${answered}/${total})`}
                    </Button>
                )}
            </div>

            {/* Question dots nav */}
            <div className="flex flex-wrap gap-2 justify-center">
                {quiz.questions.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentQ(i)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                            i === currentQ
                                ? "bg-primary-700 text-white"
                                : answers[i] !== undefined
                                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
