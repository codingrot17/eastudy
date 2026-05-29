import { create } from "zustand";
import { getCurrentUser } from "../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../appwrite/department";
import { clearAll } from "../appwrite/appwriteCache";

const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    department: null,
    isLoading: false,
    isHydrated: false,
    _hydrating: false,

    hydrate: async () => {
        const { _hydrating } = get();
        // Only block concurrent calls — NOT already-hydrated sessions.
        // After clear() the store resets isHydrated to false, so this
        // correctly allows re-hydration after logout + new login.
        if (_hydrating) return;

        set({ isLoading: true, _hydrating: true });

        try {
            const user = await getCurrentUser();

            if (!user) {
                set({ user: null, profile: null, department: null });
                return;
            }

            const profile = await getUserProfile(user.$id);
            let department = null;

            if (profile?.role === "rep") {
                department = await getDepartmentByRepId(user.$id);
            } else if (profile?.departmentId) {
                department = await getDepartmentById(profile.departmentId);
            }

            set({ user, profile, department });
        } catch (err) {
            console.warn("[AuthStore] Hydration error:", err?.message);
            set({ user: null, profile: null, department: null });
        } finally {
            set({ isLoading: false, isHydrated: true, _hydrating: false });
        }
    },

    setAuth: (user, profile, department = null) => {
        // Always do a full state reset before setting new auth.
        // This prevents stale old-user data bleeding through.
        set({
            user,
            profile,
            department,
            isHydrated: true,
            isLoading: false,
            _hydrating: false
        });
    },

    setDepartment: department => set({ department }),

    clear: () => {
        // Bust Appwrite in-memory cache so next user's hydrate()
        // fetches fresh data, not the previous user's cached profile.
        clearAll();
        set({
            user: null,
            profile: null,
            department: null,
            isHydrated: false, // ← allows hydrate() to re-run after new login
            isLoading: false,
            _hydrating: false
        });
    }
}));

export default useAuthStore;
