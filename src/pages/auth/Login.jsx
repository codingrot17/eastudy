import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { loginEmail, loginGoogle, getCurrentUser } from "../../appwrite/auth";
import { getUserProfile } from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";
import ThemeToggle from "../../components/ui/ThemeToggle";
import Button from "../../components/ui/Button";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Login() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [form, setForm] = useState({ email: "", password: "" });
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setStatus("loading");

        try {
            await loginEmail(form.email, form.password);
            const user = await getCurrentUser();
            const profile = await getUserProfile(user.$id);

            if (!profile) {
                // Logged in but no profile yet — edge case
                // Happens if account was created but signup wasn't completed
                navigate("/auth/rep/signup?oauth=true");
                return;
            }

            // Load department if rep
            let department = null;
            if (profile.role === "rep" || profile.role === "assistant") {
                const { getDepartmentById } =
                    await import("../../appwrite/department");
                department =
                    profile.role === "rep"
                        ? await getDepartmentByRepId(user.$id)
                        : await getDepartmentById(profile.departmentId);
            }
            
            setAuth(user, profile, department);
            navigate(`/dashboard/${profile.role}`);
        } catch (err) {
            if (err?.code === 401) {
                setError("Invalid email or password.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setStatus("idle");
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-lg">Eastudy</span>
                </Link>
                <ThemeToggle />
            </div>

            {/* Main */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-md"
                >
                    <h1 className="text-3xl font-extrabold mb-2">
                        Welcome back
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Sign in to continue to your dashboard.
                    </p>

                    {/* Google OAuth */}
                    <button
                        onClick={loginGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium mb-6"
                    >
                        <svg width="20" height="20" viewBox="0 0 48 48">
                            <path
                                fill="#FFC107"
                                d="M43.6 20H24v8h11.3C33.7 33.6 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.1 3l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.4-4z"
                            />
                            <path
                                fill="#FF3D00"
                                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 6 1.1 8.1 3l5.7-5.7C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.1-17.7 10.3-.1.1 0 .3.1.4z"
                            />
                            <path
                                fill="#4CAF50"
                                d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.7 36.4 27 37 24 37c-5.2 0-9.6-3.3-11.3-8H6.1v5.6C9.8 40.8 16.5 45 24 45z"
                            />
                            <path
                                fill="#1976D2"
                                d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.6 5.4C41.6 35.5 44 30.1 44 24c0-1.3-.2-2.7-.4-4z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                        <span className="text-sm text-slate-400">or</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    </div>

                    {/* Email Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >
                        <input
                            name="email"
                            type="email"
                            placeholder="Email address"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                        <div className="flex flex-col gap-1">
                            <input
                                name="password"
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                className="input-field"
                            />
                            <div className="flex justify-end">
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-xs text-primary-700 dark:text-primary-400 hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full mt-2"
                            disabled={status === "loading"}
                        >
                            {status === "loading" ? (
                                <Loader2
                                    size={20}
                                    className="animate-spin mr-2"
                                />
                            ) : null}
                            {status === "loading" ? "Signing in..." : "Sign In"}
                        </Button>
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 flex flex-col gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
                        <p>
                            Class rep without an account?
                            <Link
                                to="/auth/rep/signup"
                                className="text-primary-700 dark:text-primary-400 font-medium hover:underline"
                            >
                                Register your department
                            </Link>
                        </p>
                        <p>
                            Student joining a class?
                            <Link
                                to="/auth/student/signup"
                                className="text-primary-700 dark:text-primary-400 font-medium hover:underline"
                            >
                                Join with your code
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
