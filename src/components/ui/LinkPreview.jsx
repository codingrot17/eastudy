/**
 * LinkPreview.jsx
 *
 * Renders a rich preview card for a URL inside feed posts.
 *
 * - YouTube → inline embed (click-to-play) with thumbnail + play button
 * - General URLs → OG card with image, title, description, site name
 * - Loading → skeleton shimmer
 * - Error / no data → compact plain link chip (fallback)
 */

import { useState } from "react";
import { ExternalLink, Globe, Play, Loader2 } from "lucide-react";
import { useLinkPreview } from "../../hooks/useLinkPreview";

// ── YouTube embed card ──────────────────────────────────────────────────────

function YouTubeCard({ preview }) {
    const [playing, setPlaying] = useState(false);
    const embedUrl = `https://www.youtube.com/embed/${preview.videoId}?autoplay=1&rel=0`;

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {playing ? (
                <div
                    className="relative w-full"
                    style={{ paddingBottom: "56.25%" }}
                >
                    <iframe
                        src={embedUrl}
                        title={preview.title}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; encrypted-media; picture-in-picture"
                        allowFullScreen
                        frameBorder="0"
                    />
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="relative w-full group block"
                    aria-label={`Play ${preview.title}`}
                >
                    <div
                        className="relative w-full"
                        style={{ paddingBottom: "56.25%" }}
                    >
                        <img
                            src={preview.thumbnailUrl}
                            alt={preview.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play
                                    size={22}
                                    className="text-white ml-1"
                                    fill="white"
                                />
                            </div>
                        </div>
                    </div>
                </button>
            )}

            {/* Meta row */}
            <div className="flex items-start gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                    {/* YouTube icon using SVG inline since ti-brand-youtube might not be loaded */}
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="#EF4444"
                    >
                        <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                        {preview.title}
                    </p>
                    {preview.authorName && (
                        <p className="text-xs text-slate-400 mt-0.5">
                            {preview.authorName} · YouTube
                        </p>
                    )}
                </div>
                <a
                    href={preview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    aria-label="Open on YouTube"
                >
                    <ExternalLink size={14} />
                </a>
            </div>
        </div>
    );
}

// ── General OG link card ────────────────────────────────────────────────────

function LinkCard({ preview }) {
    const [imgError, setImgError] = useState(false);

    return (
        <a
            href={preview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all group"
        >
            {/* Image */}
            {preview.image && !imgError && (
                <div className="w-24 shrink-0 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                        src={preview.image}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                </div>
            )}

            {/* Text */}
            <div className="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between gap-1.5">
                {preview.siteName && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Globe size={11} />
                        {preview.siteName}
                    </p>
                )}
                {preview.title && (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                        {preview.title}
                    </p>
                )}
                {preview.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {preview.description}
                    </p>
                )}
                <p className="text-xs text-slate-400 truncate mt-0.5">
                    {preview.url}
                </p>
            </div>
        </a>
    );
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function PreviewSkeleton({ isYoutube }) {
    if (isYoutube) {
        return (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
                <div
                    className="w-full bg-slate-100 dark:bg-slate-800"
                    style={{ paddingBottom: "56.25%" }}
                />
                <div className="px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
            <div className="w-24 h-20 bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="flex-1 py-3 pr-3 flex flex-col gap-2">
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
            </div>
        </div>
    );
}

// ── Fallback plain chip ─────────────────────────────────────────────────────

function FallbackChip({ url }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
            <ExternalLink size={14} className="shrink-0 text-slate-400" />
            <span className="truncate">{url}</span>
        </a>
    );
}

// ── Main export ─────────────────────────────────────────────────────────────

/**
 * @param {{ url: string }} props
 */
export default function LinkPreview({ url }) {
    const { preview, loading, error } = useLinkPreview(url);

    const isYoutube = url
        ? url.includes("youtube.com") || url.includes("youtu.be")
        : false;

    if (!url) return null;

    if (loading) return <PreviewSkeleton isYoutube={isYoutube} />;

    if (error || !preview) return <FallbackChip url={url} />;

    if (preview.type === "youtube") return <YouTubeCard preview={preview} />;

    if (!preview.title && !preview.description && !preview.image) {
        return <FallbackChip url={url} />;
    }

    return <LinkCard preview={preview} />;
}
