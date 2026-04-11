import {
    FolderOpen,
    Link as LinkIcon,
    Plus,
    FileText,
    ExternalLink,
    Trash2,
    Loader2,
    RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useMaterials } from "../../../hooks/useMaterials";
import Button from "../../../components/ui/Button";

const CATEGORIES = ["notes", "slides", "past questions", "textbook", "other"];

const categoryColors = {
    notes: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
    slides: "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400",
    "past questions":
        "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400",
    textbook:
        "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400",
    other: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
};

const emptyForm = { title: "", url: "", category: "notes" };

export default function MaterialsTab({ department, user }) {
    const { materials, loading, error, add, remove, refresh } = useMaterials(
        department?.$id
    );

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [formError, setFormError] = useState("");

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleAdd = async e => {
        e.preventDefault();
        setFormError("");
        setSaving(true);
        try {
            await add({ ...form, repId: user?.$id });
            setForm(emptyForm);
            setShowForm(false);
        } catch {
            setFormError("Failed to add material. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async id => {
        setDeletingId(id);
        try {
            await remove(id);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Study Materials</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {materials.length} resource
                        {materials.length !== 1 ? "s" : ""} shared
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
                        Add Link
                    </Button>
                </div>
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

                    {formError && (
                        <p className="text-red-500 text-sm">{formError}</p>
                    )}

                    <div className="flex justify-end gap-2">
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
                            {saving ? (
                                <Loader2
                                    size={14}
                                    className="animate-spin mr-1"
                                />
                            ) : (
                                <LinkIcon size={14} className="mr-1" />
                            )}
                            {saving ? "Adding..." : "Add Material"}
                        </Button>
                    </div>
                </form>
            )}

            {/* Error */}
            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Loading */}
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
                        Share lecture notes, slides, past questions and more
                        with your class.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {materials.map(item => (
                        <div
                            key={item.$id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                        >
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <FileText
                                    size={18}
                                    className="text-slate-500"
                                />
                            </div>
                            <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-0 group"
                            >
                                <p className="font-semibold text-sm truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                    {item.title}
                                </p>
                                <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block ${
                                        categoryColors[item.category] ??
                                        categoryColors.other
                                    }`}
                                >
                                    {item.category}
                                </span>
                            </a>
                            <div className="flex items-center gap-1 shrink-0">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                >
                                    <ExternalLink size={15} />
                                </a>
                                <button
                                    onClick={() => handleDelete(item.$id)}
                                    disabled={deletingId === item.$id}
                                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                                >
                                    {deletingId === item.$id ? (
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
                    ))}
                </div>
            )}
        </div>
    );
}
