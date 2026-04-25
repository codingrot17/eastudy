import { useState, useEffect, useCallback } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getMaterials,
    createMaterial,
    deleteMaterial,
    MATERIALS_ID
} from "../appwrite/materials";
import { deleteFile } from "../appwrite/storage";
import { fireNotif } from "../utils/notify";

export function useMaterials(departmentId) {
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(async () => {
        if (!departmentId) return;
        setLoading(true);
        try {
            const docs = await getMaterials(departmentId);
            setMaterials(docs);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    // Real-time subscription
    useEffect(() => {
        if (!departmentId) return;
        fetch();

        const channel = `databases.${DB_ID}.collections.${MATERIALS_ID}.documents`;
        const unsubscribe = client.subscribe(channel, event => {
            const doc = event.payload;
            if (doc.departmentId !== departmentId) return;

            if (event.events.some(e => e.includes("create"))) {
                setMaterials(prev => [
                    doc,
                    ...prev.filter(m => m.$id !== doc.$id)
                ]);

                // Single notification — no duplicate
                fireNotif({
                    title: "📂 New Material Added",
                    body: `${doc.title} · ${doc.category}`,
                    tag: `material-${doc.$id}`,
                    url: "/dashboard/student"
                });
            }

            if (event.events.some(e => e.includes("delete"))) {
                setMaterials(prev => prev.filter(m => m.$id !== doc.$id));
            }
        });

        return () => unsubscribe();
    }, [departmentId, fetch]);

    /**
     * Add a material — supports both link and file source types.
     */
    const add = async ({
        title,
        url,
        category,
        repId,
        fileId = null,
        mimeType = null,
        fileName = null,
        sourceType = "link"
    }) => {
        return await createMaterial({
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
     * Delete a material and clean up its storage file if one exists.
     */
    const remove = async id => {
        const material = materials.find(m => m.$id === id);
        await deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m.$id !== id));

        if (material?.fileId) {
            deleteFile(material.fileId).catch(err => {
                console.warn(
                    "[useMaterials] Storage cleanup failed:",
                    err?.message
                );
            });
        }
    };

    return { materials, loading, error, add, remove, refresh: fetch };
}
