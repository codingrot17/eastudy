import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * PwaStart — the PWA's start_url target.
 *
 * Waits for the auth store to finish hydrating (checking the Appwrite session),
 * then sends the user to the right place:
 *   - Logged in  → their dashboard
 *   - Not logged in → /auth/login
 *
 * Shows a minimal branded spinner while deciding.
 */
export default function PwaStart() {
    const navigate = useNavigate();
    const { isHydrated, user, profile } = useAuthStore();

    useEffect(() => {
        if (!isHydrated) return; // wait for hydrate() to finish

        if (user && profile) {
            navigate(`/dashboard/${profile.role}`, { replace: true });
        } else {
            navigate("/auth/login", { replace: true });
        }
    }, [isHydrated, user, profile]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#1E1B4B]">
            <img src="/favicon.svg" alt="Eastudy" className="w-16 h-16" />
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
    );
}
