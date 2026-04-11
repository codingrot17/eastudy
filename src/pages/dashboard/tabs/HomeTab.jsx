import {
    Users,
    Megaphone,
    FolderOpen,
    ClipboardList,
    Copy,
    Check,
    ArrowRight,
    CalendarDays
} from "lucide-react";
import { useState } from "react";
import { useDashboardStats } from "../../../hooks/useDashboardStats";

export default function HomeTab({ user, department, onTabChange }) {
    const [copied, setCopied] = useState(false);
    const { stats, loading: statsLoading } = useDashboardStats(department?.$id);

    const copyCode = () => {
        if (!department?.code) return;
        navigator.clipboard.writeText(department.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const statCards = [
        {
            label: "Students",
            value: department?.studentCount ?? "0",
            icon: Users,
            color: "text-cyan-500",
            bg: "bg-cyan-50 dark:bg-cyan-900/20",
            tab: "students" 
        },
        {
            label: "Announcements",
            value: stats.announcements,
            icon: Megaphone,
            color: "text-indigo-500",
            bg: "bg-indigo-50 dark:bg-indigo-900/20",
            tab: "announcements"
        },
        {
            label: "Materials",
            value: stats.materials,
            icon: FolderOpen,
            color: "text-violet-500",
            bg: "bg-violet-50 dark:bg-violet-900/20",
            tab: "materials"
        },
        {
            label: "Classes Today",
            value: stats.classesToday,
            icon: CalendarDays,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            tab: "schedule"
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
            label: "View Schedule",
            tab: "schedule",
            color: "from-cyan-500 to-blue-600"
        },
        {
            label: "Settings",
            tab: "settings",
            color: "from-slate-600 to-slate-800"
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1E1B4B] via-primary-700 to-cyan-600 rounded-2xl p-6 text-white">
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
                {statCards.map(
                    ({ label, value, icon: Icon, color, bg, tab }) => (
                        <button
                            key={label}
                            onClick={() => tab && onTabChange(tab)}
                            disabled={!tab}
                            className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col gap-3 text-left transition-all ${
                                tab
                                    ? "hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm cursor-pointer"
                                    : "cursor-default"
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
                            >
                                <Icon size={20} className={color} />
                            </div>
                            <div>
                                {statsLoading ? (
                                    <div className="h-7 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mb-1" />
                                ) : (
                                    <p className="text-2xl font-extrabold">
                                        {value}
                                    </p>
                                )}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {label}
                                </p>
                            </div>
                        </button>
                    )
                )}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
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

            {/* Today's schedule preview */}
            <TodayPreview
                stats={stats}
                statsLoading={statsLoading}
                onTabChange={onTabChange}
            />
        </div>
    );
}

function TodayPreview({ stats, statsLoading, onTabChange }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Today</h2>
                <button
                    onClick={() => onTabChange("schedule")}
                    className="text-sm text-primary-700 dark:text-primary-400 font-semibold hover:underline"
                >
                    Full schedule →
                </button>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0">
                    <CalendarDays size={22} className="text-amber-500" />
                </div>
                <div className="flex-1">
                    {statsLoading ? (
                        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    ) : (
                        <>
                            <p className="font-bold text-sm">
                                {stats.classesToday === 0
                                    ? "No classes today"
                                    : `${stats.classesToday} class${stats.classesToday !== 1 ? "es" : ""} today`}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {new Date().toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </p>
                        </>
                    )}
                </div>
                <button
                    onClick={() => onTabChange("schedule")}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <ArrowRight size={16} />
                </button>
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
