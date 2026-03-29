import {
    Users,
    Megaphone,
    FolderOpen,
    ClipboardList,
    Copy,
    Check,
    TrendingUp,
    ArrowRight
} from "lucide-react";
import { useState } from "react";

export default function HomeTab({ user, department, onTabChange }) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        if (!department?.code) return;
        navigator.clipboard.writeText(department.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const stats = [
        {
            label: "Students",
            value: department?.studentCount ?? "0",
            icon: Users,
            color: "text-cyan-500",
            bg: "bg-cyan-50 dark:bg-cyan-900/20"
        },
        {
            label: "Announcements",
            value: "0",
            icon: Megaphone,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20"
        },
        {
            label: "Materials",
            value: "0",
            icon: FolderOpen,
            color: "text-violet-500",
            bg: "bg-violet-50 dark:bg-violet-900/20"
        },
        {
            label: "Quizzes",
            value: "0",
            icon: ClipboardList,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        }
    ];

    const quickActions = [
        {
            label: "Post Announcement",
            tab: "announcements",
            color: "from-indigo-500 to-primary-700"
        },
        {
            label: "Add Material",
            tab: "materials",
            color: "from-violet-500 to-purple-700"
        },
        {
            label: "Set Schedule",
            tab: "schedule",
            color: "from-cyan-500 to-blue-600"
        },
        {
            label: "Create Quiz",
            tab: "quizzes",
            color: "from-amber-400 to-orange-500"
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-primary-700 to-cyan-600 rounded-2xl p-6 text-white">
                {/* Background decoration */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/5 rounded-full" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium mb-1">
                            Good {getGreeting()}, Rep 👋
                        </p>
                        <h1 className="text-2xl md:text-3xl font-extrabold">
                            {user?.name?.split(" ")[0] ?? "Rep"}
                        </h1>
                        {department && (
                            <p className="text-indigo-200 text-sm mt-1">
                                {department.name} · {department.level} ·{" "}
                                {department.session}
                            </p>
                        )}
                    </div>

                    {/* Code Widget */}
                    {department?.code && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shrink-0">
                            <p className="text-indigo-200 text-xs uppercase tracking-widest mb-2 font-medium">
                                Class Code
                            </p>
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-extrabold text-lg tracking-widest">
                                    {department.code}
                                </span>
                                <button
                                    onClick={copyCode}
                                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    {copied ? (
                                        <Check
                                            size={16}
                                            className="text-cyan-300"
                                        />
                                    ) : (
                                        <Copy size={16} />
                                    )}
                                </button>
                            </div>
                            <p className="text-indigo-300 text-xs mt-1">
                                Share with your students
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(({ label, value, icon: Icon, color, bg }) => (
                    <div
                        key={label}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-3"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                        >
                            <Icon size={20} className={color} />
                        </div>
                        <div>
                            <p className="text-2xl font-extrabold">{value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.map(({ label, tab, color }) => (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className={`bg-gradient-to-br ${color} text-white rounded-2xl p-4 text-left flex items-center justify-between font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm`}
                        >
                            {label}
                            <ArrowRight size={16} className="opacity-70" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Activity Feed Placeholder */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg">Recent Activity</h2>
                    <TrendingUp size={18} className="text-slate-400" />
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Megaphone size={20} className="text-slate-400" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                        No activity yet
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Post your first announcement to get started
                    </p>
                    <button
                        onClick={() => onTabChange("announcements")}
                        className="text-primary-700 dark:text-primary-400 text-sm font-semibold hover:underline"
                    >
                        Post Announcement →
                    </button>
                </div>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}
