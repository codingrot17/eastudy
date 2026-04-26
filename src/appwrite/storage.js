import { Storage, ID } from "appwrite";
import { client } from "./config";

export const storage = new Storage(client);

export const BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID;

// Strip trailing slash once so every URL helper is safe
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
    "image/webp"
];
export const ALLOWED_EXT = ["pdf", "jpg", "jpeg", "png", "webp"];

/**
 * Upload a file to Appwrite Storage and return the file document.
 * Validates size and type before uploading.
 */
export async function uploadFile(file) {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error("File too large. Maximum size is 10 MB.");
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            "File type not supported. Please upload a PDF or image (JPG, PNG, WebP)."
        );
    }
    return await storage.createFile(BUCKET_ID, ID.unique(), file);
}

/**
 * Get a direct view URL for a file.
 * Works for both images and PDFs — use in <img src> or <iframe src>.
 */
export function getFileViewUrl(fileId) {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`;
}

/**
 * Get a download URL for a file.
 * Triggers browser download when opened.
 */
export function getFileDownloadUrl(fileId) {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/download?project=${PROJECT_ID}`;
}

/**
 * Delete a file from Appwrite Storage.
 */
export async function deleteFile(fileId) {
    return await storage.deleteFile(BUCKET_ID, fileId);
}

/**
 * Derive a simple file type string from a MIME type.
 * Returns "pdf", "image", or "other".
 */
export function getFileType(mimeType) {
    if (!mimeType) return "other";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("image/")) return "image";
    return "other";
}

/**
 * Format bytes into a human-readable string (e.g. "3.2 MB").
 */
export function formatFileSize(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
