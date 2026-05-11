import { Storage, ID } from "appwrite";
import { client } from "./config";

export const storage = new Storage(client);

export const BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

const ENDPOINT = (import.meta.env.VITE_APPWRITE_ENDPOINT || "").replace(
    /\/$/,
    ""
);
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const ALLOWED_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    // DOC support
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "webp", "doc", "docx"];

export async function uploadFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`
        );
    }
    // Check by MIME or extension fallback (some Android browsers misreport MIME)
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeOk = ALLOWED_TYPES.includes(file.type);
    const extOk = ALLOWED_EXT.includes(ext);

    if (!mimeOk && !extOk) {
        throw new Error(
            "File type not supported. Upload a PDF, image (JPG, PNG, WebP), or Word doc."
        );
    }

    // Normalise MIME for Word docs that Android reports incorrectly
    const effectiveMime = mimeOk ? file.type : getMimeFromExt(ext);

    const fileDoc = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return { ...fileDoc, mimeType: effectiveMime, fileName: file.name };
}

function getMimeFromExt(ext) {
    const map = {
        pdf: "application/pdf",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    return map[ext] ?? "application/octet-stream";
}

export function getFileViewUrl(fileId) {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

export function getFilePreviewUrl(fileId, width = 800) {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/preview?width=${width}&project=${PROJECT_ID}`;
}
export function getFileDownloadUrl(fileId) {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${PROJECT_ID}`;
}

export async function deleteFile(fileId) {
    return await storage.deleteFile(BUCKET_ID, fileId);
}

export function getFileType(mimeType) {
    if (!mimeType) return "other";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.includes("word") || mimeType.includes("document"))
        return "doc";
    return "other";
}

export function formatFileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
