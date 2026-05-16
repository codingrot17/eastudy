import { create } from "zustand";
import { getCurrentUser } from "../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../appwrite/department";

const useAuthStore = create((set, get) => ({
    user: null,
    profile: null,
    department: null,
    isLoading: false,
    isHydrated: false,
    _hydrating: false, // internal guard — prevents concurrent hydration calls

    hydrate: async () => {
        const { _hydrating, isHydrated } = get();

        // Prevent double-fire from StrictMode or multiple callers.
        // If already hydrated (e.g. after setAuth from signup flow), skip.
        if (_hydrating || isHydrated) return;

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
            // Network failure, Appwrite down, etc. — always resolve so
            // ProtectedRoute doesn't spin forever. User lands on login.
            console.warn("[AuthStore] Hydration error:", err?.message);
            set({ user: null, profile: null, department: null });
        } finally {
            // Always mark hydrated, even on error — ProtectedRoute depends on this
            set({ isLoading: false, isHydrated: true, _hydrating: false });
        }
    },

    // Called after signup/OAuth flows that already have user data in hand.
    // Sets isHydrated: true so ProtectedRoute never gets stuck on spinner.
    setAuth: (user, profile, department = null) => {
        set({
            user,
            profile,
            department,
            isHydrated: true,
            isLoading: false,
            _hydrating: false
        });
    },

    setDepartment: department => {
        set({ department });
    },

    // Reset everything including hydration state so the next login
    // triggers a fresh hydrate() call rather than being skipped.
    clear: () => {
        set({
            user: null,
            profile: null,
            department: null,
            isHydrated: false,
            isLoading: false,
            _hydrating: false
        });
    }
}));

export default useAuthStore;
