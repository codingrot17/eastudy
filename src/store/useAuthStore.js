import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getCurrentUser } from "../appwrite/auth";
import { getUserProfile, getDepartmentByRepId } from "../appwrite/department";

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null, // Appwrite auth user
            profile: null, // users collection doc
            department: null, // departments collection doc
            isLoading: false,
            isHydrated: false,

            // Load current session on app start
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

                    if (
                        profile?.role === "rep" ||
                        profile?.role === "assistant"
                    ) {
                        department = await getDepartmentByRepId(user.$id);
                    } else if (
                        profile?.role === "student" &&
                        profile?.departmentId
                    ) {
                        // Students load dept by ID
                        const { getDepartmentById } =
                            await import("../appwrite/department");
                        department = await getDepartmentById(
                            profile.departmentId
                        );
                    }

                    set({ user, profile, department });
                } catch {
                    set({ user: null, profile: null, department: null });
                } finally {
                    set({ isLoading: false, isHydrated: true });
                }
            },

            // Set after signup/login
            setAuth: (user, profile, department = null) => {
                set({ user, profile, department });
            },

            // Clear on logout
            clear: () => {
                set({ user: null, profile: null, department: null });
            }
        }),
        {
            name: "auth-storage",
            // Only persist minimal data - re-hydrate from Appwrite on load
            partialize: () => ({})
        }
    )
);

export default useAuthStore;
