import {
    FolderOpen,
    Link as LinkIcon,
    Plus,
    FileText,
    Image,
    ExternalLink,
    Trash2,
    Loader2,
    RefreshCw,
    Download,
    Eye,
    X
} from "lucide-react";
import { useState } from "react";
import { useMaterials } from "../../../hooks/useMaterials";
import FileUploadButton, {
    FileAttachmentChip
} from "../../../components/ui/FileUploadButton";
import FilePreviewModal from "../../../components/ui/FilePreviewModal";
import { getFileType, getFileDownloadUrl } from "../../../appwrite/storage";
import Button from "../../../components/ui/Button";

// ── Constants ────────────────────────────────────────────────────────────────

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

// ── Main component ───────────────────────────────────────────────────────────

export default function MaterialsTab({ department, user }) {
    const { materials, loading, error, add, remove, refresh } = useMaterials(
        department?.$id
    );

    // Form visibility + source type
    const [showForm, setShowForm] = useState(false);
    const [sourceType, setSourceType] = useState("link"); // "link" | "file"
    const [form, setForm] = useState(emptyForm);
    const [attachedFile, setAttachedFile] = useState(null); // enriched Appwrite file doc
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Delete tracking
    const [deletingId, setDeletingId] = useState(null);

    // Preview modal
    const [previewFile, setPreviewFile] = useState(null); // { fileId, mimeType, fileName }

    // ── Field handler ────────────────────────────────────────────────────────

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    // ── Switch source type ───────────────────────────────────────────────────

    const switchSourceType = type => {
        setSourceType(type);
        setAttachedFile(null);
        setFormError("");
    };

    // ── Close / reset form ───────────────────────────────────────────────────

    const closeForm = () => {
        setShowForm(false);
        setForm(emptyForm);
        setAttachedFile(null);
        setSourceType("link");
        setFormError("");
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleAdd = async e => {
        e.preventDefault();
        setFormError("");

        if (!form.title.trim()) {
            setFormError("Please enter a title.");
            return;
        }
        if (sourceType === "link" && !form.url.trim()) {
            setFormError("Please enter a URL.");
            return;
        }
        if (sourceType === "file" && !attachedFile) {
            setFormError("Please select a file to upload.");
            return;
        }

        setSaving(true);
        try {
            await add({
                title: form.title.trim(),
                url: sourceType === "link" ? form.url.trim() : null,
                category: form.category,
                repId: user?.$id,
                fileId: sourceType === "file" ? attachedFile.$id : null,
                mimeType: sourceType === "file" ? attachedFile.mimeType : null,
                fileName: sourceType === "file" ? attachedFile.name : null,
                sourceType
            });
            closeForm();
        } catch {
            setFormError("Failed to add material. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ───────────────────────────────────────────────────────────────

    const handleDelete = async id => {
        setDeletingId(id);
        try {
            await remove(id);
        } finally {
            setDeletingId(null);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
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
                        Add
                    </Button>
                </div>
            </div>

            {/* ── Add Form ── */}
            {showForm && (
                <form
                    onSubmit={handleAdd}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-primary-200 dark:border-primary-800 overflow-hidden"
                >
                    {/* Form header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
                        <p className="font-bold text-primary-900 dark:text-primary-200 text-sm">
                            New Material
                        </p>
                        <button
                            type="button"
                            onClick={closeForm}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <div className="p-5 flex flex-col gap-4">
                        {/* Source type toggle */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => switchSourceType("link")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    sourceType === "link"
                                        ? "border-primary-700 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                <LinkIcon size={15} />
                                Add Link
                            </button>
                            <button
                                type="button"
                                onClick={() => switchSourceType("file")}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                    sourceType === "file"
                                        ? "border-primary-700 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                                        : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                                <FileText size={15} />
                                Upload File
                            </button>
                        </div>

                        {/* Title */}
                        <input
                            name="title"
                            type="text"
                            placeholder="Title (e.g. GST 101 Notes — Week 3)"
                            value={form.title}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />

                        {/* Link URL or file picker */}
                        {sourceType === "link" ? (
                            <input
                                name="url"
                                type="url"
                                placeholder="Paste URL (Google Drive, YouTube, PDF link…)"
                                value={form.url}
                                onChange={handleChange}
                                required
                                className="input-field"
                            />
                        ) : (
                            <div className="flex flex-col gap-2">
                                {attachedFile ? (
                                    <FileAttachmentChip
                                        file={attachedFile}
                                        onRemove={() => setAttachedFile(null)}
                                    />
                                ) : (
                                    <FileUploadButton
                                        onUpload={setAttachedFile}
                                        disabled={saving}
                                        size="md"
                                    />
                                )}
                                <p className="text-xs text-slate-400 px-1">
                                    PDF or images (JPG, PNG, WebP) · max 10MB
                                </p>
                            </div>
                        )}

                        {/* Category */}
                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className="input-field capitalize"
                        >
                            {CATEGORIES.map(c => (
                                <option
                                    key={c}
                                    value={c}
                                    className="capitalize"
                                >
                                    {c}
                                </option>
                            ))}
                        </select>

                        {formError && (
                            <p className="text-red-500 text-sm">{formError}</p>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <button
                                type="button"
                                onClick={closeForm}
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
                                    <Plus size={14} className="mr-1" />
                                )}
                                {saving ? "Saving…" : "Add Material"}
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* Error banner */}
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
                /* Empty state */
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                        <FolderOpen size={24} className="text-violet-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No materials yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Share lecture notes, slides, past questions and more —
                        via link or by uploading a file directly.
                    </p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                    >
                        Add your first material →
                    </button>
                </div>
            ) : (
                /* Materials list */
                <div className="flex flex-col gap-3">
                    {materials.map(item => (
                        <MaterialItem
                            key={item.$id}
                            item={item}
                            onDelete={() => handleDelete(item.$id)}
                            deleting={deletingId === item.$id}
                            onPreview={setPreviewFile}
                            categoryColors={categoryColors}
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

// ── MaterialItem ─────────────────────────────────────────────────────────────
//
// Renders a single material row — adapts to file uploads vs plain links.
// Kept as a separate component so we can share the same pattern in
// StudentMaterialsTab without duplicating JSX logic.

function MaterialItem({
    item,
    onDelete,
    deleting,
    onPreview,
    categoryColors,
    readOnly = false
}) {
    const isFile = item.sourceType === "file";
    const fileType = isFile ? getFileType(item.mimeType) : null;

    // Icon styles per file type
    const iconBg =
        fileType === "image"
            ? "bg-violet-50 dark:bg-violet-900/20"
            : fileType === "pdf"
              ? "bg-red-50 dark:bg-red-900/20"
              : "bg-slate-100 dark:bg-slate-800";

    const IconComponent = fileType === "image" ? Image : FileText;
    const iconColor =
        fileType === "image"
            ? "text-violet-500"
            : fileType === "pdf"
              ? "text-red-500"
              : "text-slate-500";

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all group">
            {/* File type icon */}
            <div
                className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
            >
                <IconComponent size={18} className={iconColor} />
            </div>

            {/* Title + category — clickable for file preview, link for URLs */}
            {isFile ? (
                <button
                    type="button"
                    onClick={() =>
                        onPreview({
                            fileId: item.fileId,
                            mimeType: item.mimeType,
                            fileName: item.fileName || item.title
                        })
                    }
                    className="flex-1 min-w-0 text-left"
                >
                    <p className="font-semibold text-sm truncate group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                                categoryColors[item.category] ??
                                categoryColors.other
                            }`}
                        >
                            {item.category}
                        </span>
                        <span className="text-xs text-slate-400 capitalize">
                            {fileType} · tap to view
                        </span>
                    </div>
                </button>
            ) : (
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-0"
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
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                {/* View / open external */}
                {isFile ? (
                    <a
                        href={getFileDownloadUrl(item.fileId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        title="Download"
                    >
                        <Download size={15} />
                    </a>
                ) : (
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        title="Open link"
                    >
                        <ExternalLink size={15} />
                    </a>
                )}

                {/* Delete — hidden for students */}
                {!readOnly && (
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        {deleting ? (
                            <Loader2 size={15} className="animate-spin" />
                        ) : (
                            <Trash2 size={15} />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// Export MaterialItem and categoryColors so StudentMaterialsTab can reuse them
export { MaterialItem, categoryColors };
