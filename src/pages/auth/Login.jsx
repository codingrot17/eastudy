import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    Loader2,
    Mail,
    AlertTriangle,
    ArrowRight,
    RefreshCw
} from "lucide-react";
import { loginEmail, loginGoogle, getCurrentUser } from "../../appwrite/auth";
import {
    getUserProfile,
    getDepartmentByRepId,
    getDepartmentById
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";
import ThemeToggle from "../../components/ui/ThemeToggle";
import Button from "../../components/ui/Button";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Login() {
    const [searchParams] = useSearchParams();
    const callbackError = searchParams.get("error");
    const message = searchParams.get("message");
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [form, setForm] = useState({ email: "", password: "" });
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    // When Google fails, show the recovery panel instead of the normal form
    const [showRecovery, setShowRecovery] = useState(
        callbackError === "session" || callbackError === "callback"
    );

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        setError("");
        setStatus("loading");
        try {
            await loginEmail(form.email, form.password);
            const user = await getCurrentUser();
            if (!user) {
                setError("Session couldn't be read. Please try again.");
                setStatus("idle");
                return;
            }
            const profile = await getUserProfile(user.$id);
            if (!profile) {
                navigate("/auth/rep/signup?oauth=true");
                return;
            }
            let department = null;
            if (profile.role === "rep") {
                department = await getDepartmentByRepId(user.$id);
            } else if (
                (profile.role === "assistant" || profile.role === "student") &&
                profile.departmentId
            ) {
                department = await getDepartmentById(profile.departmentId);
            }
            setAuth(user, profile, department);
            navigate(`/dashboard/${profile.role}`);
        } catch (err) {
            if (err?.code === 401) {
                setError("Invalid email or password.");
            } else if (err?.code === 429) {
                setError("Too many attempts. Please wait a moment.");
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

            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    className="w-full max-w-md"
                >
                    {/* ── Google auth failed — recovery panel ── */}
                    <AnimatePresence mode="wait">
                        {showRecovery ? (
                            <motion.div
                                key="recovery"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                className="flex flex-col gap-5"
                            >
                                {/* Icon + heading */}
                                <div className="flex flex-col items-center text-center gap-3 pt-4">
                                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                        <AlertTriangle
                                            size={28}
                                            className="text-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-extrabold">
                                            Google sign-in didn't work
                                        </h1>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xs mx-auto">
                                            This sometimes happens on iOS Safari
                                            and Chrome due to a browser
                                            limitation. Use one of these options
                                            to sign in instead.
                                        </p>
                                    </div>
                                </div>

                                {/* Option 1 — try Google again */}
                                <button
                                    onClick={loginGoogle}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                        <RefreshCw
                                            size={18}
                                            className="text-slate-500"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm">
                                            Try Google again
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Sometimes works on the second
                                            attempt
                                        </p>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-slate-400 shrink-0"
                                    />
                                </button>

                                {/* Option 2 — use email/password */}
                                <button
                                    onClick={() => setShowRecovery(false)}
                                    className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                                        <Mail
                                            size={18}
                                            className="text-primary-700 dark:text-primary-400"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-primary-900 dark:text-primary-200">
                                            Sign in with email & password
                                        </p>
                                        <p className="text-xs text-primary-700/70 dark:text-primary-400/70 mt-0.5">
                                            Recommended — works reliably on all
                                            devices
                                        </p>
                                    </div>
                                    <ArrowRight
                                        size={16}
                                        className="text-primary-600 dark:text-primary-400 shrink-0"
                                    />
                                </button>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                                    <span className="text-xs text-slate-400">
                                        don't have a password?
                                    </span>
                                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                                </div>

                                {/* Option 3 — create account with email */}
                                <div className="flex flex-col gap-2 text-center text-sm text-slate-500 dark:text-slate-400">
                                    <p>
                                        Rep without an account?{" "}
                                        <Link
                                            to="/auth/rep/signup"
                                            className="text-primary-700 dark:text-primary-400 font-semibold hover:underline"
                                        >
                                            Register with email
                                        </Link>
                                    </p>
                                    <p>
                                        Student joining a class?{" "}
                                        <Link
                                            to="/auth/student/signup"
                                            className="text-primary-700 dark:text-primary-400 font-semibold hover:underline"
                                        >
                                            Sign up with email
                                        </Link>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            /* ── Normal login form ── */
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -16 }}
                                className="flex flex-col gap-0"
                            >
                                <h1 className="text-3xl font-extrabold mb-2">
                                    Welcome back
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    Sign in to continue to your dashboard.
                                </p>

                                {message === "account-created" && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 mb-5">
                                        <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                            Account created! Sign in below to
                                            continue.
                                        </p>
                                    </div>
                                )}

                                {/* Google OAuth */}
                                <button
                                    onClick={loginGoogle}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium mb-6"
                                >
                                    <GoogleIcon />
                                    Continue with Google
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                    <span className="text-sm text-slate-400">
                                        or
                                    </span>
                                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                </div>

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
                                        {status === "loading"
                                            ? "Signing in..."
                                            : "Sign In"}
                                    </Button>
                                </form>

                                <div className="mt-8 flex flex-col gap-3 text-center text-sm text-slate-500 dark:text-slate-400">
                                    <p>
                                        Class rep without an account?{" "}
                                        <Link
                                            to="/auth/rep/signup"
                                            className="text-primary-700 dark:text-primary-400 font-medium hover:underline"
                                        >
                                            Register your department
                                        </Link>
                                    </p>
                                    <p>
                                        Student joining a class?{" "}
                                        <Link
                                            to="/auth/student/signup"
                                            className="text-primary-700 dark:text-primary-400 font-medium hover:underline"
                                        >
                                            Join with your code
                                        </Link>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 48 48">
            <path
                fill="#FFC107"
                d="M43.6 20H24v8h11.3C33.7 33.6 29.3 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 6 1.1 8.1 3l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.6 20-21 0-1.3-.2-2.7-.4-4z"
            />
            <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 6 1.1 8.1 3l5.7-5.7C34.6 5.1 29.6 3 24 3c-7.6 0-14.2 4.1-17.7 10.3z"
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
    );
}
