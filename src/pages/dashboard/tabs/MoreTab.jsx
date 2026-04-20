import {
    ClipboardList,
    Users,
    UsersRound,
    Lightbulb,
    Settings,
    ChevronRight,
    User
} from "lucide-react";
import useAuthStore from "../../../store/useAuthStore";

const moreItems = [
    {
        icon: Users,
        label: "Students",
        desc: "See everyone registered in your department",
        color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
        tab: "students"
    },
    {
        icon: ClipboardList,
        label: "Quizzes & Tests",
        desc: "Create and manage class assessments",
        color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        tab: "quizzes"
    },
    {
        icon: UsersRound,
        label: "Group Study",
        desc: "Schedule study sessions for your class",
        color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        tab: "group-study"
    },
    {
        icon: Lightbulb,
        label: "Study Plans",
        desc: "Create personal and shared study plans",
        color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
        tab: "study-plans"
    },
    {
        icon: Settings,
        label: "Department Settings",
        desc: "Assign assistant rep, view department info",
        color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
        tab: "settings"
    },
    {
        icon: User,
        label: "Profile",
        desc: "Edit your name, theme and notifications",
        color: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
        tab: "profile"
    }
];

export default function MoreTab({ user, profile, department, onTabChange }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">More</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    More tools for your department
                </p>
            </div>

            {/* Quick profile card */}
            <button
                onClick={() => onTabChange("profile")}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 transition-all text-left"
            >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-lg">
                        {user?.name?.[0]?.toUpperCase() ?? "R"}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user?.name ?? "—"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user?.email ?? "—"}
                    </p>
                    <p className="text-xs text-primary-700 dark:text-primary-400 font-semibold mt-1 capitalize">
                        {profile?.role} · {department?.name ?? "—"}
                    </p>
                </div>
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
            </button>

            {/* All feature items */}
            <div className="flex flex-col gap-3">
                {moreItems.map(({ icon: Icon, label, desc, color, tab }) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all text-left"
                    >
                        <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                        >
                            <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{label}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {desc}
                            </p>
                        </div>
                        <ChevronRight
                            size={16}
                            className="text-slate-400 shrink-0"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
