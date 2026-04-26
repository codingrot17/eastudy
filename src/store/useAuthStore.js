import { create } from "zustand";
import { getCurrentUser } from "../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../appwrite/department";

const useAuthStore = create(set => ({
    user: null,
    profile: null,
    department: null,
    isLoading: false,
    isHydrated: false,

    hydrate: async () => {
        set({ isLoading: true });
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
            set({ isLoading: false, isHydrated: true });
        }
    },

    setAuth: (user, profile, department = null) => {
        set({ user, profile, department });
    },

    setDepartment: department => {
        set({ department });
    },

    clear: () => {
        set({ user: null, profile: null, department: null });
    }
}));

export default useAuthStore;
