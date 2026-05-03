import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Download,
    ExternalLink,
    FileText,
    Image,
    Loader2,
    AlertCircle,
    File
} from "lucide-react";
import { useState } from "react";
import {
    getFileViewUrl,
    getFileDownloadUrl,
    getFileType
} from "../../appwrite/storage";

export default function FilePreviewModal({ file, onClose }) {
    // Reset internal state when file changes via key prop on inner component
    if (!file) return null;
    return <ModalInner file={file} onClose={onClose} />;
}

function ModalInner({ file, onClose }) {
    const [iframeLoading, setIframeLoading] = useState(true);
    const [imgError, setImgError] = useState(false);
    const [iframeError, setIframeError] = useState(false);

    const viewUrl = getFileViewUrl(file.fileId);
    const downloadUrl = getFileDownloadUrl(file.fileId);
    const type = getFileType(file.mimeType);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
                onClick={e => e.target === e.currentTarget && onClose()}
            >
                {/* Top bar */}
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
                        ) : type === "pdf" ? (
                            <FileText
                                size={15}
                                className="text-red-400 shrink-0"
                            />
                        ) : (
                            <File
                                size={15}
                                className="text-blue-400 shrink-0"
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
                                  : type === "doc"
                                    ? "DOC"
                                    : "File"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <Download size={13} />
                            <span className="hidden sm:inline">Download</span>
                        </a>
                        <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ExternalLink size={13} />
                            <span className="hidden sm:inline">Open</span>
                        </a>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Preview area */}
                <div
                    className="flex-1 overflow-hidden flex items-center justify-center p-3 sm:p-5"
                    onClick={e => e.stopPropagation()}
                >
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

                    {type === "image" && imgError && (
                        <FallbackCard
                            icon={
                                <AlertCircle
                                    size={28}
                                    className="text-amber-400"
                                />
                            }
                            title="Couldn't load image"
                            desc="The image may be private or deleted. Try opening it directly."
                            viewUrl={viewUrl}
                            downloadUrl={downloadUrl}
                        />
                    )}

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

                    {type === "pdf" && iframeError && (
                        <FallbackCard
                            icon={
                                <FileText size={36} className="text-red-400" />
                            }
                            title={file.fileName || "PDF Document"}
                            desc="PDF preview failed. Open in your browser or download it."
                            viewUrl={viewUrl}
                            downloadUrl={downloadUrl}
                            openLabel="Open in browser"
                        />
                    )}

                    {/* DOC files — can't preview, offer download */}
                    {type === "doc" && (
                        <FallbackCard
                            icon={<File size={36} className="text-blue-400" />}
                            title={file.fileName || "Document"}
                            desc="Word documents can't be previewed here. Download to open in your device."
                            viewUrl={viewUrl}
                            downloadUrl={downloadUrl}
                        />
                    )}

                    {type === "other" && (
                        <FallbackCard
                            icon={
                                <FileText
                                    size={36}
                                    className="text-slate-400"
                                />
                            }
                            title={file.fileName || "File"}
                            desc="Preview not available for this file type."
                            viewUrl={viewUrl}
                            downloadUrl={downloadUrl}
                        />
                    )}
                </div>

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

function FallbackCard({
    icon,
    title,
    desc,
    viewUrl,
    downloadUrl,
    openLabel = "Open in tab"
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center px-6"
        >
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="font-bold text-white mb-1">{title}</p>
                <p className="text-sm text-slate-400 max-w-xs">{desc}</p>
            </div>
            <div className="flex gap-3">
                <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-colors"
                >
                    <ExternalLink size={15} />
                    {openLabel}
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
        </motion.div>
    );
}
