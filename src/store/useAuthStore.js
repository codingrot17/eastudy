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
                        set({
                            user: null,
                            profile: null,
                            department: null,
                            isHydrated: true // ← always mark hydrated even when no session
                        });
                        return;
                    }

                    const profile = await getUserProfile(user.$id);
                    let department = null;

                    if (profile?.role === "rep") {
                        department = await getDepartmentByRepId(user.$id);
                    } else if (profile?.role === "assistant") {
                        if (profile?.departmentId) {
                            const { getDepartmentById } =
                                await import("../appwrite/department");
                            department = await getDepartmentById(
                                profile.departmentId
                            );
                        }
                    } else if (
                        profile?.role === "student" &&
                        profile?.departmentId
                    ) {
                        const { getDepartmentById } =
                            await import("../appwrite/department");
                        department = await getDepartmentById(
                            profile.departmentId
                        );
                    }

                    set({ user, profile, department });
                } catch (err) {
                    console.warn("[AuthStore] Hydration error:", err?.message);
                    // ← CRITICAL FIX: isHydrated MUST be true here so
                    // ProtectedRoute and PwaStart don't spin forever
                    set({
                        user: null,
                        profile: null,
                        department: null,
                        isHydrated: true
                    });
                } finally {
                    // finally always runs — sets isLoading false and
                    // ensures isHydrated is true even if catch already set it
                    set({ isLoading: false, isHydrated: true });
                }
            },

            // Set after signup / login
            setAuth: (user, profile, department = null) => {
                set({ user, profile, department });
            },

            // Update department in place (used by SettingsTab after assign/remove)
            setDepartment: department => {
                set({ department });
            },

            // Clear on logout
            clear: () => {
                set({
                    user: null,
                    profile: null,
                    department: null
                });
            }
        }),
        {
            name: "auth-storage",
            // Don't persist anything — re-hydrate from Appwrite on every load
            partialize: () => ({})
        }
    )
);

export default useAuthStore;
