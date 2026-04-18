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
            // Give Appwrite session time to settle — critical on slow connections
            await new Promise(r => setTimeout(r, 800));

            try {
                setStatus("Verifying your account...");
                const user = await getCurrentUser();

                if (!user) {
                    // Session didn't settle yet — try once more after delay
                    await new Promise(r => setTimeout(r, 1500));
                    const retry = await getCurrentUser();
                    if (!retry) {
                        navigate("/auth/login?error=session");
                        return;
                    }
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
                console.error("AuthCallback error:", err?.message, err?.code);
                // Don't just go to login — give the user context
                navigate("/auth/login?error=callback");
            }
        };

        handle();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-950">
            <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {status}
            </p>
        </div>
    );
}
