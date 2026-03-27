import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen,
    ArrowRight,
    ArrowLeft,
    Copy,
    Check,
    Loader2
} from "lucide-react";
import {
    createAccount,
    loginGoogle,
    getCurrentUser
} from "../../appwrite/auth";
import {
    checkDepartmentExists,
    createDepartment,
    createUserProfile,
    generateCode
} from "../../appwrite/department";
import useAuthStore from "../../store/useAuthStore";
import useThemeStore from "../../store/useThemeStore";
import ThemeToggle from "../../components/ui/ThemeToggle";
import Button from "../../components/ui/Button";

const LEVELS = ["100L", "200L", "300L", "400L", "500L", "600L", "700L", "800L"];
const SESSIONS = ["2023/2024", "2024/2025", "2025/2026", "2026/2027"];

const fadeSlide = {
    hidden: { opacity: 0, x: 40 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -40, transition: { duration: 0.2 } }
};

export default function RepSignup() {
    const navigate = useNavigate();
    const { setAuth } = useAuthStore();

    const [searchParams] = useSearchParams();
    const isOAuth = searchParams.get("oauth") === "true";

    const [step, setStep] = useState(isOAuth ? 2 : 1);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [generatedCode, setGeneratedCode] = useState("");
    const [oauthUser, setOauthUser] = useState(null);

    // Step 1 fields
    const [personal, setPersonal] = useState({
        name: "",
        email: "",
        password: "",
        confirm: ""
    });

    // Step 2 fields
    const [dept, setDept] = useState({
        school: "",
        name: "",
        level: "300L",
        session: "2024/2025",
        studentCount: ""
    });

    // Fetch Google user info if coming from OAuth
    useEffect(() => {
        if (!isOAuth) return;
        const fetchOAuthUser = async () => {
            try {
                const user = await getCurrentUser();
                if (!user) {
                    navigate("/auth/rep/signup");
                    return;
                }
                setOauthUser(user);
            } catch {
                navigate("/auth/rep/signup");
            }
        };
        fetchOAuthUser();
    }, [isOAuth]);

    // ── Handlers ─────────────────────────────────

    const handlePersonalChange = e =>
        setPersonal(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleDeptChange = e =>
        setDept(d => ({ ...d, [e.target.name]: e.target.value }));

    // Step 1 → Step 2 (email/password)
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
            await createAccount(
                personal.name,
                personal.email,
                personal.password
            );
            // Auto login after account creation
            const { loginEmail } = await import("../../appwrite/auth");
            await loginEmail(personal.email, personal.password);
            setStep(2);
        } catch (err) {
            if (err?.code === 409) {
                setError("An account with this email already exists.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setStatus("idle");
        }
    };

    // Step 2 → Generate code & save
    const handleStep2 = async e => {
        e.preventDefault();
        setError("");
        setStatus("loading");

        try {
            const user = oauthUser ?? (await getCurrentUser());
            if (!user)
                throw new Error("Session expired. Please sign in again.");

            // Check duplicate
            const exists = await checkDepartmentExists(
                dept.school,
                dept.name,
                dept.level,
                dept.session
            );
            if (exists) {
                setError(
                    "This department is already registered. Contact your existing rep."
                );
                setStatus("idle");
                return;
            }

            // Generate unique code
            const code = generateCode(dept.school, dept.name, dept.level);

            // Save department
            const department = await createDepartment({
                ...dept,
                studentCount: parseInt(dept.studentCount) || 0,
                repId: user.$id,
                code
            });

            // Save user profile
            const profile = await createUserProfile({
                authId: user.$id,
                name: user.name,
                email: user.email,
                role: "rep",
                departmentId: department.$id
            });

            setAuth(user, profile, department);
            setGeneratedCode(code);
            setStep(3);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setStatus("idle");
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const goToDashboard = () => navigate("/dashboard/rep");

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
                                            className={`flex-1 h-0.5 w-12 transition-all ${
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
                                    : "Department info"}
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
                                    Create your account
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    Register as a Class Rep to set up your
                                    department.
                                </p>

                                {/* Google OAuth */}
                                <button
                                    onClick={loginGoogle}
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

                        {/* ── Step 2: Department Info ── */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                variants={fadeSlide}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition"
                                >
                                    <ArrowLeft size={16} /> Back
                                </button>

                                <h1 className="text-3xl font-extrabold mb-2">
                                    Set up your department
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    This info links your students to the right
                                    class automatically.
                                </p>

                                <form
                                    onSubmit={handleStep2}
                                    className="flex flex-col gap-4"
                                >
                                    <input
                                        name="school"
                                        type="text"
                                        placeholder="School name (e.g. Lagos State University)"
                                        value={dept.school}
                                        onChange={handleDeptChange}
                                        required
                                        className="input-field"
                                    />
                                    <input
                                        name="name"
                                        type="text"
                                        placeholder="Department name (e.g. Computer Science)"
                                        value={dept.name}
                                        onChange={handleDeptChange}
                                        required
                                        className="input-field"
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <select
                                            name="level"
                                            value={dept.level}
                                            onChange={handleDeptChange}
                                            className="input-field"
                                        >
                                            {LEVELS.map(l => (
                                                <option key={l} value={l}>
                                                    {l}
                                                </option>
                                            ))}
                                        </select>

                                        <select
                                            name="session"
                                            value={dept.session}
                                            onChange={handleDeptChange}
                                            className="input-field"
                                        >
                                            {SESSIONS.map(s => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <input
                                        name="studentCount"
                                        type="number"
                                        placeholder="Estimated number of students (optional)"
                                        value={dept.studentCount}
                                        onChange={handleDeptChange}
                                        min="1"
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
                                            "Creating department..."
                                        ) : (
                                            <>
                                                Register Department{" "}
                                                <ArrowRight
                                                    size={18}
                                                    className="ml-2"
                                                />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* ── Step 3: Success + Code ── */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                variants={fadeSlide}
                                initial="hidden"
                                animate="show"
                                className="text-center flex flex-col gap-6"
                            >
                                <div className="w-16 h-16 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <Check
                                        size={32}
                                        className="text-accent-500"
                                    />
                                </div>

                                <div>
                                    <h1 className="text-3xl font-extrabold mb-2">
                                        Department created!
                                    </h1>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Share this code with your students so
                                        they can join your department.
                                    </p>
                                </div>

                                {/* Code Display */}
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-medium">
                                        Your Department Code
                                    </p>
                                    <p className="text-3xl font-extrabold tracking-widest text-primary-700 dark:text-primary-400 font-mono mb-4">
                                        {generatedCode}
                                    </p>
                                    <button
                                        onClick={copyCode}
                                        className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                            copied
                                                ? "bg-accent-500/10 text-accent-500"
                                                : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                                        }`}
                                    >
                                        {copied ? (
                                            <>
                                                <Check size={16} /> Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} /> Copy Code
                                            </>
                                        )}
                                    </button>
                                </div>

                                <p className="text-sm text-slate-400">
                                    This code is also saved on your dashboard.
                                    You can share it anytime.
                                </p>

                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={goToDashboard}
                                >
                                    Go to Dashboard{" "}
                                    <ArrowRight size={18} className="ml-2" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
