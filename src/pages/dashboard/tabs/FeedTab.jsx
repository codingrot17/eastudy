import { useState, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Rss,
    Plus,
    Link as LinkIcon,
    HelpCircle,
    FileText,
    Send,
    Trash2,
    Pin,
    PinOff,
    MessageCircle,
    Loader2,
    AlertCircle,
    RefreshCw,
    X,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Image,
    Download,
    Eye,
    File
} from "lucide-react";
import { usePosts, useComments } from "../../../hooks/usePosts";
import FileUploadButton, {
    FileAttachmentChip
} from "../../../components/ui/FileUploadButton";
import FilePreviewModal from "../../../components/ui/FilePreviewModal";
import {
    getFileViewUrl,
    getFileDownloadUrl,
    getFileType
} from "../../../appwrite/storage";
import { deleteFile } from "../../../appwrite/storage";
import Button from "../../../components/ui/Button";

// ── Constants ────────────────────────────────────

const POST_TYPES = [
    {
        value: "text",
        label: "Post",
        icon: FileText,
        placeholder: "Share something with your class…"
    },
    {
        value: "resource",
        label: "Resource",
        icon: LinkIcon,
        placeholder: "Describe this resource…"
    },
    {
        value: "question",
        label: "Question",
        icon: HelpCircle,
        placeholder: "Ask your classmates something…"
    }
];

const TRUNCATE_AT = 200;
const EMOJIS = ["👍", "🔥", "😂", "❤️", "🙏"];

const TYPE_BADGE = {
    text: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
    resource:
        "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    question:
        "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
};
const TYPE_LABEL = { text: "Post", resource: "Resource", question: "Question" };

function roleBadge(role) {
    if (role === "rep")
        return "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400";
    if (role === "assistant")
        return "bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400";
    return null;
}

function formatTime(iso) {
    const date = new Date(iso);
    const diff = Date.now() - date;
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
}

// ── Main ─────────────────────────────────────────

export default function FeedTab({ department, user, profile }) {
    const { posts, loading, error, post, remove, pin, react, refresh } =
        usePosts(department?.$id);

    const [showCompose, setShowCompose] = useState(false);
    const [activeType, setActiveType] = useState("text");
    const [content, setContent] = useState("");
    const [url, setUrl] = useState("");
    const [attachedFile, setAttachedFile] = useState(null);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState("");
    const [filter, setFilter] = useState("all");
    const [previewFile, setPreviewFile] = useState(null);

    const canPin = profile?.role === "rep" || profile?.role === "assistant";

    const resetCompose = () => {
        setContent("");
        setUrl("");
        setAttachedFile(null);
        setPostError("");
        setShowCompose(false);
    };

    const handlePost = async e => {
        e.preventDefault();
        if (!content.trim()) return;

        if (activeType === "resource" && !url.trim() && !attachedFile) {
            setPostError("Please add a link or attach a file.");
            return;
        }

        setPosting(true);
        setPostError("");

        try {
            await post({
                authorId: user?.$id,
                authorName: user?.name,
                authorRole: profile?.role ?? "student",
                type: activeType,
                content: content.trim(),
                url: attachedFile ? null : url.trim() || null,
                fileId: attachedFile?.$id ?? null,
                mimeType: attachedFile?.mimeType ?? null,
                fileName: attachedFile?.name ?? attachedFile?.fileName ?? null,
                sourceType: attachedFile ? "file" : url.trim() ? "link" : "none"
            });
            resetCompose();
        } catch (err) {
            console.error("[FeedTab] post error:", err);
            setPostError("Failed to post. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const handleReact = useCallback(
        (postId, reactions, emoji) =>
            react(postId, reactions, emoji, user?.$id),
        [react, user?.$id]
    );

    const handleRemove = useCallback(
        async postId => {
            const target = posts.find(p => p.$id === postId);
            if (target?.fileId) {
                deleteFile(target.fileId).catch(() => {});
            }
            remove(postId);
        },
        [remove, posts]
    );

    const handlePin = useCallback(
        (postId, pinned) => pin(postId, pinned),
        [pin]
    );

    const filtered =
        filter === "all" ? posts : posts.filter(p => p.type === filter);
    const typeConf = POST_TYPES.find(t => t.value === activeType);

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Feed</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Posts from your class
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button size="sm" onClick={() => setShowCompose(v => !v)}>
                        <Plus size={16} className="mr-1" /> Post
                    </Button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Compose box */}
            <AnimatePresence>
                {showCompose && (
                    <motion.div
                        key="compose"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                        {/* Type tabs */}
                        <div className="flex border-b border-slate-100 dark:border-slate-800">
                            {POST_TYPES.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => {
                                        setActiveType(value);
                                        setPostError("");
                                    }}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2 ${
                                        activeType === value
                                            ? "border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/10"
                                            : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    }`}
                                >
                                    <Icon size={13} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <form
                            onSubmit={handlePost}
                            className="p-4 flex flex-col gap-3"
                        >
                            {/* Author */}
                            <div className="flex items-center gap-2">
                                <Avatar name={user?.name} size="sm" />
                                <div>
                                    <p className="text-sm font-semibold leading-none">
                                        {user?.name}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 capitalize">
                                        {profile?.role}
                                    </p>
                                </div>
                            </div>

                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder={typeConf.placeholder}
                                rows={3}
                                required
                                autoFocus
                                maxLength={1000}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition resize-none text-sm"
                            />

                            {/* Resource: link OR file */}
                            {activeType === "resource" && (
                                <div className="flex flex-col gap-2">
                                    {!attachedFile && (
                                        <input
                                            type="url"
                                            placeholder="Paste a link (Google Drive, YouTube, PDF URL…)"
                                            value={url}
                                            onChange={e =>
                                                setUrl(e.target.value)
                                            }
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition text-sm"
                                        />
                                    )}
                                    {!url.trim() && (
                                        <div className="flex items-center gap-2">
                                            {attachedFile ? (
                                                <FileAttachmentChip
                                                    file={attachedFile}
                                                    onRemove={() =>
                                                        setAttachedFile(null)
                                                    }
                                                />
                                            ) : (
                                                <>
                                                    <FileUploadButton
                                                        onUpload={
                                                            setAttachedFile
                                                        }
                                                        disabled={posting}
                                                        size="sm"
                                                    />
                                                    <span className="text-xs text-slate-400">
                                                        or attach a file
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Non-resource: optional file */}
                            {activeType !== "resource" && (
                                <div className="flex items-center gap-2">
                                    {attachedFile ? (
                                        <FileAttachmentChip
                                            file={attachedFile}
                                            onRemove={() =>
                                                setAttachedFile(null)
                                            }
                                        />
                                    ) : (
                                        <>
                                            <FileUploadButton
                                                onUpload={setAttachedFile}
                                                disabled={posting}
                                                size="sm"
                                            />
                                            <span className="text-xs text-slate-400">
                                                Attach a file (optional)
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}

                            {postError && (
                                <p className="text-red-500 text-xs">
                                    {postError}
                                </p>
                            )}

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    {content.length}/1000
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={resetCompose}
                                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        type="submit"
                                        size="sm"
                                        disabled={posting || !content.trim()}
                                    >
                                        {posting ? (
                                            <Loader2
                                                size={14}
                                                className="animate-spin mr-1"
                                            />
                                        ) : (
                                            <Send size={14} className="mr-1" />
                                        )}
                                        {posting ? "Posting…" : "Post"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
                {["all", "text", "resource", "question"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full capitalize border transition-all ${
                            filter === f
                                ? "bg-primary-700 text-white border-primary-700"
                                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary-300"
                        }`}
                    >
                        {f === "all" ? "All" : TYPE_LABEL[f]}
                    </button>
                ))}
            </div>

            {/* Posts */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 animate-pulse"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800" />
                                <div className="flex-1">
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3 mb-1.5" />
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/5" />
                                </div>
                            </div>
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full mb-2" />
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                        <Rss size={24} className="text-primary-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        {filter === "all"
                            ? "Nothing posted yet"
                            : `No ${TYPE_LABEL[filter]?.toLowerCase()}s yet`}
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Be the first — share a resource, ask a question, or drop
                        an update.
                    </p>
                    <button
                        onClick={() => setShowCompose(true)}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline mt-1"
                    >
                        Post something →
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <AnimatePresence initial={false}>
                        {filtered.map(p => (
                            <PostCard
                                key={p.$id}
                                post={p}
                                currentUserId={user?.$id}
                                currentUserName={user?.name}
                                currentUserRole={profile?.role}
                                departmentId={department?.$id}
                                canPin={canPin}
                                onReact={handleReact}
                                onDelete={handleRemove}
                                onPin={handlePin}
                                onPreview={setPreviewFile}
                            />
                        ))}
                    </AnimatePresence>
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

// ── PostCard ──────────────────────────────────────────────────────────────────

const PostCard = memo(function PostCard({
    post,
    currentUserId,
    currentUserName,
    currentUserRole,
    departmentId,
    canPin,
    onReact,
    onDelete,
    onPin,
    onPreview
}) {
    const [showComments, setShowComments] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const isOwner = post.authorId === currentUserId;
    const canDelete =
        isOwner || currentUserRole === "rep" || currentUserRole === "assistant";
    const myEmoji = EMOJIS.find(e =>
        post.reactions[e]?.includes(currentUserId)
    );
    const totalReactions = Object.values(post.reactions).reduce(
        (s, a) => s + a.length,
        0
    );

    // Truncation
    const needsTruncation = post.content.length > TRUNCATE_AT;
    const displayContent =
        needsTruncation && !expanded
            ? post.content.slice(0, TRUNCATE_AT).trimEnd() + "…"
            : post.content;

    // ── File detection — check BOTH sourceType and fileId ──
    // sourceType can be "file", but fileId must also exist
    // Guard against null/undefined/empty string for both
    const hasFile = post.sourceType === "file" && Boolean(post.fileId);
    const fileType = hasFile ? getFileType(post.mimeType ?? "") : null;

    // ── Link detection — only when no file attached ──
    const hasLink =
        !hasFile &&
        post.type === "resource" &&
        Boolean(post.url) &&
        post.sourceType !== "file";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden ${
                post.pinned
                    ? "border-primary-200 dark:border-primary-800"
                    : "border-slate-100 dark:border-slate-800"
            }`}
        >
            <div className="p-5 flex flex-col gap-3">
                {post.pinned && (
                    <div className="flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400">
                        <Pin size={11} /> Pinned
                    </div>
                )}

                {/* Author */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={post.authorName} size="sm" />
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-semibold text-sm truncate">
                                    {post.authorName}
                                </span>
                                {post.authorRole !== "student" && (
                                    <span
                                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${roleBadge(post.authorRole)}`}
                                    >
                                        {post.authorRole}
                                    </span>
                                )}
                                <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[post.type]}`}
                                >
                                    {TYPE_LABEL[post.type]}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {formatTime(post.$createdAt)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {canPin && (
                            <button
                                onClick={() => onPin(post.$id, post.pinned)}
                                title={post.pinned ? "Unpin" : "Pin"}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                            >
                                {post.pinned ? (
                                    <PinOff size={14} />
                                ) : (
                                    <Pin size={14} />
                                )}
                            </button>
                        )}
                        {canDelete && (
                            <button
                                onClick={() => onDelete(post.$id)}
                                title="Delete"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Text content */}
                <div>
                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                        {displayContent}
                    </p>
                    {needsTruncation && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="flex items-center gap-1 text-primary-700 dark:text-primary-400 text-xs font-semibold mt-1.5 hover:underline"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp size={13} /> Show less
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={13} /> Read more
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Resource URL link */}
                {hasLink && (
                    <a
                        href={post.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 text-sm font-medium hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                    >
                        <ExternalLink size={14} className="shrink-0" />
                        <span className="truncate">{post.url}</span>
                    </a>
                )}

                {/* File attachment */}
                {hasFile && (
                    <FileAttachmentCard
                        fileId={post.fileId}
                        mimeType={post.mimeType}
                        fileName={post.fileName}
                        fileType={fileType}
                        onPreview={onPreview}
                    />
                )}

                {/* Reaction chips */}
                {totalReactions > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {EMOJIS.filter(
                            e => (post.reactions[e]?.length ?? 0) > 0
                        ).map(e => (
                            <button
                                key={e}
                                onClick={() =>
                                    onReact(post.$id, post.reactions, e)
                                }
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border transition-all ${
                                    post.reactions[e]?.includes(currentUserId)
                                        ? "bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700"
                                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                }`}
                            >
                                {e}
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    {post.reactions[e].length}
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Action bar */}
                <div className="flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {/* Emoji picker */}
                    <div className="relative">
                        <button
                            onClick={() => setShowEmoji(v => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                                myEmoji
                                    ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >
                            {myEmoji ?? "👍"} React
                        </button>
                        <AnimatePresence>
                            {showEmoji && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 4 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                                    className="absolute bottom-full left-0 mb-2 flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2 shadow-xl z-10"
                                >
                                    {EMOJIS.map(e => (
                                        <button
                                            key={e}
                                            onClick={() => {
                                                onReact(
                                                    post.$id,
                                                    post.reactions,
                                                    e
                                                );
                                                setShowEmoji(false);
                                            }}
                                            className="text-xl hover:scale-125 transition-transform p-0.5"
                                        >
                                            {e}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Comments */}
                    <button
                        onClick={() => setShowComments(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <MessageCircle size={14} />
                        {post.commentCount > 0
                            ? `${post.commentCount} comment${post.commentCount !== 1 ? "s" : ""}`
                            : "Comment"}
                    </button>
                </div>
            </div>

            {/* Comments section */}
            <AnimatePresence initial={false}>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                    >
                        <CommentsSection
                            postId={post.$id}
                            departmentId={departmentId}
                            currentUserId={currentUserId}
                            currentUserName={currentUserName}
                            currentUserRole={currentUserRole}
                            canModerate={
                                currentUserRole === "rep" ||
                                currentUserRole === "assistant"
                            }
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

// ── FileAttachmentCard ────────────────────────────────────────────────────────

function FileAttachmentCard({
    fileId,
    mimeType,
    fileName,
    fileType,
    onPreview
}) {
    const viewUrl = getFileViewUrl(fileId);
    const downloadUrl = getFileDownloadUrl(fileId);

    const handlePreview = () =>
        onPreview({ fileId, mimeType, fileName: fileName || "Attachment" });

    if (fileType === "image") {
        return (
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <button
                    type="button"
                    onClick={handlePreview}
                    className="w-full block"
                >
                    <img
                        src={viewUrl}
                        alt={fileName || "Image attachment"}
                        className="w-full max-h-72 object-cover hover:opacity-95 transition-opacity"
                        loading="lazy"
                        onError={e => {
                            // If image fails to load, show placeholder
                            e.target.style.display = "none";
                            e.target.nextSibling?.classList.remove("hidden");
                        }}
                    />
                    {/* Fallback if image src fails */}
                    <div className="hidden p-8 flex items-center justify-center">
                        <Image size={32} className="text-slate-300" />
                    </div>
                </button>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                    <Image size={13} className="text-violet-500 shrink-0" />
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1">
                        {fileName || "Image"}
                    </span>
                    <button
                        type="button"
                        onClick={handlePreview}
                        className="p-1 rounded text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        title="View full size"
                    >
                        <Eye size={13} />
                    </button>
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                        title="Download"
                        onClick={e => e.stopPropagation()}
                    >
                        <Download size={13} />
                    </a>
                </div>
            </div>
        );
    }

    if (fileType === "pdf") {
        return (
            <button
                type="button"
                onClick={handlePreview}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-left"
            >
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400 truncate">
                        {fileName || "PDF Document"}
                    </p>
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 mt-0.5">
                        PDF · Tap to view
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <div className="p-1.5 rounded-lg text-red-400">
                        <Eye size={15} />
                    </div>
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                        title="Download"
                    >
                        <Download size={15} />
                    </a>
                </div>
            </button>
        );
    }

    // DOC or other
    return (
        <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
            <File size={18} className="text-slate-500 shrink-0" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate flex-1">
                {fileName || "Attachment"}
            </span>
            <Download size={15} className="text-slate-400 shrink-0" />
        </a>
    );
}

// ── CommentsSection ───────────────────────────────────────────────────────────

function CommentsSection({
    postId,
    departmentId,
    currentUserId,
    currentUserName,
    currentUserRole,
    canModerate
}) {
    const { comments, loading, add, remove } = useComments(postId);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async e => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        try {
            await add({
                departmentId,
                authorId: currentUserId,
                authorName: currentUserName,
                authorRole: currentUserRole ?? "student",
                content: text.trim()
            });
            setText("");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="px-5 py-4 flex flex-col gap-3 bg-slate-50/50 dark:bg-slate-800/30">
            {loading ? (
                <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            ) : comments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-1">
                    No comments yet — be the first
                </p>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {comments.map(c => (
                        <div
                            key={c.$id}
                            className="flex items-start gap-2.5 group"
                        >
                            <Avatar name={c.authorName} size="xs" />
                            <div className="flex-1 min-w-0 bg-white dark:bg-slate-900 rounded-2xl rounded-tl-sm px-3 py-2 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                    <span className="text-xs font-semibold">
                                        {c.authorName}
                                    </span>
                                    {c.authorRole !== "student" && (
                                        <span
                                            className={`text-[10px] font-bold px-1 py-0.5 rounded-full capitalize ${roleBadge(c.authorRole)}`}
                                        >
                                            {c.authorRole}
                                        </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 ml-auto">
                                        {formatTime(c.$createdAt)}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {c.content}
                                </p>
                            </div>
                            {(c.authorId === currentUserId || canModerate) && (
                                <button
                                    onClick={() => remove(c.$id)}
                                    className="p-1 rounded-lg text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all shrink-0 mt-0.5"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSend} className="flex items-center gap-2">
                <Avatar name={currentUserName} size="xs" />
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Write a comment…"
                    maxLength={500}
                    className="flex-1 px-3 py-2 rounded-full text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                />
                <button
                    type="submit"
                    disabled={!text.trim() || sending}
                    className="w-8 h-8 rounded-full bg-primary-700 hover:bg-primary-600 flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
                >
                    {sending ? (
                        <Loader2
                            size={13}
                            className="animate-spin text-white"
                        />
                    ) : (
                        <Send size={13} className="text-white" />
                    )}
                </button>
            </form>
        </div>
    );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name, size = "sm" }) {
    const initials = (name ?? "?")[0].toUpperCase();
    const sizes = { xs: "w-7 h-7 text-xs", sm: "w-9 h-9 text-sm" };
    return (
        <div
            className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center shrink-0`}
        >
            <span className="text-white font-bold">{initials}</span>
        </div>
    );
}
