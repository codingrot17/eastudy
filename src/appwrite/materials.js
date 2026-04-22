import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const MATERIALS_ID = import.meta.env
    .VITE_APPWRITE_MATERIALS_COLLECTION_ID;

/**
 * Fetch all materials for a department, newest first.
 */
export const getMaterials = async departmentId => {
    const res = await databases.listDocuments(DB_ID, MATERIALS_ID, [
        Query.equal("departmentId", departmentId),
        Query.orderDesc("$createdAt"),
        Query.limit(100)
    ]);
    return res.documents;
};

/**
 * Create a material — supports both link-only and file-upload sources.
 *
 * For a link:  pass { url, sourceType: "link" }
 * For a file:  pass { fileId, mimeType, fileName, sourceType: "file" }
 *
 * Old materials without sourceType are treated as "link" in the UI.
 */
export const createMaterial = async ({
    title,
    url = null,
    category,
    departmentId,
    repId,
    // File upload fields (all nullable for backwards compat)
    fileId = null,
    mimeType = null,
    fileName = null,
    sourceType = "link"
}) => {
    return await databases.createDocument(DB_ID, MATERIALS_ID, ID.unique(), {
        title,
        url,
        category,
        departmentId,
        repId,
        fileId,
        mimeType,
        fileName,
        sourceType
    });
};

/**
 * Delete a material document.
 * NOTE: Caller is responsible for also deleting the storage file if
 * material.sourceType === "file". See useMaterials.js remove().
 */
export const deleteMaterial = async materialId => {
    return await databases.deleteDocument(DB_ID, MATERIALS_ID, materialId);
};
