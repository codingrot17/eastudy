import {
    Megaphone,
    FolderOpen,
    CalendarDays,
    ClipboardList,
    ArrowRight,
    BookOpen,
    GraduationCap
} from "lucide-react";

export default function StudentHomeTab({
    user,
    profile,
    department,
    onTabChange
}) {
    const stats = [
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
            label: "Classes Today",
            value: "0",
            icon: CalendarDays,
            color: "text-cyan-500",
            bg: "bg-cyan-50 dark:bg-cyan-900/20"
        },
        {
            label: "Quizzes",
            value: "0",
            icon: ClipboardList,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        }
    ];

    const quickAccess = [
        {
            label: "Announcements",
            tab: "announcements",
            color: "from-indigo-500 to-primary-700"
        },
        {
            label: "My Materials",
            tab: "materials",
            color: "from-violet-500 to-purple-700"
        },
        {
            label: "Schedule",
            tab: "schedule",
            color: "from-cyan-500 to-blue-600"
        },
        {
            label: "More Tools",
            tab: "more",
            color: "from-slate-600 to-slate-800"
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-primary-800 rounded-2xl p-6 text-white">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -bottom-4 right-12 w-20 h-20 bg-white/5 rounded-full" />

                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">
                            Good {getGreeting()} 👋
                        </p>
                        <h1 className="text-2xl md:text-3xl font-extrabold">
                            {user?.name?.split(" ")[0] ?? "Student"}
                        </h1>
                        {department && (
                            <p className="text-slate-400 text-sm mt-1">
                                {department.name} · {department.level} ·{" "}
                                {department.session}
                            </p>
                        )}
                    </div>

                    {/* Dept Info Widget */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shrink-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <GraduationCap size={16} />
                            <span className="text-xs font-bold uppercase tracking-widest">
                                Department
                            </span>
                        </div>
                        <p className="font-bold text-white text-sm">
                            {department?.name ?? "—"}
                        </p>
                        <p className="text-slate-400 text-xs">
                            {department?.school ?? "—"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
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

            {/* Quick Access */}
            <div>
                <h2 className="font-bold text-lg mb-4">Quick Access</h2>
                <div className="grid grid-cols-2 gap-3">
                    {quickAccess.map(({ label, tab, color }) => (
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

            {/* Latest Activity Placeholder */}
            <div>
                <h2 className="font-bold text-lg mb-4">Latest Updates</h2>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center gap-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Megaphone size={20} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400 text-sm">
                        No updates yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs">
                        Your class rep hasn't posted anything yet. Check back
                        soon.
                    </p>
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
