import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();
    const [searchParams] = useSearchParams();
    const type = searchParams.get("type");
    const [status, setStatus] = useState("Completing sign in...");

    useEffect(() => {
        const handle = async () => {
            // Single 1.5s wait — enough for Android/desktop.
            // iOS Safari has a cookie sync issue we can't reliably fix,
            // so we fail fast and show a clear recovery screen.
            await new Promise(r => setTimeout(r, 1500));

            try {
                setStatus("Verifying your account...");
                let user = await getCurrentUser();

                // One retry after 2s if first attempt returns null
                if (!user) {
                    await new Promise(r => setTimeout(r, 2000));
                    user = await getCurrentUser();
                }

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

                setAuth(user, profile, department);
                navigate(`/dashboard/${profile.role}`, { replace: true });
            } catch (err) {
                console.error("[AuthCallback]", err?.message);
                navigate("/auth/login?error=callback");
            }
        };

        handle();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
