import { useState, useRef, useEffect } from "react";
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
    ChevronUp,
    MessageCircle,
    Send,
    ArrowLeft,
    Image,
    FileText,
    Download,
    File
} from "lucide-react";
import { useGroupStudy } from "../../../hooks/useGroupStudy";
import { useSessionChat } from "../../../hooks/useSessionChat";
import FileUploadButton, {
    FileAttachmentChip
} from "../../../components/ui/FileUploadButton";
import {
    getFileViewUrl,
    getFileDownloadUrl,
    getFileType
} from "../../../appwrite/storage";
import { deleteFile } from "../../../appwrite/storage";
import Button from "../../../components/ui/Button";

const emptyForm = {
    title: "",
    location: "",
    date: "",
    time: "",
    maxSlots: "",
    isPrivate: false,
    password: ""
};
// ── Main Tab ─────────────────────────────────────

export default function GroupStudyTab({ department, user, profile }) {
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
    const [actionId, setActionId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [passwordPrompt, setPasswordPrompt] = useState(null); // { session } | null
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");
    // ── Chat room state ──────────────────────────
    // null = list view, string = session $id open in chat
    const [chatSessionId, setChatSessionId] = useState(null);
    const chatSession = sessions.find(s => s.$id === chatSessionId) ?? null;

    const upcomingSessions = sessions.filter(s => {
        if (s.status === "cancelled") return false;
        const d = new Date(s.date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
    });
    const pastOrCancelled = sessions.filter(s => {
        if (s.status === "cancelled") return true;
        const d = new Date(s.date + "T00:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d < today;
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
        if (form.isPrivate && !form.password.trim()) {
            setFormError("Please set a password for private sessions.");
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
                maxSlots: parseInt(form.maxSlots) || 0,
                isPrivate: form.isPrivate,
                password: form.isPrivate ? form.password.trim() : null
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
        if (s.isPrivate) {
            setPasswordPrompt(s);
            setPasswordInput("");
            setPasswordError("");
            return;
        }
        setActionId(s.$id);
        try {
            await join(s.$id, s.attendees, user);
        } finally {
            setActionId(null);
        }
    };

    const handlePasswordJoin = async () => {
        if (!passwordPrompt) return;
        if (
            passwordInput.trim().toLowerCase() !==
            passwordPrompt.password?.toLowerCase()
        ) {
            setPasswordError("Incorrect password. Try again.");
            return;
        }
        const s = passwordPrompt;
        setPasswordPrompt(null);
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

    // ── Chat room view ───────────────────────────
    if (chatSession) {
        return (
            <ChatRoom
                session={chatSession}
                user={user}
                profile={profile}
                departmentId={department?.$id}
                onBack={() => setChatSessionId(null)}
            />
        );
    }

    // ── Session list view ────────────────────────
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
                        <Plus size={16} className="mr-1" /> New Session
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
                            placeholder="Where? (e.g. Faculty library, room 3)"
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
                        {/* Privacy toggle */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                Session access
                            </label>
                            <div className="flex gap-2">
                                {[
                                    {
                                        val: false,
                                        label: "Public",
                                        icon: "🌐",
                                        desc: "Anyone in your class can join"
                                    },
                                    {
                                        val: true,
                                        label: "Private",
                                        icon: "🔒",
                                        desc: "Password required to join"
                                    }
                                ].map(opt => (
                                    <button
                                        key={String(opt.val)}
                                        type="button"
                                        onClick={() =>
                                            setForm(p => ({
                                                ...p,
                                                isPrivate: opt.val,
                                                password: ""
                                            }))
                                        }
                                        className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                                            form.isPrivate === opt.val
                                                ? "border-primary-700 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                                                : "border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        }`}
                                    >
                                        <span className="text-base">
                                            {opt.icon}
                                        </span>
                                        {opt.label}
                                        <span className="text-[10px] font-normal text-slate-400 text-center leading-tight">
                                            {opt.desc}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Password field — shown only for private */}
                        {form.isPrivate && (
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Session password
                                </label>
                                <input
                                    name="password"
                                    type="text"
                                    placeholder="e.g. csc301 or any short code"
                                    value={form.password}
                                    onChange={handleChange}
                                    required={form.isPrivate}
                                    maxLength={20}
                                    className="input-field"
                                />
                                <p className="text-xs text-slate-400 px-1">
                                    Share this with students you want to invite
                                </p>
                            </div>
                        )}
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

            {/* Loading */}
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
                                        onOpenChat={() =>
                                            setChatSessionId(s.$id)
                                        }
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
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
                                    onOpenChat={() => setChatSessionId(s.$id)}
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
    onOpenChat,
    muted
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
            <div className="p-5 flex flex-col gap-3">
                {/* Title row */}
                <div className="flex items-start gap-3">
                    <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCancelled ? "bg-slate-100 dark:bg-slate-800" : "bg-emerald-50 dark:bg-emerald-900/20"}`}
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
                            {s.isPrivate && !isCancelled && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                    🔒 Private
                                </span>
                            )}
                            {isOwner && s.isPrivate && s.password && (
                                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    <span>Password:</span>
                                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-lg">
                                        {s.password}
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            by {s.creatorName}
                        </p>
                    </div>
                </div>

                {/* Meta */}
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

                {/* Attendees + actions */}
                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-y-2">
                    {/* Attendee count */}
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
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Chat button — always visible for non-cancelled sessions */}
                        {!isCancelled && (
                            <button
                                onClick={onOpenChat}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                            >
                                <MessageCircle size={13} />
                                Chat
                            </button>
                        )}

                        {!isCancelled &&
                            (isOwner ? (
                                <>
                                    <button
                                        onClick={onCancel}
                                        disabled={isLoading}
                                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl text-orange-600 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <Loader2
                                                size={12}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Ban size={12} />
                                        )}{" "}
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onDelete}
                                        disabled={isLoading}
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
                                    )}{" "}
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
                            ))}

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
            </div>

            {/* Expanded attendees */}
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

// ── Chat Room ─────────────────────────────────────

function ChatRoom({ session, user, profile, departmentId, onBack }) {
    const { messages, loading, sending, send, remove } = useSessionChat(
        session.$id,
        departmentId
    );

    const [text, setText] = useState("");
    const [attachedFile, setAttachedFile] = useState(null);
    const [sendError, setSendError] = useState("");
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const handleSend = async e => {
        e.preventDefault();
        if (!text.trim() && !attachedFile) return;
        setSendError("");

        try {
            await send({
                authorId: user?.$id,
                authorName: user?.name,
                authorRole: profile?.role ?? "student",
                content: text.trim() || null,
                fileId: attachedFile?.$id ?? null,
                mimeType: attachedFile?.mimeType ?? null,
                fileName: attachedFile?.name ?? attachedFile?.fileName ?? null,
                sourceType: attachedFile ? "file" : "none"
            });
            setText("");
            setAttachedFile(null);
            inputRef.current?.focus();
        } catch (err) {
            setSendError("Failed to send. Try again.");
        }
    };

    const handleRemoveMsg = async msg => {
        if (msg.fileId) deleteFile(msg.fileId).catch(() => {});
        await remove(msg.$id);
    };

    const canDelete = msg =>
        msg.authorId === user?.$id ||
        profile?.role === "rep" ||
        profile?.role === "assistant";

    const isToday = session.date === new Date().toISOString().split("T")[0];

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)]">
            {/* Chat header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <button
                    onClick={onBack}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                    <Users size={18} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                        {session.title}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar size={10} />
                            {formatDate(session.date)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={10} />
                            {formatTime(session.time)}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Users size={10} />
                            {session.attendees.length} joined
                        </span>
                    </div>
                </div>
                {isToday && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
                        LIVE
                    </span>
                )}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3 min-h-0">
                {loading ? (
                    <div className="flex flex-col gap-3 px-1">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`flex gap-2 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
                                <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse w-48" />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6 py-12">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                            <MessageCircle
                                size={24}
                                className="text-emerald-500"
                            />
                        </div>
                        <p className="font-semibold text-slate-500 dark:text-slate-400">
                            No messages yet
                        </p>
                        <p className="text-sm text-slate-400 max-w-xs">
                            Be the first to say something! Share notes, links,
                            or just coordinate.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, idx) => {
                            const isMe = msg.authorId === user?.$id;
                            const showAvatar =
                                idx === 0 ||
                                messages[idx - 1]?.authorId !== msg.authorId;
                            const isOptimistic = msg._optimistic;

                            return (
                                <ChatMessage
                                    key={msg.$id}
                                    msg={msg}
                                    isMe={isMe}
                                    showAvatar={showAvatar}
                                    isOptimistic={isOptimistic}
                                    canDelete={canDelete(msg)}
                                    onDelete={() => handleRemoveMsg(msg)}
                                />
                            );
                        })}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* Attached file preview */}
            {attachedFile && (
                <div className="px-1 pb-2 shrink-0">
                    <FileAttachmentChip
                        file={attachedFile}
                        onRemove={() => setAttachedFile(null)}
                    />
                </div>
            )}

            {sendError && (
                <p className="text-xs text-red-500 px-1 pb-1 shrink-0">
                    {sendError}
                </p>
            )}

            {/* Input bar */}
            <form
                onSubmit={handleSend}
                className="flex items-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0"
            >
                {/* File attach button */}
                <FileUploadButton
                    onUpload={f => {
                        setAttachedFile(f);
                        setSendError("");
                    }}
                    disabled={sending || !!attachedFile}
                    size="sm"
                />

                <div className="flex-1 relative">
                    <textarea
                        ref={inputRef}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => {
                            // Cmd/Ctrl+Enter or just Enter on desktop sends
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                        placeholder="Type a message… (Enter to send)"
                        rows={1}
                        maxLength={1000}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none text-sm leading-relaxed"
                        style={{ maxHeight: "120px", overflowY: "auto" }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={sending || (!text.trim() && !attachedFile)}
                    className="w-10 h-10 rounded-2xl bg-primary-700 hover:bg-primary-600 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0 self-end"
                >
                    {sending ? (
                        <Loader2
                            size={16}
                            className="animate-spin text-white"
                        />
                    ) : (
                        <Send size={16} className="text-white" />
                    )}
                </button>
            </form>
        </div>
    );
}

// ── Chat Message ──────────────────────────────────

function ChatMessage({
    msg,
    isMe,
    showAvatar,
    isOptimistic,
    canDelete,
    onDelete
}) {
    const [showDelete, setShowDelete] = useState(false);

    const hasFile = msg.sourceType === "file" && Boolean(msg.fileId);
    const fileType = hasFile ? getFileType(msg.mimeType ?? "") : null;
    const viewUrl = hasFile ? getFileViewUrl(msg.fileId) : null;
    const downloadUrl = hasFile ? getFileDownloadUrl(msg.fileId) : null;

    return (
        <div
            className={`flex gap-2 items-end group ${isMe ? "flex-row-reverse" : ""}`}
            onTouchStart={() => canDelete && setShowDelete(v => !v)}
        >
            {/* Avatar */}
            <div
                className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center ${showAvatar ? "opacity-100" : "opacity-0"} bg-gradient-to-br from-primary-700 to-cyan-500`}
            >
                <span className="text-white text-[10px] font-bold">
                    {msg.authorName?.[0]?.toUpperCase() ?? "?"}
                </span>
            </div>

            <div
                className={`flex flex-col gap-1 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
            >
                {/* Author name — only on first msg in group */}
                {showAvatar && !isMe && (
                    <div className="flex items-center gap-1.5 px-1">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            {msg.authorName}
                        </span>
                        {msg.authorRole !== "student" && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 capitalize">
                                {msg.authorRole}
                            </span>
                        )}
                    </div>
                )}

                {/* Bubble */}
                <div
                    className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isMe
                            ? "bg-primary-700 text-white rounded-br-sm"
                            : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                    } ${isOptimistic ? "opacity-60" : ""}`}
                >
                    {/* Text content */}
                    {msg.content && (
                        <p className="whitespace-pre-wrap break-words">
                            {msg.content}
                        </p>
                    )}

                    {/* File attachment inline */}
                    {hasFile && fileType === "image" && (
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block mt-2"
                        >
                            <img
                                src={viewUrl}
                                alt={msg.fileName || "Image"}
                                className="max-w-full rounded-xl max-h-48 object-cover"
                                loading="lazy"
                            />
                        </a>
                    )}
                    {hasFile && fileType === "pdf" && (
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                isMe
                                    ? "bg-white/20 hover:bg-white/30 text-white"
                                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800"
                            }`}
                        >
                            <FileText size={14} />
                            {msg.fileName || "PDF Document"}
                            <Download size={12} className="ml-auto" />
                        </a>
                    )}
                    {hasFile &&
                        (fileType === "doc" || fileType === "other") && (
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                    isMe
                                        ? "bg-white/20 hover:bg-white/30 text-white"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                }`}
                            >
                                <File size={14} />
                                {msg.fileName || "Attachment"}
                                <Download size={12} className="ml-auto" />
                            </a>
                        )}

                    {/* Timestamp */}
                    <p
                        className={`text-[10px] mt-1 ${isMe ? "text-white/60 text-right" : "text-slate-400"}`}
                    >
                        {formatMsgTime(msg.$createdAt)}
                    </p>
                </div>
            </div>

            {/* Delete button — visible on hover (desktop) or tap (mobile) */}
            {canDelete && (
                <button
                    onClick={onDelete}
                    className={`p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shrink-0 self-center
                        ${showDelete ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
                    `}
                >
                    <X size={13} />
                </button>
            )}

            {/* Password prompt modal */}
            <AnimatePresence>
                {passwordPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
                        onClick={e =>
                            e.target === e.currentTarget &&
                            setPasswordPrompt(null)
                        }
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 12 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 w-full max-w-sm flex flex-col gap-4 shadow-2xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                                    <span className="text-xl">🔒</span>
                                </div>
                                <div>
                                    <p className="font-bold text-sm">
                                        Private Session
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[200px]">
                                        {passwordPrompt.title}
                                    </p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                This session is password-protected. Ask the
                                creator for the access code.
                            </p>

                            <input
                                type="text"
                                placeholder="Enter session password..."
                                value={passwordInput}
                                onChange={e => {
                                    setPasswordInput(e.target.value);
                                    setPasswordError("");
                                }}
                                onKeyDown={e =>
                                    e.key === "Enter" && handlePasswordJoin()
                                }
                                autoFocus
                                className="input-field"
                            />

                            {passwordError && (
                                <p className="text-red-500 text-xs flex items-center gap-1.5">
                                    <AlertCircle size={13} /> {passwordError}
                                </p>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPasswordPrompt(null)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handlePasswordJoin}
                                    disabled={!passwordInput.trim()}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-700 hover:bg-primary-600 transition-colors disabled:opacity-50"
                                >
                                    Join Session
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Helpers ───────────────────────────────────────

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
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatMsgTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const sameDay = d.toDateString() === now.toDateString();
    if (sameDay) {
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    }
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}
