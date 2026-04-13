import { useState, useEffect, useCallback } from "react";
import {
    getMyPlans,
    getSharedPlans,
    createPlan,
    updatePlanItems,
    renamePlan,
    deletePlan
} from "../appwrite/studyPlans";

// tiny local nanoid — no package needed
function uid() {
    return Math.random().toString(36).slice(2, 10);
}

export function useStudyPlans(departmentId, userId, userRole, userName) {
    const [myPlans, setMyPlans] = useState([]);
    const [sharedPlans, setSharedPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const canShare = userRole === "rep" || userRole === "assistant";

    const load = useCallback(async () => {
        if (!departmentId || !userId) return;
        setLoading(true);
        try {
            const [mine, shared] = await Promise.all([
                getMyPlans(departmentId, userId),
                getSharedPlans(departmentId)
            ]);
            // Don't double-show shared plans the rep created in "My Plans"
            setMyPlans(mine.filter(p => p.scope === "personal"));
            setSharedPlans(shared);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [departmentId, userId]);

    useEffect(() => {
        load();
    }, [load]);

    const create = async ({ title, scope }) => {
        // optimistically update handled by reload
        const plan = await createPlan({
            departmentId,
            ownerId: userId,
            ownerName: userName || "", // resolved by caller
            scope: canShare ? scope || "personal" : "personal",
            title
        });
        await load();
        return plan;
    };

    const toggleItem = async (planId, itemId, plans, setPlans) => {
        const plan = plans.find(p => p.$id === planId);
        if (!plan) return;
        const updated = plan.items.map(it =>
            it.id === itemId ? { ...it, done: !it.done } : it
        );
        // Optimistic update
        setPlans(prev =>
            prev.map(p => (p.$id === planId ? { ...p, items: updated } : p))
        );
        await updatePlanItems(planId, updated);
    };

    const addItem = async (planId, text, dueDate, plans, setPlans) => {
        const plan = plans.find(p => p.$id === planId);
        if (!plan) return;
        const newItem = {
            id: uid(),
            text,
            done: false,
            dueDate: dueDate || null
        };
        const updated = [...plan.items, newItem];
        setPlans(prev =>
            prev.map(p => (p.$id === planId ? { ...p, items: updated } : p))
        );
        await updatePlanItems(planId, updated);
    };

    const removeItem = async (planId, itemId, plans, setPlans) => {
        const plan = plans.find(p => p.$id === planId);
        if (!plan) return;
        const updated = plan.items.filter(it => it.id !== itemId);
        setPlans(prev =>
            prev.map(p => (p.$id === planId ? { ...p, items: updated } : p))
        );
        await updatePlanItems(planId, updated);
    };

    const rename = async (planId, title, plans, setPlans) => {
        setPlans(prev =>
            prev.map(p => (p.$id === planId ? { ...p, title } : p))
        );
        await renamePlan(planId, title);
    };

    const remove = async planId => {
        setMyPlans(prev => prev.filter(p => p.$id !== planId));
        setSharedPlans(prev => prev.filter(p => p.$id !== planId));
        await deletePlan(planId);
    };

    // Curried helpers that bind to the right state
    const myPlanActions = {
        toggleItem: (planId, itemId) =>
            toggleItem(planId, itemId, myPlans, setMyPlans),
        addItem: (planId, text, dueDate) =>
            addItem(planId, text, dueDate, myPlans, setMyPlans),
        removeItem: (planId, itemId) =>
            removeItem(planId, itemId, myPlans, setMyPlans),
        rename: (planId, title) => rename(planId, title, myPlans, setMyPlans),
        remove
    };

    const sharedPlanActions = {
        toggleItem: (planId, itemId) =>
            toggleItem(planId, itemId, sharedPlans, setSharedPlans),
        addItem: (planId, text, dueDate) =>
            addItem(planId, text, dueDate, sharedPlans, setSharedPlans),
        removeItem: (planId, itemId) =>
            removeItem(planId, itemId, sharedPlans, setSharedPlans),
        rename: (planId, title) =>
            rename(planId, title, sharedPlans, setSharedPlans),
        remove
    };

    return {
        myPlans,
        sharedPlans,
        loading,
        error,
        canShare,
        create,
        refresh: load,
        myPlanActions,
        sharedPlanActions
    };
}
