import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Pin, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { useAnnouncements } from "../../../hooks/useAnnouncements";

export default function StudentAnnouncementsTab({ department }) {
    const { announcements, loading, error, refresh } = useAnnouncements(
        department?.$id
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Announcements</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Updates from your class rep
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
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

            {/* Real-time badge */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    Live — new announcements appear instantly
                </p>
            </div>

            {/* Loading skeletons */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse"
                        >
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4 mb-3" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 mb-2" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/4" />
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
                        Your rep hasn't posted anything yet. You'll see updates
                        here in real-time.
                    </p>
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
                                exit={{ opacity: 0 }}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col gap-3 ${
                                    a.pinned
                                        ? "border-primary-200 dark:border-primary-800"
                                        : "border-slate-100 dark:border-slate-800"
                                }`}
                            >
                                {a.pinned && (
                                    <div className="flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400">
                                        <Pin size={12} /> Pinned
                                    </div>
                                )}
                                <p className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {a.content}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                                    <Clock size={12} />
                                    {formatTime(a.$createdAt)}
                                    {a.repName && (
                                        <span className="ml-1 font-medium text-slate-500 dark:text-slate-400">
                                            · {a.repName}
                                        </span>
                                    )}
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
