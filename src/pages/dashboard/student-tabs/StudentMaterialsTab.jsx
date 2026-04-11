import { FolderOpen, FileText, ExternalLink, Search } from "lucide-react";
import { useState } from "react";
import { useMaterials } from "../../../hooks/useMaterials";

const categoryColors = {
    notes: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    slides: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    "past questions":
        "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    textbook:
        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    other: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
};

const CATEGORIES = [
    "all",
    "notes",
    "slides",
    "past questions",
    "textbook",
    "other"
];

export default function StudentMaterialsTab({ department }) {
    const { materials, loading, error } = useMaterials(department?.$id);
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const filtered = materials.filter(m => {
        const matchSearch = m.title
            .toLowerCase()
            .includes(search.toLowerCase());
        const matchCat =
            activeCategory === "all" || m.category === activeCategory;
        return matchSearch && matchCat;
    });

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

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize border transition-all ${
                            activeCategory === cat
                                ? "bg-primary-700 text-white border-primary-700"
                                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 animate-pulse h-16"
                        />
                    ))}
                </div>
            ) : materials.length === 0 ? (
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
                    No results matching your search.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {filtered.map(m => (
                        <a
                            key={m.$id}
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
                                <p className="font-semibold text-sm truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                    {m.title}
                                </p>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${
                                        categoryColors[m.category] ??
                                        categoryColors.other
                                    }`}
                                >
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
