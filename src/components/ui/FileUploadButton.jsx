import { useState, useRef } from "react";
import {
    Paperclip,
    Loader2,
    X,
    FileText,
    Image,
    CheckCircle,
    File
} from "lucide-react";
import {
    uploadFile,
    getFileType,
    ALLOWED_EXT,
    formatFileSize
} from "../../appwrite/storage";

export default function FileUploadButton({ onUpload, disabled, size = "md" }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // 0–100
    const [error, setError] = useState("");
    const [uploadedName, setUploadedName] = useState("");
    const inputRef = useRef(null);

    const handleChange = async e => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError("");
        setUploadedName("");
        setProgress(0);
        setUploading(true);

        // Fake progress (Appwrite SDK doesn't expose upload progress yet)
        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 15, 85));
        }, 200);

        try {
            const doc = await uploadFile(file);
            clearInterval(progressInterval);
            setProgress(100);

            const enriched = {
                ...doc,
                mimeType: doc.mimeType ?? file.type,
                name: file.name,
                fileName: file.name,
                size: file.size
            };
            setUploadedName(file.name);
            onUpload(enriched);
        } catch (err) {
            clearInterval(progressInterval);
            setError(err.message || "Upload failed. Please try again.");
        } finally {
            setUploading(false);
            setProgress(0);
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
                    title="Attach file (PDF, image, or Word doc — max 10 MB)"
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
                        Uploading…{" "}
                        {progress > 0 && progress < 100 ? `${progress}%` : ""}
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
                        Choose file (PDF, image, Word — max 10 MB)
                    </>
                )}
            </button>
            {/* Progress bar */}
            {uploading && progress > 0 && (
                <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary-700 rounded-full transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
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

export function FileAttachmentChip({ file, onRemove }) {
    const type = getFileType(file.mimeType);
    const IconMap = { image: Image, pdf: FileText, doc: File };
    const Icon = IconMap[type] ?? FileText;
    const colorMap = {
        image: "text-violet-500",
        pdf: "text-red-500",
        doc: "text-blue-500",
        other: "text-slate-500"
    };

    return (
        <div className="inline-flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-full">
            <Icon size={14} className={`${colorMap[type]} shrink-0`} />
            <span className="truncate text-xs text-slate-700 dark:text-slate-300 min-w-0">
                {file.name || file.fileName}
            </span>
            {file.size && (
                <span className="text-xs text-slate-400 shrink-0">
                    {formatFileSize(file.size)}
                </span>
            )}
            <button
                type="button"
                onClick={onRemove}
                className="p-0.5 rounded text-slate-400 hover:text-red-500 transition-colors shrink-0 ml-1"
            >
                <X size={13} />
            </button>
        </div>
    );
}
