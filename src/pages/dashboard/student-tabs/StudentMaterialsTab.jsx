import { FolderOpen, FileText, ExternalLink, Search } from "lucide-react";
import { useState } from "react";

export default function StudentMaterialsTab() {
    const [search, setSearch] = useState("");
    const materials = [];

    const filtered = materials.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">Study Materials</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Resources shared by your rep
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="text"
                    placeholder="Search materials..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-10"
                />
            </div>

            {/* List */}
            {materials.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                        <FolderOpen size={24} className="text-violet-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No materials yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Your rep hasn't shared any materials yet. Check back
                        soon.
                    </p>
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                    No results for "{search}"
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(m => (
                        <a
                            key={m.id}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all group"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <FileText
                                    size={18}
                                    className="text-slate-500"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm truncate">
                                    {m.title}
                                </p>
                                <span className="text-xs text-slate-400 capitalize">
                                    {m.category}
                                </span>
                            </div>
                            <ExternalLink
                                size={16}
                                className="text-slate-400 group-hover:text-primary-700 shrink-0 transition-colors"
                            />
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
