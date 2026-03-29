import { useNavigate, Link } from "react-router-dom";
import {
    BookOpen,
    Copy,
    Check,
    LogOut,
    Users,
    Megaphone,
    CalendarDays,
    ClipboardList,
    Lightbulb,
    Settings
} from "lucide-react";
import { useState } from "react";
import { logout } from "../../appwrite/auth";
import useAuthStore from "../../store/useAuthStore";
import useThemeStore from "../../store/useThemeStore";
import ThemeToggle from "../../components/ui/ThemeToggle";

const quickLinks = [
    {
        icon: Megaphone,
        label: "Announcements",
        href: "#",
        color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
    },
    {
        icon: CalendarDays,
        label: "Class Schedule",
        href: "#",
        color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
    },
    {
        icon: BookOpen,
        label: "Study Materials",
        href: "#",
        color: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400"
    },
    {
        icon: ClipboardList,
        label: "Quizzes",
        href: "#",
        color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
    },
    {
        icon: Users,
        label: "Group Study",
        href: "#",
        color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
    },
    {
        icon: Lightbulb,
        label: "Study Plans",
        href: "#",
        color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400"
    }
];

export default function RepDashboard() {
    const navigate = useNavigate();
    const { user, profile, department, clear } = useAuthStore();
    const [copied, setCopied] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const copyCode = () => {
        if (!department?.code) return;
        navigator.clipboard.writeText(department.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            clear();
            navigate("/");
        } catch {
            setLoggingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Topbar */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                            <BookOpen size={16} className="text-white" />
                        </div>
                        <span className="font-bold text-lg">Eastudy</span>
                        <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                            Rep
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">
                                {loggingOut ? "Signing out..." : "Sign Out"}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-primary-200 text-sm font-medium mb-1">
                            Welcome back
                        </p>
                        <h1 className="text-2xl font-extrabold">
                            {user?.name?.split(" ")[0] ?? "Rep"} 👋
                        </h1>
                        {department && (
                            <p className="text-primary-200 text-sm mt-1">
                                {department.name} · {department.level} ·{" "}
                                {department.session}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col gap-1 sm:items-end">
                        <p className="text-primary-200 text-xs font-medium uppercase tracking-widest">
                            Department Code
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-extrabold font-mono tracking-widest">
                                {department?.code ?? "—"}
                            </span>
                            <button
                                onClick={copyCode}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                                title="Copy code"
                            >
                                {copied ? (
                                    <Check
                                        size={16}
                                        className="text-green-300"
                                    />
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        {
                            label: "Students",
                            value: department?.studentCount ?? "—",
                            icon: Users
                        },
                        { label: "Announcements", value: "0", icon: Megaphone },
                        { label: "Materials", value: "0", icon: BookOpen }
                    ].map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col gap-2"
                        >
                            <Icon
                                size={18}
                                className="text-primary-700 dark:text-primary-400"
                            />
                            <p className="text-2xl font-extrabold">{value}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quick Links */}
                <div>
                    <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {quickLinks.map(
                            ({ icon: Icon, label, href, color }) => (
                                <Link
                                    key={label}
                                    to={href}
                                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200 flex flex-col gap-3"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
                                    >
                                        <Icon size={20} />
                                    </div>
                                    <span className="font-semibold text-sm">
                                        {label}
                                    </span>
                                </Link>
                            )
                        )}
                    </div>
                </div>

                {/* Coming Soon Notice */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center flex flex-col items-center gap-3">
                    <Settings
                        size={32}
                        className="text-slate-300 dark:text-slate-600"
                    />
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        Dashboard features coming soon
                    </p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
                        Announcements, study materials, class schedules, and
                        more are being built. Your department code is ready to
                        share now.
                    </p>
                </div>
            </main>
        </div>
    );
}
