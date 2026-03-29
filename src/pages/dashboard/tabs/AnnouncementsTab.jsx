import { Megaphone, Pin, Clock, Plus, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";

export default function AnnouncementsTab({ department }) {
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState("");
    const [pinned, setPinned] = useState(false);
    const [posting, setPosting] = useState(false);
    const [announcements, setAnnouncements] = useState([]);

    const handlePost = async e => {
        e.preventDefault();
        if (!content.trim()) return;
        setPosting(true);

        // Simulate — Appwrite integration comes in full feature build
        await new Promise(r => setTimeout(r, 800));

        setAnnouncements(prev => [
            {
                id: Date.now(),
                content,
                pinned,
                createdAt: new Date().toISOString()
            },
            ...prev
        ]);

        setContent("");
        setPinned(false);
        setShowForm(false);
        setPosting(false);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Announcements</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Post updates to your class
                    </p>
                </div>
                <Button size="sm" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} className="mr-1" />
                    New
                </Button>
            </div>

            {/* Post Form */}
            {showForm && (
                <form
                    onSubmit={handlePost}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4"
                >
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder="Write your announcement here..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none"
                    />
                    <div className="flex items-center justify-between gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={pinned}
                                onChange={e => setPinned(e.target.checked)}
                                className="rounded accent-primary-700"
                            />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <Pin size={14} /> Pin this
                            </span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                Cancel
                            </button>
                            <Button type="submit" size="sm" disabled={posting}>
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
                </form>
            )}

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Megaphone size={24} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No announcements yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Post your first announcement and your students will see
                        it immediately.
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
