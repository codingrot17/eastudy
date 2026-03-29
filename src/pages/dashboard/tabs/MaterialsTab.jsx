import {
    FolderOpen,
    Link as LinkIcon,
    Plus,
    FileText,
    ExternalLink
} from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button";

const CATEGORIES = ["notes", "slides", "past questions", "textbook", "other"];

const categoryColors = {
    notes: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    slides: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    "past questions":
        "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    textbook:
        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    other: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
};

export default function MaterialsTab() {
    const [showForm, setShowForm] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [form, setForm] = useState({
        title: "",
        url: "",
        category: "notes"
    });

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleAdd = e => {
        e.preventDefault();
        if (!form.title || !form.url) return;
        const entry = {
            id: Date.now(),
            title: form.title,
            url: form.url,
            category: form.category,
            createdAt: new Date().toISOString()
        };
        setMaterials(prev => [entry, ...prev]);
        setForm({ title: "", url: "", category: "notes" });
        setShowForm(false);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Study Materials</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Share links and resources with your class
                    </p>
                </div>
                <Button size="sm" onClick={() => setShowForm(v => !v)}>
                    <Plus size={16} className="mr-1" />
                    Add Link
                </Button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form
                    onSubmit={handleAdd}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4"
                >
                    <input
                        name="title"
                        type="text"
                        placeholder="Title (e.g. GST 101 Notes — Week 3)"
                        value={form.title}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                    <input
                        name="url"
                        type="url"
                        placeholder="Link URL (Google Drive, PDF, etc.)"
                        value={form.url}
                        onChange={handleChange}
                        required
                        className="input-field"
                    />
                    <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="input-field capitalize"
                    >
                        {CATEGORIES.map(c => (
                            <option key={c} value={c} className="capitalize">
                                {c}
                            </option>
                        ))}
                    </select>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Cancel
                        </button>
                        <Button type="submit" size="sm">
                            <LinkIcon size={14} className="mr-1" />
                            Add Material
                        </Button>
                    </div>
                </form>
            )}

            {/* Empty State */}
            {materials.length === 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                        <FolderOpen size={24} className="text-violet-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No materials yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Share lecture notes, slides, past questions and more
                        with your class.
                    </p>
                </div>
            )}

            {/* Materials List */}
            {materials.length > 0 && (
                <div className="flex flex-col gap-3">
                    {materials.map(item => {
                        const colorClass =
                            categoryColors[item.category] ??
                            categoryColors.other;
                        return (
                            <a
                                key={item.id}
                                href={item.url}
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
                                        {item.title}
                                    </p>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${colorClass}`}
                                    >
                                        {item.category}
                                    </span>
                                </div>
                                <ExternalLink
                                    size={16}
                                    className="text-slate-400 group-hover:text-primary-700 dark:group-hover:text-primary-400 shrink-0 transition-colors"
                                />
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
