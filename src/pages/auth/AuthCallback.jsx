import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById // ← CRITICAL: was missing from imports
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type"); // "student" | null (rep)
    const [status, setStatus] = useState("Completing sign in...");

    useEffect(() => {
        const handle = async () => {
            // Give Appwrite's OAuth session time to settle.
            await new Promise(r => setTimeout(r, 1000));

            try {
                setStatus("Verifying your account...");

                // ── CRITICAL FIX: use `let` so the retry can reassign ──
                let user = await getCurrentUser();

                if (!user) {
                    // Session hasn't settled yet — wait longer and retry once
                    setStatus("Still loading, please wait...");
                    await new Promise(r => setTimeout(r, 2500));

                    // Reassign the SAME variable — not a new `const retry`
                    user = await getCurrentUser();

                    if (!user) {
                        // Genuinely no session — send back to login with context
                        navigate("/auth/login?error=session");
                        return;
                    }
                }

                setStatus("Loading your profile...");
                const profile = await getUserProfile(user.$id);

                if (!profile) {
                    // Authenticated but no profile doc — route to finish signup
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
                    // getDepartmentById is now properly imported above
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
                // Don't just drop to login without context
                navigate("/auth/login?error=callback");
            }
        };

        handle();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
            <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center px-6">
                {status}
            </p>
        </div>
    );
}
