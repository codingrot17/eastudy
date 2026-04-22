// src/components/ui/FilePreviewModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Download,
    ExternalLink,
    FileText,
    Image,
    Loader2
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
 * - PDFs: rendered in an <iframe> (works in Kiwi Browser on Android)
 * - Other: fallback with download button
 *
 * Props:
 *   file    — { fileId, mimeType, fileName } | null
 *   onClose — called to dismiss the modal
 */
export default function FilePreviewModal({ file, onClose }) {
    const [iframeLoading, setIframeLoading] = useState(true);

    if (!file) return null;

    const viewUrl = getFileViewUrl(file.fileId);
    const downloadUrl = getFileDownloadUrl(file.fileId);
    const type = getFileType(file.mimeType);

    const handleBackdropClick = e => {
        // Only close when clicking the backdrop itself, not the content
        if (e.target === e.currentTarget) onClose();
    };

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
                    {/* File name + type badge */}
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
                            {file.fileName}
                        </p>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-slate-300 shrink-0">
                            {type === "pdf"
                                ? "PDF"
                                : type === "image"
                                  ? "Image"
                                  : "File"}
                        </span>
                    </div>

                    {/* Actions */}
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
                    {type === "image" && (
                        <motion.img
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.22 }}
                            src={viewUrl}
                            alt={file.fileName}
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                        />
                    )}

                    {type === "pdf" && (
                        <div className="relative w-full h-full rounded-xl overflow-hidden">
                            {/* Loading spinner shown while iframe loads */}
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
                                title={file.fileName}
                                className="w-full h-full bg-white rounded-xl"
                                style={{ minHeight: "65vh" }}
                                onLoad={() => setIframeLoading(false)}
                            />
                        </div>
                    )}

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
                                    {file.fileName}
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
