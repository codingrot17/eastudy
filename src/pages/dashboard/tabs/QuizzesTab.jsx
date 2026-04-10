import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ClipboardList,
    Plus,
    Trash2,
    Pencil,
    Eye,
    EyeOff,
    Send,
    X,
    Check,
    Loader2,
    RefreshCw,
    AlertCircle,
    Users,
    Trophy,
    Clock
} from "lucide-react";
import { useQuizzes, useQuizResults } from "../../../hooks/useQuizzes";
import Button from "../../../components/ui/Button";

const emptyQuestion = () => ({
    question: "",
    options: ["", "", "", ""],
    answer: 0
});

const emptyForm = () => ({
    title: "",
    description: "",
    durationMinutes: 10,
    questions: [emptyQuestion()]
});

export default function QuizzesTab({ department, user }) {
    const {
        quizzes,
        loading,
        error,
        create,
        update,
        remove,
        togglePublish,
        refresh
    } = useQuizzes(department?.$id, { repMode: true });

    const [view, setView] = useState("list"); // list | form | results
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [resultsQuizId, setResultsQuizId] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const openCreate = () => {
        setForm(emptyForm());
        setEditingQuiz(null);
        setFormError("");
        setView("form");
    };

    const openEdit = quiz => {
        setForm({
            title: quiz.title,
            description: quiz.description,
            durationMinutes: quiz.durationMinutes,
            questions:
                quiz.questions.length > 0 ? quiz.questions : [emptyQuestion()]
        });
        setEditingQuiz(quiz);
        setFormError("");
        setView("form");
    };

    const addQuestion = () =>
        setForm(p => ({ ...p, questions: [...p.questions, emptyQuestion()] }));

    const removeQuestion = idx => {
        if (form.questions.length === 1) return;
        setForm(p => ({
            ...p,
            questions: p.questions.filter((_, i) => i !== idx)
        }));
    };

    const updateQuestion = (idx, field, val) =>
        setForm(p => ({
            ...p,
            questions: p.questions.map((q, i) =>
                i === idx ? { ...q, [field]: val } : q
            )
        }));

    const updateOption = (qIdx, oIdx, val) =>
        setForm(p => ({
            ...p,
            questions: p.questions.map((q, i) =>
                i === qIdx
                    ? {
                          ...q,
                          options: q.options.map((o, j) =>
                              j === oIdx ? val : o
                          )
                      }
                    : q
            )
        }));

    const setAnswer = (qIdx, oIdx) => updateQuestion(qIdx, "answer", oIdx);

    const handleSubmit = async e => {
        e.preventDefault();
        setFormError("");

        for (let i = 0; i < form.questions.length; i++) {
            const q = form.questions[i];
            if (!q.question.trim()) {
                setFormError(`Question ${i + 1} is empty.`);
                return;
            }
            if (q.options.some(o => !o.trim())) {
                setFormError(`Question ${i + 1} has an empty option.`);
                return;
            }
        }

        setSaving(true);
        try {
            if (editingQuiz) {
                await update(editingQuiz.$id, {
                    title: form.title,
                    description: form.description,
                    durationMinutes: Number(form.durationMinutes),
                    questions: form.questions
                });
            } else {
                await create({
                    title: form.title,
                    description: form.description,
                    durationMinutes: Number(form.durationMinutes),
                    questions: form.questions,
                    repId: user?.$id
                });
            }
            setView("list");
        } catch (err) {
            setFormError(err.message || "Failed to save quiz.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async id => {
        setDeletingId(id);
        try {
            await remove(id);
        } finally {
            setDeletingId(null);
        }
    };

    // ── Results view ─────────────────────────────
    if (view === "results" && resultsQuizId) {
        const quiz = quizzes.find(q => q.$id === resultsQuizId);
        return <ResultsView quiz={quiz} onBack={() => setView("list")} />;
    }

    // ── Form view ────────────────────────────────
    if (view === "form") {
        return (
            <QuizForm
                form={form}
                setForm={setForm}
                editingQuiz={editingQuiz}
                saving={saving}
                formError={formError}
                onSubmit={handleSubmit}
                onCancel={() => setView("list")}
                onAddQuestion={addQuestion}
                onRemoveQuestion={removeQuestion}
                onUpdateQuestion={updateQuestion}
                onUpdateOption={updateOption}
                onSetAnswer={setAnswer}
            />
        );
    }

    // ── List view ────────────────────────────────
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Quizzes</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}{" "}
                        created
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button size="sm" onClick={openCreate}>
                        <Plus size={16} className="mr-1" /> New Quiz
                    </Button>
                </div>
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
                        Create your first quiz and publish it for your students
                        to take.
                    </p>
                    <button
                        onClick={openCreate}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                    >
                        Create first quiz →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                        {quizzes.map(quiz => (
                            <motion.div
                                key={quiz.$id}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col gap-3 ${
                                    quiz.published
                                        ? "border-green-200 dark:border-green-800"
                                        : "border-slate-100 dark:border-slate-800"
                                }`}
                            >
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                            quiz.published
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700"
                                        }`}
                                    >
                                        {quiz.published ? "PUBLISHED" : "DRAFT"}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {quiz.questions.length} question
                                        {quiz.questions.length !== 1 ? "s" : ""}
                                    </span>
                                    {quiz.durationMinutes > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Clock size={11} />{" "}
                                            {quiz.durationMinutes} min
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <p className="font-bold">{quiz.title}</p>
                                    {quiz.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                            {quiz.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                                    <button
                                        onClick={() =>
                                            togglePublish(
                                                quiz.$id,
                                                quiz.published
                                            )
                                        }
                                        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                                            quiz.published
                                                ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100"
                                                : "text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100"
                                        }`}
                                    >
                                        {quiz.published ? (
                                            <EyeOff size={13} />
                                        ) : (
                                            <Eye size={13} />
                                        )}
                                        {quiz.published
                                            ? "Unpublish"
                                            : "Publish"}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setResultsQuizId(quiz.$id);
                                            setView("results");
                                        }}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 transition-colors"
                                    >
                                        <Users size={13} /> Results
                                    </button>

                                    <button
                                        onClick={() => openEdit(quiz)}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                                    >
                                        <Pencil size={13} /> Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(quiz.$id)}
                                        disabled={deletingId === quiz.$id}
                                        className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 transition-colors disabled:opacity-50"
                                    >
                                        {deletingId === quiz.$id ? (
                                            <Loader2
                                                size={13}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={13} />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

// ── Quiz Form ────────────────────────────────────

function QuizForm({
    form,
    setForm,
    editingQuiz,
    saving,
    formError,
    onSubmit,
    onCancel,
    onAddQuestion,
    onRemoveQuestion,
    onUpdateQuestion,
    onUpdateOption,
    onSetAnswer
}) {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">
                        {editingQuiz ? "Edit Quiz" : "Create Quiz"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {form.questions.length} question
                        {form.questions.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-6">
                {/* Quiz meta */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Quiz title (e.g. CSC 301 — Week 5 Quiz)"
                        value={form.title}
                        onChange={e =>
                            setForm(p => ({ ...p, title: e.target.value }))
                        }
                        required
                        className="input-field font-semibold"
                    />
                    <textarea
                        placeholder="Description or instructions (optional)"
                        value={form.description}
                        onChange={e =>
                            setForm(p => ({
                                ...p,
                                description: e.target.value
                            }))
                        }
                        rows={2}
                        className="input-field resize-none"
                    />
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            Time limit (min)
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={180}
                            value={form.durationMinutes}
                            onChange={e =>
                                setForm(p => ({
                                    ...p,
                                    durationMinutes: e.target.value
                                }))
                            }
                            className="input-field w-24 text-center"
                        />
                        <span className="text-xs text-slate-400">
                            0 = no limit
                        </span>
                    </div>
                </div>

                {/* Questions */}
                <div className="flex flex-col gap-4">
                    {form.questions.map((q, qi) => (
                        <div
                            key={qi}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4"
                        >
                            <div className="flex items-start gap-3">
                                <span className="w-7 h-7 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                                    {qi + 1}
                                </span>
                                <textarea
                                    placeholder={`Question ${qi + 1}`}
                                    value={q.question}
                                    onChange={e =>
                                        onUpdateQuestion(
                                            qi,
                                            "question",
                                            e.target.value
                                        )
                                    }
                                    required
                                    rows={2}
                                    className="input-field flex-1 resize-none"
                                />
                                {form.questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveQuestion(qi)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shrink-0 mt-0.5"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 pl-10">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                                    Options — tap circle to mark correct answer
                                </p>
                                {q.options.map((opt, oi) => (
                                    <div
                                        key={oi}
                                        className="flex items-center gap-3"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => onSetAnswer(qi, oi)}
                                            className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                                                q.answer === oi
                                                    ? "bg-green-500 border-green-500"
                                                    : "border-slate-300 dark:border-slate-600 hover:border-green-400"
                                            }`}
                                        >
                                            {q.answer === oi && (
                                                <Check
                                                    size={12}
                                                    className="text-white"
                                                />
                                            )}
                                        </button>
                                        <input
                                            type="text"
                                            placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                            value={opt}
                                            onChange={e =>
                                                onUpdateOption(
                                                    qi,
                                                    oi,
                                                    e.target.value
                                                )
                                            }
                                            required
                                            className={`input-field flex-1 ${
                                                q.answer === oi
                                                    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onAddQuestion}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors font-semibold text-sm"
                >
                    <Plus size={18} /> Add Question
                </button>

                {formError && (
                    <div className="flex items-center gap-2 text-red-500 text-sm px-1">
                        <AlertCircle size={15} /> {formError}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        Cancel
                    </button>
                    <Button type="submit" disabled={saving} className="flex-1">
                        {saving ? (
                            <Loader2 size={16} className="animate-spin mr-2" />
                        ) : (
                            <Send size={16} className="mr-2" />
                        )}
                        {saving
                            ? "Saving..."
                            : editingQuiz
                              ? "Save Changes"
                              : "Save Quiz"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

// ── Results / Leaderboard ────────────────────────

function ResultsView({ quiz, onBack }) {
    const { attempts, loading } = useQuizResults(quiz?.$id);

    if (!quiz) return null;

    const avg =
        attempts.length > 0
            ? Math.round(
                  attempts.reduce(
                      (s, a) => s + (a.score / a.totalQuestions) * 100,
                      0
                  ) / attempts.length
              )
            : 0;

    const medalColor = i =>
        i === 0
            ? "text-amber-500"
            : i === 1
              ? "text-slate-400"
              : i === 2
                ? "text-amber-700"
                : "text-slate-300 dark:text-slate-600";

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <X size={18} />
                </button>
                <div>
                    <h2 className="text-xl font-extrabold">Results</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {quiz.title}
                    </p>
                </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    {
                        label: "Attempts",
                        value: attempts.length,
                        icon: Users,
                        color: "text-indigo-500",
                        bg: "bg-indigo-50 dark:bg-indigo-900/20"
                    },
                    {
                        label: "Avg Score",
                        value: `${avg}%`,
                        icon: Trophy,
                        color: "text-amber-500",
                        bg: "bg-amber-50 dark:bg-amber-900/20"
                    },
                    {
                        label: "Questions",
                        value: quiz.questions.length,
                        icon: ClipboardList,
                        color: "text-cyan-500",
                        bg: "bg-cyan-50 dark:bg-cyan-900/20"
                    }
                ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-2"
                    >
                        <div
                            className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}
                        >
                            <Icon size={18} className={color} />
                        </div>
                        <p className="text-2xl font-extrabold">{value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {label}
                        </p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 animate-pulse h-16"
                        />
                    ))}
                </div>
            ) : attempts.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 text-center">
                    <p className="text-slate-400 font-semibold">
                        No submissions yet
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        Students haven't taken this quiz yet.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                        Leaderboard
                    </p>
                    {attempts.map((a, i) => {
                        const pct = Math.round(
                            (a.score / a.totalQuestions) * 100
                        );
                        return (
                            <div
                                key={a.$id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4"
                            >
                                {/* Rank */}
                                <span
                                    className={`text-sm font-extrabold w-6 text-center shrink-0 ${medalColor(i)}`}
                                >
                                    {i + 1}
                                </span>

                                {/* Avatar + name */}
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center shrink-0">
                                    <span className="text-white font-bold text-sm">
                                        {a.studentName?.[0]?.toUpperCase() ??
                                            "?"}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">
                                        {a.studentName}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {a.studentEmail}
                                    </p>
                                    {/* Score bar */}
                                    <div className="mt-1.5 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${
                                                pct >= 70
                                                    ? "bg-green-500"
                                                    : pct >= 40
                                                      ? "bg-amber-500"
                                                      : "bg-red-400"
                                            }`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Score */}
                                <span className="font-bold text-sm shrink-0">
                                    {a.score}/{a.totalQuestions}{" "}
                                    <span className="text-xs text-slate-400">
                                        ({pct}%)
                                    </span>
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
