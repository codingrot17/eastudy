import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Plus,
    Calendar,
    Clock,
    MapPin,
    X,
    Loader2,
    RefreshCw,
    AlertCircle,
    UserPlus,
    UserMinus,
    Trash2,
    Ban,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useGroupStudy } from "../../../hooks/useGroupStudy";
import Button from "../../../components/ui/Button";

const emptyForm = {
    title: "",
    location: "",
    date: "",
    time: "",
    maxSlots: ""
};

export default function GroupStudyTab({ department, user }) {
    const {
        sessions,
        loading,
        error,
        create,
        join,
        leave,
        cancel,
        remove,
        refresh
    } = useGroupStudy(department?.$id);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [actionId, setActionId] = useState(null); // tracks which card is mid-action
    const [expandedId, setExpandedId] = useState(null);

    const upcomingSessions = sessions.filter(s => {
        if (s.status === "cancelled") return false;
        const sessionDate = new Date(s.date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sessionDate >= today;
    });

    const pastOrCancelled = sessions.filter(s => {
        if (s.status === "cancelled") return true;
        const sessionDate = new Date(s.date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return sessionDate < today;
    });

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleCreate = async e => {
        e.preventDefault();
        setFormError("");
        if (!form.date || !form.time) {
            setFormError("Date and time are required.");
            return;
        }
        setSaving(true);
        try {
            await create({
                createdBy: user?.$id,
                creatorName: user?.name,
                title: form.title.trim(),
                location: form.location.trim(),
                date: form.date,
                time: form.time,
                maxSlots: parseInt(form.maxSlots) || 0
            });
            setForm(emptyForm);
            setShowForm(false);
        } catch {
            setFormError("Failed to create session. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleJoin = async s => {
        setActionId(s.$id);
        try {
            await join(s.$id, s.attendees, user);
        } finally {
            setActionId(null);
        }
    };

    const handleLeave = async s => {
        setActionId(s.$id);
        try {
            await leave(s.$id, s.attendees, user?.$id);
        } finally {
            setActionId(null);
        }
    };

    const handleCancel = async id => {
        setActionId(id);
        try {
            await cancel(id);
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async id => {
        setActionId(id);
        try {
            await remove(id);
        } finally {
            setActionId(null);
        }
    };

    const isJoined = s => s.attendees.some(a => a.authId === user?.$id);
    const isFull = s => s.maxSlots > 0 && s.attendees.length >= s.maxSlots;
    const isOwner = s => s.createdBy === user?.$id;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Group Study</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {upcomingSessions.length} upcoming session
                        {upcomingSessions.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button size="sm" onClick={() => setShowForm(v => !v)}>
                        <Plus size={16} className="mr-1" />
                        New Session
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Create form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handleCreate}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-primary-200 dark:border-primary-800 p-5 flex flex-col gap-4"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <p className="font-bold text-sm text-primary-900 dark:text-primary-200">
                                New Study Session
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormError("");
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <input
                            name="title"
                            type="text"
                            placeholder="What are you studying? (e.g. MTH 201 exam prep)"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                        <input
                            name="location"
                            type="text"
                            placeholder="Where? (e.g. Faculty library, room 3 — or a link)"
                            value={form.location}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Date
                                </label>
                                <input
                                    name="date"
                                    type="date"
                                    value={form.date}
                                    onChange={handleChange}
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    className="input-field"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Time
                                </label>
                                <input
                                    name="time"
                                    type="time"
                                    value={form.time}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Max participants (0 = unlimited)
                            </label>
                            <input
                                name="maxSlots"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={form.maxSlots}
                                onChange={handleChange}
                                className="input-field w-32"
                            />
                        </div>

                        {formError && (
                            <p className="text-red-500 text-sm flex items-center gap-2">
                                <AlertCircle size={14} /> {formError}
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setFormError("");
                                }}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <Button type="submit" size="sm" disabled={saving}>
                                {saving && (
                                    <Loader2
                                        size={14}
                                        className="animate-spin mr-1"
                                    />
                                )}
                                {saving ? "Creating..." : "Create Session"}
                            </Button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Loading skeletons */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse h-28"
                        />
                    ))}
                </div>
            ) : upcomingSessions.length === 0 &&
              pastOrCancelled.length === 0 ? (
                // Empty state
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Users size={24} className="text-emerald-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No study sessions yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Create a session and your classmates will be able to
                        join in real-time.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                    >
                        Create the first session →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Upcoming sessions */}
                    {upcomingSessions.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                Upcoming
                            </p>
                            <AnimatePresence initial={false}>
                                {upcomingSessions.map(s => (
                                    <SessionCard
                                        key={s.$id}
                                        session={s}
                                        isJoined={isJoined(s)}
                                        isFull={isFull(s)}
                                        isOwner={isOwner(s)}
                                        isLoading={actionId === s.$id}
                                        expanded={expandedId === s.$id}
                                        onToggleExpand={() =>
                                            setExpandedId(p =>
                                                p === s.$id ? null : s.$id
                                            )
                                        }
                                        onJoin={() => handleJoin(s)}
                                        onLeave={() => handleLeave(s)}
                                        onCancel={() => handleCancel(s.$id)}
                                        onDelete={() => handleDelete(s.$id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Past / cancelled */}
                    {pastOrCancelled.length > 0 && (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                                Past &amp; Cancelled
                            </p>
                            {pastOrCancelled.map(s => (
                                <SessionCard
                                    key={s.$id}
                                    session={s}
                                    isJoined={isJoined(s)}
                                    isFull={isFull(s)}
                                    isOwner={isOwner(s)}
                                    isLoading={actionId === s.$id}
                                    expanded={expandedId === s.$id}
                                    onToggleExpand={() =>
                                        setExpandedId(p =>
                                            p === s.$id ? null : s.$id
                                        )
                                    }
                                    onJoin={() => handleJoin(s)}
                                    onLeave={() => handleLeave(s)}
                                    onCancel={() => handleCancel(s.$id)}
                                    onDelete={() => handleDelete(s.$id)}
                                    muted
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Session Card ─────────────────────────────────

function SessionCard({
    session: s,
    isJoined,
    isFull,
    isOwner,
    isLoading,
    expanded,
    onToggleExpand,
    onJoin,
    onLeave,
    onCancel,
    onDelete,
    muted = false
}) {
    const isCancelled = s.status === "cancelled";
    const attendeeCount = s.attendees.length;
    const isToday = s.date === new Date().toISOString().split("T")[0];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all ${
                isCancelled
                    ? "border-slate-100 dark:border-slate-800 opacity-60"
                    : isJoined
                      ? "border-emerald-200 dark:border-emerald-800"
                      : "border-slate-100 dark:border-slate-800"
            }`}
        >
            {/* Main row */}
            <div className="p-5 flex flex-col gap-3">
                {/* Title row */}
                <div className="flex items-start gap-3">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isCancelled
                                ? "bg-slate-100 dark:bg-slate-800"
                                : "bg-emerald-50 dark:bg-emerald-900/20"
                        }`}
                    >
                        <Users
                            size={18}
                            className={
                                isCancelled
                                    ? "text-slate-400"
                                    : "text-emerald-500"
                            }
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm truncate">
                                {s.title}
                            </p>
                            {isCancelled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-800">
                                    CANCELLED
                                </span>
                            )}
                            {isToday && !isCancelled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                                    TODAY
                                </span>
                            )}
                            {isJoined && !isCancelled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    JOINED
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            by {s.creatorName}
                        </p>
                    </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar size={12} />
                        {formatDate(s.date)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={12} />
                        {formatTime(s.time)}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={12} />
                        <span className="truncate max-w-[160px]">
                            {s.location}
                        </span>
                    </span>
                </div>

                {/* Attendees + actions row */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {/* Attendee count + toggle */}
                    <button
                        onClick={onToggleExpand}
                        className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        <div className="flex -space-x-1.5">
                            {s.attendees.slice(0, 3).map((a, i) => (
                                <div
                                    key={i}
                                    className="w-5 h-5 rounded-full bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center border border-white dark:border-slate-900 text-white text-[8px] font-bold"
                                >
                                    {a.name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            ))}
                            {attendeeCount === 0 && (
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 border border-white dark:border-slate-900" />
                            )}
                        </div>
                        <span>
                            {attendeeCount === 0
                                ? "No one joined yet"
                                : `${attendeeCount}${s.maxSlots > 0 ? `/${s.maxSlots}` : ""} joined`}
                        </span>
                        {attendeeCount > 0 &&
                            (expanded ? (
                                <ChevronUp size={12} />
                            ) : (
                                <ChevronDown size={12} />
                            ))}
                    </button>

                    {/* Action buttons */}
                    {!isCancelled && (
                        <div className="flex items-center gap-1.5">
                            {isOwner ? (
                                <>
                                    <button
                                        onClick={onCancel}
                                        disabled={isLoading}
                                        title="Cancel session"
                                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl text-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2
                                                size={12}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Ban size={12} />
                                        )}
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        disabled={isLoading}
                                        title="Delete session"
                                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            ) : isJoined ? (
                                <button
                                    onClick={onLeave}
                                    disabled={isLoading}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2
                                            size={12}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <UserMinus size={12} />
                                    )}
                                    Leave
                                </button>
                            ) : (
                                <button
                                    onClick={onJoin}
                                    disabled={isLoading || isFull}
                                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-white bg-emerald-500 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <Loader2
                                            size={12}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <UserPlus size={12} />
                                    )}
                                    {isFull ? "Full" : "Join"}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Owner can delete cancelled sessions */}
                    {isCancelled && isOwner && (
                        <button
                            onClick={onDelete}
                            disabled={isLoading}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded attendees list */}
            <AnimatePresence initial={false}>
                {expanded && attendeeCount > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                    >
                        <div className="px-5 py-3 flex flex-col gap-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                Attendees
                            </p>
                            {s.attendees.map((a, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center shrink-0">
                                        <span className="text-white text-xs font-bold">
                                            {a.name?.[0]?.toUpperCase() ?? "?"}
                                        </span>
                                    </div>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        {a.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Helpers ──────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);

    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff === -1) return "Yesterday";

    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
    });
}

function formatTime(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}
