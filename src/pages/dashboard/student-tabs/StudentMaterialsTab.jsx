import { useState } from "react";
import { FolderOpen, Search } from "lucide-react";
import { useMaterials } from "../../../hooks/useMaterials";
import FilePreviewModal from "../../../components/ui/FilePreviewModal";
// Reuse the shared MaterialItem and category color map from the rep tab
// so both views stay visually identical without duplicating JSX.
import { MaterialItem, categoryColors } from "../tabs/MaterialsTab";

// ── Filter constants ─────────────────────────────────────────────────────────

const CATEGORIES = [
    "all",
    "notes",
    "slides",
    "past questions",
    "textbook",
    "other"
];

// ── Component ────────────────────────────────────────────────────────────────

export default function StudentMaterialsTab({ department }) {
    const { materials, loading, error } = useMaterials(department?.$id);

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    // File preview modal state
    const [previewFile, setPreviewFile] = useState(null); // { fileId, mimeType, fileName }

    // Filter by search text and active category
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
            {/* Header */}
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
                    placeholder="Search materials…"
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

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Loading skeletons */}
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
                /* Empty state — no materials at all */
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
                /* No results for current search / filter */
                <p className="text-center text-sm text-slate-400 py-8">
                    No results matching your search.
                </p>
            ) : (
                /* Materials list — read-only (no delete button) */
                <div className="flex flex-col gap-3">
                    {filtered.map(m => (
                        <MaterialItem
                            key={m.$id}
                            item={m}
                            onPreview={setPreviewFile}
                            categoryColors={categoryColors}
                            readOnly
                            // onDelete and deleting are intentionally omitted;
                            // MaterialItem hides the delete button when readOnly=true
                        />
                    ))}
                </div>
            )}

            {/* File preview modal */}
            <FilePreviewModal
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </div>
    );
}
