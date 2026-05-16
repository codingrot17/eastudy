import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";

/**
 * Poll for a valid Appwrite session with exponential backoff.
 *
 * OAuth redirects don't guarantee the session cookie is readable
 * immediately — especially on slow Nigerian mobile connections.
 * Instead of a hardcoded 1.5s wait, we try up to `attempts` times
 * with increasing delays: 1.5s → 2.25s → 3.375s (capped at 4s).
 *
 * @param {number} attempts  - max retries (default 3)
 * @param {number} delayMs   - initial delay in ms (default 1500)
 * @returns {Promise<object|null>} Appwrite user or null
 */
async function pollForUser(attempts = 3, delayMs = 1500) {
    for (let i = 0; i < attempts; i++) {
        const user = await getCurrentUser();
        if (user) return user;
        if (i < attempts - 1) {
            await new Promise(r => setTimeout(r, delayMs));
            delayMs = Math.min(delayMs * 1.5, 4000);
        }
    }
    return null;
}

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const [status, setStatus] = useState("Completing sign in...");
    const handled = useRef(false);

    useEffect(() => {
        const handle = async () => {
            // Strict Mode mounts twice in dev — guard against double execution
            if (handled.current) return;
            handled.current = true;

            try {
                setStatus("Verifying your account...");

                // Poll instead of fixed-wait — handles slow mobile connections
                const user = await pollForUser();

                if (!user) {
                    navigate("/auth/login?error=session");
                    return;
                }

                setStatus("Loading your profile...");
                const profile = await getUserProfile(user.$id);

                if (!profile) {
                    if (type === "student") {
                        navigate("/auth/student/signup?oauth=true");
                    } else {
                        navigate("/auth/rep/signup?oauth=true");
                    }
                    return;
                }

                setStatus("Almost there...");

                let department = null;
                if (profile.role === "rep") {
                    department = await getDepartmentByRepId(user.$id);
                } else if (
                    (profile.role === "assistant" ||
                        profile.role === "student") &&
                    profile.departmentId
                ) {
                    department = await getDepartmentById(profile.departmentId);
                }

                // setAuth marks isHydrated:true so ProtectedRoute doesn't spin
                setAuth(user, profile, department);
                navigate(`/dashboard/${profile.role}`, { replace: true });
            } catch (err) {
                console.error("[AuthCallback]", err?.message);
                navigate("/auth/login?error=callback");
            }
        };

        handle();
    }, [navigate, type, setAuth]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
            <img src="/favicon.svg" alt="Eastudy" className="w-12 h-12" />
            <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-6">
                {status}
            </p>
        </div>
    );
}
