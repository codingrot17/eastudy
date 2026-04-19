import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";

function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent.toLowerCase());
}

/**
 * Attempts to get the current Appwrite user with exponential backoff.
 *
 * @param {number} maxAttempts
 * @param {number} initialDelay - first delay in ms
 * @returns {Promise<object|null>} user object or null if all attempts fail
 */
async function getUserWithRetry(maxAttempts, initialDelay) {
    let delay = initialDelay;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(r => setTimeout(r, delay));
        try {
            const user = await getCurrentUser();
            if (user) return user;
        } catch {
            // getCurrentUser swallows errors and returns null, but just in case
        }
        // Cap at 8s so we don't wait forever on last retries
        delay = Math.min(delay * 2, 8000);
    }
    return null;
}

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type"); // "student" | null (rep)
    const [status, setStatus] = useState("Completing sign in...");
    const [showIOSHint, setShowIOSHint] = useState(false);

    useEffect(() => {
        const ios = isIOS();

        // Show "this may take a moment" hint after 3s on iOS
        // so users don't think it's frozen
        let hintTimer = null;
        if (ios) {
            hintTimer = setTimeout(() => setShowIOSHint(true), 3000);
        }

        const handle = async () => {
            // Initial pause before even trying — iOS needs this most
            const initialWait = ios ? 1500 : 800;
            await new Promise(r => setTimeout(r, initialWait));

            try {
                setStatus("Verifying your account...");

                // iOS: 6 attempts, starting at 1.5s (total budget ~14s)
                // Android/desktop: 3 attempts, starting at 800ms (total ~5s)
                const maxAttempts = ios ? 6 : 3;
                const initialDelay = ios ? 1500 : 800;

                const user = await getUserWithRetry(maxAttempts, initialDelay);

                if (!user) {
                    // All retries exhausted — genuinely no session
                    navigate("/auth/login?error=session");
                    return;
                }

                setStatus("Loading your profile...");
                const profile = await getUserProfile(user.$id);

                if (!profile) {
                    // Auth account exists but no Eastudy profile yet
                    if (type === "student") {
                        navigate("/auth/student/signup?oauth=true");
                    } else {
                        navigate("/auth/rep/signup?oauth=true");
                    }
                    return;
                }

                // ── Load department based on role ──────────────────────
                let department = null;

                if (profile.role === "rep") {
                    department = await getDepartmentByRepId(user.$id);
                } else if (
                    profile.role === "assistant" ||
                    profile.role === "student"
                ) {
                    if (profile.departmentId) {
                        department = await getDepartmentById(
                            profile.departmentId
                        );
                    }
                }

                setAuth(user, profile, department);
                navigate(`/dashboard/${profile.role}`, { replace: true });
            } catch (err) {
                console.error(
                    "[AuthCallback] Error:",
                    err?.message,
                    "code:",
                    err?.code
                );
                navigate("/auth/login?error=callback");
            } finally {
                if (hintTimer) clearTimeout(hintTimer);
            }
        };

        handle();

        return () => {
            if (hintTimer) clearTimeout(hintTimer);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-white dark:bg-slate-950 px-6">
            <img src="/favicon.svg" alt="Eastudy" className="w-14 h-14" />
            <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
            <div className="text-center max-w-xs">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {status}
                </p>
                {showIOSHint && (
                    <p className="text-xs text-slate-400 mt-2">
                        Safari needs a moment to verify your Google login. Hang
                        tight…
                    </p>
                )}
            </div>
        </div>
    );
}
