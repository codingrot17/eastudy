import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function ProtectedRoute({ children, role }) {
    const { user, profile, isLoading, isHydrated } = useAuthStore();

    if (!isHydrated || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user || !profile) return <Navigate to="/auth/login" replace />;

    if (role && profile.role !== role) {
        return <Navigate to={`/dashboard/${profile.role}`} replace />;
    }

    return children;
}
