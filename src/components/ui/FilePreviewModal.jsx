import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Download,
    ExternalLink,
    FileText,
    Image,
    Loader2,
    AlertCircle
} from "lucide-react";
import { useState } from "react";
import {
    getFileViewUrl,
    getFileDownloadUrl,
    getFileType
} from "../../appwrite/storage";

/**
 * FilePreviewModal
 *
 * Full-screen modal for previewing uploaded files.
 * - Images: rendered as <img>
 * - PDFs: rendered in an <iframe>; falls back to download link if iframe errors
 * - Other: fallback with download button
 *
 * Props:
 *   file    — { fileId, mimeType, fileName } | null
 *   onClose — called to dismiss the modal
 */
export default function FilePreviewModal({ file, onClose }) {
    const [iframeLoading, setIframeLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    if (!file) return null;

    const viewUrl = getFileViewUrl(file.fileId);
    const downloadUrl = getFileDownloadUrl(file.fileId);
    const type = getFileType(file.mimeType);

    const handleBackdropClick = e => {
        if (e.target === e.currentTarget) onClose();
    };

    // Reset error states when a new file is opened
    // (handled naturally since component unmounts when file=null)

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
                onClick={handleBackdropClick}
            >
                {/* ── Top bar ── */}
                <div
                    className="flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-sm border-b border-white/10 shrink-0"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex items-center gap-2.5 min-w-0 mr-3">
                        {type === "image" ? (
                            <Image
                                size={15}
                                className="text-violet-400 shrink-0"
                            />
                        ) : (
                            <FileText
                                size={15}
                                className="text-red-400 shrink-0"
                            />
                        )}
                        <p className="text-sm font-medium text-white truncate">
                            {file.fileName || "File"}
                        </p>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 shrink-0">
                            {type === "pdf"
                                ? "PDF"
                                : type === "image"
                                  ? "Image"
                                  : "File"}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Download file"
                        >
                            <Download size={13} />
                            <span className="hidden sm:inline">Download</span>
                        </a>
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Open in new tab"
                        >
                            <ExternalLink size={13} />
                            <span className="hidden sm:inline">Open</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            title="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Preview area ── */}
                <div
                    className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-5"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Image preview */}
                    {type === "image" && !imgError && (
                        <motion.img
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.22 }}
                            src={viewUrl}
                            alt={file.fileName || "Image"}
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                            onError={() => setImgError(true)}
                        />
                    )}

                    {/* Image load error */}
                    {type === "image" && imgError && (
                        <ImageError
                            viewUrl={viewUrl}
                            downloadUrl={downloadUrl}
                        />
                    )}

                    {/* PDF preview */}
                    {type === "pdf" && !iframeError && (
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                            {iframeLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <Loader2
                                        size={28}
                                        className="animate-spin text-primary-700"
                                    />
                                    <p className="text-sm text-slate-500">
                                        Loading PDF…
                                    </p>
                                </div>
                            )}
                            <iframe
                                src={viewUrl}
                                title={file.fileName || "PDF"}
                                className="w-full h-full bg-white rounded-xl"
                                style={{ minHeight: "65vh" }}
                                onLoad={() => setIframeLoading(false)}
                                onError={() => {
                                    setIframeLoading(false);
                                    setIframeError(true);
                                }}
                            />
                        </div>
                    )}

                    {/* PDF iframe failed — show open/download fallback */}
                    {type === "pdf" && iframeError && (
                        <PDFError
                            viewUrl={viewUrl}
                            downloadUrl={downloadUrl}
                            fileName={file.fileName}
                        />
                    )}

                    {/* Other file types */}
                    {type === "other" && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center gap-5 text-center px-6"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                                <FileText
                                    size={36}
                                    className="text-slate-400"
                                />
                            </div>
                            <div>
                                <p className="font-bold text-white mb-1">
                                    {file.fileName || "File"}
                                </p>
                                <p className="text-sm text-slate-400">
                                    Preview not available for this file type.
                                </p>
                            </div>
                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-primary-700 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-colors"
                            >
                                <Download size={16} />
                                Download File
                            </a>
                        </motion.div>
                    )}
                </div>

                {/* ── Bottom hint ── */}
                <div
                    className="shrink-0 py-2 text-center"
                    onClick={e => e.stopPropagation()}
                >
                    <p className="text-xs text-white/30">
                        Tap outside to close
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// ── Error fallbacks ──────────────────────────────

function ImageError({ viewUrl, downloadUrl }) {
    return (
        <div className="flex flex-col items-center gap-5 text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <AlertCircle size={28} className="text-amber-400" />
            </div>
            <div>
                <p className="font-bold text-white mb-1">Couldn't load image</p>
                <p className="text-sm text-slate-400 max-w-xs">
                    This can happen if bucket permissions are not set to public
                    read, or the file was deleted.
                </p>
            </div>
            <div className="flex gap-3">
                <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <ExternalLink size={15} />
                    Open in tab
                </a>
                <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <Download size={15} />
                    Download
                </a>
            </div>
        </div>
    );
}

function PDFError({ viewUrl, downloadUrl, fileName }) {
    return (
        <div className="flex flex-col items-center gap-5 text-center px-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                <FileText size={36} className="text-red-400" />
            </div>
            <div>
                <p className="font-bold text-white mb-1">
                    {fileName || "PDF Document"}
                </p>
                <p className="text-sm text-slate-400 max-w-xs">
                    PDF preview couldn't load. Open it in your browser or
                    download it.
                </p>
            </div>
            <div className="flex gap-3">
                <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <ExternalLink size={15} />
                    Open in browser
                </a>
                <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 hover:bg-primary-600 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <Download size={15} />
                    Download PDF
                </a>
            </div>
        </div>
    );
}
