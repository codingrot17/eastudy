import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const VALID_ROLES = ["rep", "assistant", "student"];

/**
 * ProtectedRoute
 *
 * Guards a route behind auth + optional role check.
 *
 * Fixes applied:
 * 1. Waits for isHydrated before deciding — no flicker to login on refresh
 * 2. Guards against corrupt profile.role values to prevent redirect loops
 * 3. Shows a branded spinner while hydrating (not a blank screen)
 */
export default function ProtectedRoute({ children, role }) {
    const { user, profile, isLoading, isHydrated } = useAuthStore();

    // Still checking session — show spinner
    if (!isHydrated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // No session at all — go to login
    if (!user || !profile) {
        return <Navigate to="/auth/login" replace />;
    }

    // Guard against a corrupt role value (e.g. empty string, undefined, typo)
    // This prevents an infinite redirect loop if profile.role is invalid
    if (!VALID_ROLES.includes(profile.role)) {
        console.error("[ProtectedRoute] Unrecognised role:", profile.role);
        return <Navigate to="/auth/login" replace />;
    }

    // Role mismatch — send them to their correct dashboard
    if (role && profile.role !== role) {
        return <Navigate to={`/dashboard/${profile.role}`} replace />;
    }

    return children;
}
