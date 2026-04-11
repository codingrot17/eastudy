import { useState, useEffect, useCallback } from "react";
import { client, DB_ID } from "../appwrite/config";
import {
    getMaterials,
    createMaterial,
    deleteMaterial,
    MATERIALS_ID
} from "../appwrite/materials";

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
            }
            if (event.events.some(e => e.includes("delete"))) {
                setMaterials(prev => prev.filter(m => m.$id !== doc.$id));
            }
        });

        return () => unsubscribe();
    }, [departmentId, fetch]);

    const add = async ({ title, url, category, repId }) => {
        return await createMaterial({
            title,
            url,
            category,
            departmentId,
            repId
        });
    };

    const remove = async id => {
        await deleteMaterial(id);
        setMaterials(prev => prev.filter(m => m.$id !== id));
    };

    return { materials, loading, error, add, remove, refresh: fetch };
}
