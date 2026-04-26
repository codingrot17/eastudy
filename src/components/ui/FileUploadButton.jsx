import { useState, useRef } from "react";
import {
    Paperclip,
    Loader2,
    X,
    FileText,
    Image,
    CheckCircle
} from "lucide-react";
import {
    uploadFile,
    getFileType,
    ALLOWED_EXT,
    formatFileSize
} from "../../appwrite/storage";

/**
 * FileUploadButton
 *
 * Triggers a file picker, uploads on selection, and calls onUpload with the
 * Appwrite file document enriched with { mimeType, name } from the local File.
 *
 * Props:
 *   onUpload(fileDoc) — called after a successful upload
 *   disabled          — disables the button
 *   size              — "sm" (icon only) | "md" (icon + label)
 */
export default function FileUploadButton({ onUpload, disabled, size = "md" }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [uploadedName, setUploadedName] = useState(""); // brief success flash
    const inputRef = useRef(null);

    const handleChange = async e => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setUploadedName("");
        setUploading(true);

        try {
            const doc = await uploadFile(file);
            // Enrich Appwrite doc with local file metadata Appwrite doesn't store
            const enriched = {
                ...doc,
                mimeType: file.type,
                name: file.name, // human-readable filename
                fileName: file.name, // alias used by materials + posts
                size: file.size
            };
            setUploadedName(file.name);
            onUpload(enriched);
        } catch (err) {
            setError(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
            // Reset so the same file can be re-selected after removal
            e.target.value = "";
        }
    };

    const accept = ALLOWED_EXT.map(e => `.${e}`).join(",");

    if (size === "sm") {
        return (
            <div className="flex flex-col gap-1">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled || uploading}
                    title="Attach file (PDF or image, max 10 MB)"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <Paperclip size={16} />
                    )}
                </button>
                {error && (
                    <p className="text-xs text-red-500 max-w-[200px] leading-tight">
                        {error}
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-500 dark:text-slate-400 hover:border-primary-400 dark:hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {uploading ? (
                    <>
                        <Loader2 size={18} className="animate-spin shrink-0" />
                        Uploading…
                    </>
                ) : uploadedName ? (
                    <>
                        <CheckCircle
                            size={18}
                            className="text-emerald-500 shrink-0"
                        />
                        <span className="truncate">{uploadedName}</span>
                    </>
                ) : (
                    <>
                        <Paperclip size={18} className="shrink-0" />
                        Choose file (PDF / image, max 10 MB)
                    </>
                )}
            </button>
            {error && (
                <p className="text-xs text-red-500 px-1 leading-tight">
                    {error}
                </p>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}

/**
 * FileAttachmentChip
 *
 * Shows a compact chip with file name and a remove button.
 * Used in forms after a file has been selected/uploaded.
 *
 * Props:
 *   file     — { name, mimeType }
 *   onRemove — called when × is clicked
 */
export function FileAttachmentChip({ file, onRemove }) {
    const type = getFileType(file.mimeType);

    return (
        <div className="inline-flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-full">
            {type === "image" ? (
                <Image size={14} className="text-violet-500 shrink-0" />
            ) : (
                <FileText size={14} className="text-red-500 shrink-0" />
            )}
            <span className="truncate text-xs text-slate-700 dark:text-slate-300 min-w-0">
                {file.name || file.fileName}
            </span>
            <button
                type="button"
                onClick={onRemove}
                className="p-0.5 rounded text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-1"
                title="Remove file"
            >
                <X size={13} />
            </button>
        </div>
    );
}
