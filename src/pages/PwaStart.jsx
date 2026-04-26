import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

/**
 * PwaStart — the PWA's start_url target (/pwa-start).
 *
 * Waits for the auth store to finish hydrating (checking the Appwrite
 * session), then routes the user to the right place:
 *   - Logged in  → their role-specific dashboard
 *   - Not logged in → /auth/login
 *
 * Includes an 8-second hard timeout so the app never spins forever
 * if the network is completely dead (common on mobile in Nigeria).
 */
export default function PwaStart() {
    const navigate = useNavigate();
    const { isHydrated, user, profile } = useAuthStore();

    // Two separate effects:
    // 1. Primary routing (watches isHydrated)
    useEffect(() => {
        if (!isHydrated) return;
        if (user && profile) {
            navigate(`/dashboard/${profile.role}`, { replace: true });
        } else {
            navigate("/auth/login", { replace: true });
        }
    }, [isHydrated, user, profile, navigate]);

    // 2. Timeout (runs once on mount only)
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate("/auth/login", { replace: true });
        }, 8000);
        return () => clearTimeout(timeout);
    }, []); // ← empty deps, runs once
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#1E1B4B]">
            <img src="/favicon.svg" alt="Eastudy" className="w-16 h-16" />
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/50 text-xs">Loading your dashboard...</p>
        </div>
    );
}
