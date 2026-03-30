import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Megaphone,
    Pin,
    Clock,
    Plus,
    Send,
    Loader2,
    Trash2,
    PinOff,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { useAnnouncements } from "../../../hooks/useAnnouncements";
import Button from "../../../components/ui/Button";

export default function AnnouncementsTab({ department, user }) {
    const { announcements, loading, error, post, pin, remove, refresh } =
        useAnnouncements(department?.$id);

    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState("");
    const [pinned, setPinned] = useState(false);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const handlePost = async e => {
        e.preventDefault();
        if (!content.trim()) return;
        setPosting(true);
        setPostError("");
        try {
            await post({
                content: content.trim(),
                pinned,
                repId: user?.$id,
                repName: user?.name
            });
            setContent("");
            setPinned(false);
            setShowForm(false);
        } catch {
            setPostError("Failed to post. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const handlePin = async (id, currentPinned) => {
        try {
            await pin(id, currentPinned);
        } catch {}
    };

    const handleDelete = async id => {
        setDeletingId(id);
        try {
            await remove(id);
        } catch {
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Announcements</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {announcements.length} post
                        {announcements.length !== 1 ? "s" : ""} in your
                        department
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button size="sm" onClick={() => setShowForm(!showForm)}>
                        <Plus size={16} className="mr-1" />
                        New
                    </Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Post Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onSubmit={handlePost}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4"
                    >
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Write your announcement here..."
                            rows={4}
                            required
                            autoFocus
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none"
                        />

                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div
                                    onClick={() => setPinned(!pinned)}
                                    className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${
                                        pinned
                                            ? "bg-primary-700"
                                            : "bg-slate-200 dark:bg-slate-700"
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                            pinned
                                                ? "translate-x-5"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </div>
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                    <Pin size={14} />
                                    Pin to top
                                </span>
                            </label>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setPostError("");
                                    }}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={posting || !content.trim()}
                                >
                                    {posting ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin mr-1"
                                        />
                                    ) : (
                                        <Send size={16} className="mr-1" />
                                    )}
                                    {posting ? "Posting..." : "Post"}
                                </Button>
                            </div>
                        </div>

                        {postError && (
                            <p className="text-red-500 text-sm">{postError}</p>
                        )}
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Loading */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse"
                        >
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4 mb-3" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
                        </div>
                    ))}
                </div>
            ) : announcements.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Megaphone size={24} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No announcements yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Post your first announcement and your students will see
                        it in real-time.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                    >
                        Post your first announcement →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                        {announcements.map(a => (
                            <motion.div
                                key={a.$id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col gap-3 ${
                                    a.pinned
                                        ? "border-primary-200 dark:border-primary-800"
                                        : "border-slate-100 dark:border-slate-800"
                                }`}
                            >
                                {/* Pin badge */}
                                {a.pinned && (
                                    <div className="flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400">
                                        <Pin size={12} /> Pinned
                                    </div>
                                )}

                                {/* Content */}
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {a.content}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Clock size={12} />
                                        {formatTime(a.$createdAt)}
                                        {a.repName && (
                                            <span className="ml-1">
                                                · {a.repName}
                                            </span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() =>
                                                handlePin(a.$id, a.pinned)
                                            }
                                            title={a.pinned ? "Unpin" : "Pin"}
                                            className="p-2 rounded-xl text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                        >
                                            {a.pinned ? (
                                                <PinOff size={15} />
                                            ) : (
                                                <Pin size={15} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(a.$id)}
                                            disabled={deletingId === a.$id}
                                            title="Delete"
                                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                                        >
                                            {deletingId === a.$id ? (
                                                <Loader2
                                                    size={15}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Trash2 size={15} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

function formatTime(iso) {
    const date = new Date(iso);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}
