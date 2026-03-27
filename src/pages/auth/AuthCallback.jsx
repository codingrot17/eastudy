import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    createUserProfile
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    useEffect(() => {
        const handle = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    navigate("/auth/login");
                    return;
                }

                let profile = await getUserProfile(user.$id);

                if (!profile) {
                    // New Google user — send to complete rep signup
                    // (student flow will have its own OAuth callback later)
                    navigate("/auth/rep/signup?oauth=true");
                    return;
                }

                // Returning user — load department if needed
                let department = null;
                if (profile.role === "rep" || profile.role === "assistant") {
                    department = await getDepartmentByRepId(user.$id);
                }

                setAuth(user, profile, department);

                // Existing user — route by role
                navigate(`/dashboard/${profile.role}`);
            } catch {
                navigate("/auth/login");
            }
        };
        handle();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
            <div className="w-8 h-8 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
        </div>
    );
}
