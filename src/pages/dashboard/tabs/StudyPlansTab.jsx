import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lightbulb,
    Plus,
    Trash2,
    Check,
    Circle,
    ChevronDown,
    ChevronUp,
    Pencil,
    X,
    RefreshCw,
    AlertCircle,
    Loader2,
    Calendar,
    Users,
    Lock
} from "lucide-react";
import { useStudyPlans } from "../../../hooks/useStudyPlans";
import Button from "../../../components/ui/Button";

export default function StudyPlansTab({ department, user, profile }) {
    const {
        myPlans,
        sharedPlans,
        loading,
        error,
        canShare,
        create,
        refresh,
        myPlanActions,
        sharedPlanActions
    } = useStudyPlans(department?.$id, user?.$id, profile?.role, user?.name);

    const [creating, setCreating] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState("");
    const [newPlanScope, setNewPlanScope] = useState("personal");
    const [saving, setSaving] = useState(false);

    const handleCreate = async e => {
        e.preventDefault();
        if (!newPlanTitle.trim()) return;
        setSaving(true);
        try {
            await create({ title: newPlanTitle.trim(), scope: newPlanScope });
            setNewPlanTitle("");
            setNewPlanScope("personal");
            setCreating(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Study Plans</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Personal goals and shared class plans
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button size="sm" onClick={() => setCreating(v => !v)}>
                        <Plus size={16} className="mr-1" /> New Plan
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

            {/* New plan form */}
            <AnimatePresence>
                {creating && (
                    <motion.form
                        key="new-plan"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleCreate}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-primary-200 dark:border-primary-800 p-5 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-bold text-sm text-primary-900 dark:text-primary-200">
                                New Study Plan
                            </p>
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Plan title (e.g. MTH 201 — Week 3 Goals)"
                            value={newPlanTitle}
                            onChange={e => setNewPlanTitle(e.target.value)}
                            required
                            autoFocus
                            className="input-field"
                        />

                        {canShare && (
                            <div className="flex gap-2">
                                {["personal", "shared"].map(scope => (
                                    <button
                                        key={scope}
                                        type="button"
                                        onClick={() => setNewPlanScope(scope)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                            newPlanScope === scope
                                                ? scope === "shared"
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                    : "border-primary-700 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                                                : "border-slate-200 dark:border-slate-700 text-slate-500"
                                        }`}
                                    >
                                        {scope === "personal" ? (
                                            <>
                                                <Lock size={14} /> Personal
                                            </>
                                        ) : (
                                            <>
                                                <Users size={14} /> Shared with
                                                class
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setCreating(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={saving || !newPlanTitle.trim()}
                            >
                                {saving && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin mr-1"
                                    />
                                )}
                                {saving ? "Creating..." : "Create Plan"}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse h-24"
                        />
                    ))}
                </div>
            ) : myPlans.length === 0 && sharedPlans.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center">
                        <Lightbulb size={24} className="text-rose-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No study plans yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Create a personal plan to track your study goals, or
                        share one with your class.
                    </p>
                    <button
                        onClick={() => setCreating(true)}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                    >
                        Create your first plan →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Shared plans */}
                    {sharedPlans.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                Shared with class
                            </p>
                            {sharedPlans.map(plan => (
                                <PlanCard
                                    key={plan.$id}
                                    plan={plan}
                                    actions={sharedPlanActions}
                                    canEdit={
                                        canShare || plan.ownerId === user?.$id
                                    }
                                    isShared
                                />
                            ))}
                        </div>
                    )}

                    {/* My personal plans */}
                    {myPlans.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                My plans
                            </p>
                            {myPlans.map(plan => (
                                <PlanCard
                                    key={plan.$id}
                                    plan={plan}
                                    actions={myPlanActions}
                                    canEdit
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Plan Card ─────────────────────────────────────

function PlanCard({ plan, actions, canEdit, isShared }) {
    const [expanded, setExpanded] = useState(true);
    const [addingItem, setAddingItem] = useState(false);
    const [newItemText, setNewItemText] = useState("");
    const [newItemDue, setNewItemDue] = useState("");
    const [renaming, setRenaming] = useState(false);
    const [renameVal, setRenameVal] = useState(plan.title);
    const [deleting, setDeleting] = useState(false);

    const done = plan.items.filter(i => i.done).length;
    const total = plan.items.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    const handleAddItem = async e => {
        e.preventDefault();
        if (!newItemText.trim()) return;
        await actions.addItem(plan.$id, newItemText.trim(), newItemDue || null);
        setNewItemText("");
        setNewItemDue("");
        setAddingItem(false);
    };

    const handleRename = async e => {
        e.preventDefault();
        if (!renameVal.trim() || renameVal === plan.title) {
            setRenaming(false);
            return;
        }
        await actions.rename(plan.$id, renameVal.trim());
        setRenaming(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await actions.remove(plan.$id);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Card header */}
            <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isShared
                                ? "bg-emerald-50 dark:bg-emerald-900/20"
                                : "bg-rose-50 dark:bg-rose-900/20"
                        }`}
                    >
                        {isShared ? (
                            <Users size={16} className="text-emerald-500" />
                        ) : (
                            <Lock size={16} className="text-rose-500" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {renaming ? (
                            <form
                                onSubmit={handleRename}
                                className="flex gap-2"
                            >
                                <input
                                    value={renameVal}
                                    onChange={e => setRenameVal(e.target.value)}
                                    autoFocus
                                    className="input-field py-1 text-sm flex-1"
                                />
                                <button
                                    type="submit"
                                    className="p-1.5 rounded-lg text-primary-700 hover:bg-primary-50 transition-colors"
                                >
                                    <Check size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRenaming(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={15} />
                                </button>
                            </form>
                        ) : (
                            <p className="font-bold text-sm">{plan.title}</p>
                        )}
                        {isShared && (
                            <p className="text-xs text-slate-400 mt-0.5">
                                by {plan.ownerName || "Class Rep"}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {canEdit && !renaming && (
                            <button
                                onClick={() => setRenaming(true)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                <Pencil size={13} />
                            </button>
                        )}
                        {canEdit && (
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                            >
                                {deleting ? (
                                    <Loader2
                                        size={13}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Trash2 size={13} />
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            {expanded ? (
                                <ChevronUp size={15} />
                            ) : (
                                <ChevronDown size={15} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                {total > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${
                                    pct === 100
                                        ? "bg-emerald-500"
                                        : "bg-primary-700"
                                }`}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                        <span className="text-xs text-slate-400 font-medium shrink-0">
                            {done}/{total}
                        </span>
                    </div>
                )}
            </div>

            {/* Items list */}
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                    >
                        <div className="px-4 py-3 flex flex-col gap-2">
                            {plan.items.length === 0 && !addingItem && (
                                <p className="text-xs text-slate-400 py-1">
                                    No tasks yet. Add one below.
                                </p>
                            )}

                            {plan.items.map(item => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 group"
                                >
                                    <button
                                        onClick={() =>
                                            actions.toggleItem(
                                                plan.$id,
                                                item.id
                                            )
                                        }
                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                            item.done
                                                ? "bg-emerald-500 border-emerald-500"
                                                : "border-slate-300 dark:border-slate-600 hover:border-primary-500"
                                        }`}
                                    >
                                        {item.done && (
                                            <Check
                                                size={11}
                                                className="text-white"
                                            />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm ${item.done ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}
                                        >
                                            {item.text}
                                        </p>
                                        {item.dueDate && (
                                            <p
                                                className={`text-xs mt-0.5 flex items-center gap-1 ${
                                                    !item.done &&
                                                    new Date(item.dueDate) <
                                                        new Date()
                                                        ? "text-red-500"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                <Calendar size={10} />
                                                {new Date(
                                                    item.dueDate + "T00:00:00"
                                                ).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        )}
                                    </div>

                                    {canEdit && (
                                        <button
                                            onClick={() =>
                                                actions.removeItem(
                                                    plan.$id,
                                                    item.id
                                                )
                                            }
                                            className="p-1 rounded-lg text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {/* Add item form */}
                            {addingItem ? (
                                <form
                                    onSubmit={handleAddItem}
                                    className="flex flex-col gap-2 mt-1"
                                >
                                    <input
                                        type="text"
                                        placeholder="Task description..."
                                        value={newItemText}
                                        onChange={e =>
                                            setNewItemText(e.target.value)
                                        }
                                        autoFocus
                                        required
                                        className="input-field py-2 text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            value={newItemDue}
                                            onChange={e =>
                                                setNewItemDue(e.target.value)
                                            }
                                            className="input-field py-2 text-sm flex-1"
                                            min={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 rounded-xl bg-primary-700 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
                                        >
                                            Add
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAddingItem(false);
                                                setNewItemText("");
                                                setNewItemDue("");
                                            }}
                                            className="px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : canEdit ? (
                                <button
                                    onClick={() => setAddingItem(true)}
                                    className="flex items-center gap-2 text-xs text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 py-1 transition-colors mt-1"
                                >
                                    <Plus size={13} /> Add task
                                </button>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
