/**
 * useLinkPreview.js
 *
 * Fetches rich preview metadata for a URL.
 *
 * Strategy:
 *  1. YouTube URLs  → YouTube oEmbed API (no key, CORS-friendly, fast)
 *  2. Everything else → microlink.io free tier (no key needed for basic use)
 *
 * Results are cached in a module-level Map so the same URL is never
 * fetched twice per session — important for a feed with many repeated
 * resource links.
 *
 * Returns:
 *   { preview, loading, error }
 *
 *   preview shape:
 *   {
 *     type: "youtube" | "link",
 *     title: string,
 *     description: string,
 *     image: string | null,
 *     url: string,
 *     siteName: string | null,
 *     // YouTube only:
 *     videoId: string,
 *     thumbnailUrl: string,
 *     authorName: string,
 *   }
 */

import { useState, useEffect } from "react";

const cache = new Map();
const MICROLINK_BASE = "https://api.microlink.io";
const YOUTUBE_OEMBED = "https://www.youtube.com/oembed";

function extractYouTubeId(url) {
    try {
        const u = new URL(url);
        if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
            return u.pathname.slice(1).split("?")[0];
        }
        if (
            u.hostname.includes("youtube.com") ||
            u.hostname.includes("youtube-nocookie.com")
        ) {
            const v = u.searchParams.get("v");
            if (v) return v;
            if (u.pathname.startsWith("/embed/")) {
                return u.pathname.split("/embed/")[1].split("?")[0];
            }
            if (u.pathname.startsWith("/shorts/")) {
                return u.pathname.split("/shorts/")[1].split("?")[0];
            }
        }
    } catch {
        // invalid url
    }
    return null;
}

function isValidUrl(str) {
    try {
        const u = new URL(str);
        return u.protocol === "http:" || u.protocol === "https:";
    } catch {
        return false;
    }
}

async function fetchYouTubePreview(url, videoId) {
    const oEmbedUrl = `${YOUTUBE_OEMBED}?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oEmbedUrl);
    if (!res.ok) throw new Error("YouTube oEmbed failed");
    const data = await res.json();
    return {
        type: "youtube",
        title: data.title || "YouTube Video",
        description: null,
        image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url,
        siteName: "YouTube",
        videoId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        authorName: data.author_name || null
    };
}

async function fetchLinkPreview(url) {
    const apiUrl = `${MICROLINK_BASE}?url=${encodeURIComponent(url)}`;
    const res = await fetch(apiUrl, {
        headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error("Microlink fetch failed");
    const { data, status } = await res.json();
    if (status !== "success" || !data) throw new Error("No preview data");
    return {
        type: "link",
        title: data.title || null,
        description: data.description || null,
        image: data.image?.url || data.logo?.url || null,
        url: data.url || url,
        siteName: data.publisher || data.author || null
    };
}

export function useLinkPreview(url) {
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!url || !isValidUrl(url)) return;

        if (cache.has(url)) {
            const cached = cache.get(url);
            if (cached === "error") return;
            setPreview(cached);
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const videoId = extractYouTubeId(url);
                const data = videoId
                    ? await fetchYouTubePreview(url, videoId)
                    : await fetchLinkPreview(url);

                cache.set(url, data);
                if (!cancelled) setPreview(data);
            } catch (err) {
                cache.set(url, "error");
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [url]);

    return { preview, loading, error };
}
