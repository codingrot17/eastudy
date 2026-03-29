import { Megaphone, Pin, Clock, RefreshCw } from "lucide-react";

export default function StudentAnnouncementsTab({ department }) {
    // Will connect to Appwrite in next phase
    const announcements = [];

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
                <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Pinned Notice */}
            <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl px-4 py-3 flex items-center gap-3">
                <Pin
                    size={14}
                    className="text-primary-700 dark:text-primary-400 shrink-0"
                />
                <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">
                    Pinned announcements will always appear at the top
                </p>
            </div>

            {/* List */}
            {announcements.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Megaphone size={24} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No announcements yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Your rep hasn't posted anything yet. You'll be notified
                        when they do.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {announcements.map(a => (
                        <div
                            key={a.id}
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
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                                {a.content}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} />
                                {new Date(a.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
