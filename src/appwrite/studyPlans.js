import { databases, DB_ID } from "./config";
import { ID, Query } from "appwrite";

export const STUDY_PLANS_ID = import.meta.env
    .VITE_APPWRITE_STUDY_PLANS_COLLECTION_ID;

function parsePlan(doc) {
    let items = [];
    try {
        items = JSON.parse(doc.items || "[]");
    } catch {}
    return { ...doc, items };
}

export async function getMyPlans(departmentId, ownerId) {
    const res = await databases.listDocuments(DB_ID, STUDY_PLANS_ID, [
        Query.equal("departmentId", departmentId),
        Query.equal("ownerId", ownerId),
        Query.orderDesc("$createdAt"),
        Query.limit(50)
    ]);
    return res.documents.map(parsePlan);
}

export async function getSharedPlans(departmentId) {
    const res = await databases.listDocuments(DB_ID, STUDY_PLANS_ID, [
        Query.equal("departmentId", departmentId),
        Query.equal("scope", "shared"),
        Query.orderDesc("$createdAt"),
        Query.limit(50)
    ]);
    return res.documents.map(parsePlan);
}

export async function createPlan({
    departmentId,
    ownerId,
    ownerName,
    scope,
    title
}) {
    return await databases.createDocument(DB_ID, STUDY_PLANS_ID, ID.unique(), {
        departmentId,
        ownerId,
        ownerName,
        scope: scope || "personal",
        title,
        items: "[]"
    });
}

export async function updatePlanItems(planId, items) {
    return await databases.updateDocument(DB_ID, STUDY_PLANS_ID, planId, {
        items: JSON.stringify(items)
    });
}

export async function renamePlan(planId, title) {
    return await databases.updateDocument(DB_ID, STUDY_PLANS_ID, planId, {
        title
    });
}

export async function deletePlan(planId) {
    return await databases.deleteDocument(DB_ID, STUDY_PLANS_ID, planId);
}
