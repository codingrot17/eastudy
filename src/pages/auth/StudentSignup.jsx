import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Check,
    Search
} from "lucide-react";
import {
    createAccount,
    loginGoogle,
    loginGoogleAsStudent,
    getCurrentUser
} from "../../appwrite/auth";
import {
    getDepartmentByCode,
    createUserProfile,
    getUserProfile
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";
import ThemeToggle from "../../components/ui/ThemeToggle";
import Button from "../../components/ui/Button";

const fadeSlide = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2 } }
};

export default function StudentSignup() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [searchParams] = useSearchParams();
    const isOAuth = searchParams.get("oauth") === "true";

    const [step, setStep] = useState(isOAuth ? 2 : 1);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [oauthUser, setOauthUser] = useState(null);

    // Department lookup state
    const [code, setCode] = useState("");
    const [lookupStatus, setLookupStatus] = useState("idle"); // idle | searching | found | notfound
    const [foundDept, setFoundDept] = useState(null);

    // Step 1 form
    const [personal, setPersonal] = useState({
        name: "",
        email: "",
        password: "",
        confirm: ""
    });

    // Fetch Google user on OAuth flow
    useEffect(() => {
        if (!isOAuth) return;
        const fetch = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    navigate("/auth/student/signup");
                    return;
                }

                // Check if profile already exists (returning user)
                const profile = await getUserProfile(user.$id);
                if (profile) {
                    navigate(`/dashboard/${profile.role}`);
                    return;
                }

                setOauthUser(user);
            } catch {
                navigate("/auth/student/signup");
            }
        };
        fetch();
    }, [isOAuth]);

    // ── Handlers ─────────────────────────────────

    const handlePersonalChange = e =>
        setPersonal(p => ({ ...p, [e.target.name]: e.target.value }));

    // Step 1 submit — email/password account creation
    const handleStep1 = async e => {
        e.preventDefault();
        setError("");

        if (personal.password !== personal.confirm) {
            setError("Passwords do not match.");
            return;
        }
        if (personal.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setStatus("loading");
        try {
            console.log(
                "Attempting signup with:",
                personal.email,
                "pwd length:",
                personal.password.length
            );
            await createAccount(
                personal.name,
                personal.email,
                personal.password
            );
            const { loginEmail } = await import("../../appwrite/auth");
            await loginEmail(personal.email, personal.password);
            setStep(2);
        } catch (err) {
            const code = err?.code ?? err?.status;
            if (code == 409 || err?.message?.toLowerCase().includes("unique")) {
                setError(
                    "An account with this email already exists. Try signing in instead."
                );
            } else if (code == 429) {
                setError(
                    "Too many attempts. Please wait a moment and try again."
                );
            } else {
                // Log the actual error so you can see what's happening
                console.error(
                    "Signup error:",
                    err?.code,
                    err?.type,
                    err?.message
                );
                setError(
                    err?.message || "Something went wrong. Please try again."
                );
            }
        } finally {
            setStatus("idle");
        }
    };

    // Code lookup — search on input change with debounce feel
    const handleCodeLookup = async () => {
        if (!code.trim() || code.trim().length < 6) return;
        setLookupStatus("searching");
        setFoundDept(null);
        setError("");

        try {
            const dept = await getDepartmentByCode(code);
            if (dept) {
                setFoundDept(dept);
                setLookupStatus("found");
            } else {
                setLookupStatus("notfound");
            }
        } catch {
            setLookupStatus("notfound");
        }
    };

    // Step 2 submit — link to department
    const handleStep2 = async e => {
        e.preventDefault();
        setError("");

        if (!foundDept) {
            setError("Please verify your department code first.");
            return;
        }

        setStatus("loading");
        try {
            const user = oauthUser ?? (await getCurrentUser());
            if (!user)
                throw new Error("Session expired. Please sign in again.");

            const profile = await createUserProfile({
                authId: user.$id,
                name: user.name,
                email: user.email,
                role: "student",
                departmentId: foundDept.$id
            });

            setAuth(user, profile, null);
            navigate("/dashboard/student");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setStatus("idle");
        }
    };

    // ── UI ───────────────────────────────────────

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
                <div className="w-full max-w-md">
                    {/* Step Indicator */}
                    {step < 3 && (
                        <div className="flex items-center gap-2 mb-8">
                            {[1, 2].map(s => (
                                <div
                                    key={s}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                            step >= s
                                                ? "bg-primary-700 text-white"
                                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                        }`}
                                    >
                                        {s}
                                    </div>
                                    {s < 2 && (
                                        <div
                                            className={`h-0.5 w-12 transition-all ${
                                                step > s
                                                    ? "bg-primary-700"
                                                    : "bg-slate-200 dark:bg-slate-700"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
                                {step === 1
                                    ? "Personal info"
                                    : "Enter class code"}
                            </span>
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* ── Step 1: Personal Info ── */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                variants={fadeSlide}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <h1 className="text-3xl font-extrabold mb-2">
                                    Join your class
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    Create your student account. You'll enter
                                    your class code next.
                                </p>

                                {/* Google OAuth */}
                                <button
                                    onClick={loginGoogleAsStudent}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition font-medium mb-6"
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 48 48"
                                    >
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
                                    onSubmit={handleStep1}
                                    className="flex flex-col gap-4"
                                >
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Full name"
                                        value={personal.name}
                                        onChange={handlePersonalChange}
                                        required
                                        className="input-field"
                                    />
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="Email address"
                                        value={personal.email}
                                        onChange={handlePersonalChange}
                                        required
                                        className="input-field"
                                    />
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="Password (min 8 chars)"
                                        value={personal.password}
                                        onChange={handlePersonalChange}
                                        required
                                        className="input-field"
                                    />
                                    <input
                                        name="confirm"
                                        type="password"
                                        placeholder="Confirm password"
                                        value={personal.confirm}
                                        onChange={handlePersonalChange}
                                        required
                                        className="input-field"
                                    />

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
                                        {status === "loading" ? (
                                            "Creating account..."
                                        ) : (
                                            <>
                                                Continue{" "}
                                                <ArrowRight
                                                    size={18}
                                                    className="ml-2"
                                                />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                                    Already have an account?{" "}
                                    <Link
                                        to="/auth/login"
                                        className="text-primary-700 dark:text-primary-400 font-medium hover:underline"
                                    >
                                        Sign in
                                    </Link>
                                </p>
                            </motion.div>
                        )}

                        {/* ── Step 2: Code Entry ── */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={fadeSlide}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                {!isOAuth && (
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition"
                                    >
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                )}

                                <h1 className="text-3xl font-extrabold mb-2">
                                    Enter your class code
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    Your class rep shared a unique code with
                                    you. Enter it below to join your department.
                                </p>

                                <form
                                    onSubmit={handleStep2}
                                    className="flex flex-col gap-4"
                                >
                                    {/* Code Input + Verify */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="e.g. LASU-CS300-X7K2"
                                            value={code}
                                            onChange={e => {
                                                setCode(
                                                    e.target.value.toUpperCase()
                                                );
                                                setLookupStatus("idle");
                                                setFoundDept(null);
                                            }}
                                            className="input-field flex-1 font-mono tracking-wider uppercase"
                                            maxLength={20}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleCodeLookup}
                                            disabled={
                                                lookupStatus === "searching" ||
                                                !code.trim()
                                            }
                                            className="px-4 py-3 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                                        >
                                            {lookupStatus === "searching" ? (
                                                <Loader2
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            ) : (
                                                <Search size={16} />
                                            )}
                                            Verify
                                        </button>
                                    </div>

                                    {/* Department Preview */}
                                    {lookupStatus === "found" && foundDept && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-accent-500/5 border border-accent-500/30 rounded-2xl p-4 flex flex-col gap-2"
                                        >
                                            <div className="flex items-center gap-2 text-accent-500 font-semibold text-sm">
                                                <Check size={16} />
                                                Department found
                                            </div>
                                            <p className="font-bold text-lg">
                                                {foundDept.name}
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                                    {foundDept.school}
                                                </span>
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                                    {foundDept.level}
                                                </span>
                                                <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                                    {foundDept.session}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {lookupStatus === "notfound" && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-red-500 text-sm text-center"
                                        >
                                            Code not found. Double-check with
                                            your class rep.
                                        </motion.p>
                                    )}

                                    {error && (
                                        <p className="text-red-500 text-sm text-center">
                                            {error}
                                        </p>
                                    )}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full mt-2"
                                        disabled={
                                            status === "loading" ||
                                            lookupStatus !== "found"
                                        }
                                    >
                                        {status === "loading" ? (
                                            <Loader2
                                                size={20}
                                                className="animate-spin mr-2"
                                            />
                                        ) : null}
                                        {status === "loading" ? (
                                            "Joining department..."
                                        ) : (
                                            <>
                                                Join Department{" "}
                                                <ArrowRight
                                                    size={18}
                                                    className="ml-2"
                                                />
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-slate-400 text-center">
                                        Don't have a code? Ask your class rep to
                                        share it with you.
                                    </p>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
