import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const MATERIALS_ID = import.meta.env
    .VITE_APPWRITE_MATERIALS_COLLECTION_ID;

export const getMaterials = async departmentId => {
    const res = await databases.listDocuments(DB_ID, MATERIALS_ID, [
        Query.equal("departmentId", departmentId),
        Query.orderDesc("$createdAt"),
        Query.limit(100)
    ]);
    return res.documents;
};

export const createMaterial = async ({
    title,
    url,
    category,
    departmentId,
    repId
}) => {
    return await databases.createDocument(DB_ID, MATERIALS_ID, ID.unique(), {
        title,
        url,
        category,
        departmentId,
        repId
    });
};

export const deleteMaterial = async materialId => {
    return await databases.deleteDocument(DB_ID, MATERIALS_ID, materialId);
};
