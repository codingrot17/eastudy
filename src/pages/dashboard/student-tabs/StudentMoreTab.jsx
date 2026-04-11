import {
    ClipboardList,
    Users,
    Lightbulb,
    GraduationCap,
    ChevronRight
} from "lucide-react";
import useAuthStore from "../../../store/useAuthStore";

const moreItems = [
    {
        icon: ClipboardList,
        label: "Quizzes & Tests",
        desc: "Take assessments from your rep",
        color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        tab: "quizzes",
        soon: false
    },
    {
        icon: Users,
        label: "Group Study",
        desc: "Join study sessions with classmates",
        color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
        tab: "group-study",
        soon: false
    },
    {
        icon: Lightbulb,
        label: "Study Plans",
        desc: "Manage your personal study plan",
        color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
        tab: null,
        soon: true
    }
];

export default function StudentMoreTab({ onTabChange }) {
    const { user, profile, department } = useAuthStore();

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">More</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    More tools and your profile
                </p>
            </div>

            {/* Profile Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-xl">
                        {user?.name?.[0]?.toUpperCase() ?? "S"}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user?.name ?? "—"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {user?.email ?? "—"}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-500 mt-1">
                        <GraduationCap size={12} />
                        Student
                    </span>
                </div>
            </div>

            {/* Department Info Card */}
            {department && (
                <div className="bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-900/20 dark:to-cyan-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 p-5">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary-700 dark:text-primary-400 mb-3">
                        Your Department
                    </p>
                    <div className="flex flex-col gap-2">
                        {[
                            ["Department", department.name],
                            ["School", department.school],
                            ["Level", department.level],
                            ["Session", department.session]
                        ].map(([key, val]) => (
                            <div
                                key={key}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="text-slate-500 dark:text-slate-400">
                                    {key}
                                </span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                    {val}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* More Features */}
            <div className="flex flex-col gap-3">
                {moreItems.map(
                    ({ icon: Icon, label, desc, color, tab, soon }) => (
                        <button
                            key={label}
                            onClick={() => tab && onTabChange(tab)}
                            disabled={soon}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 text-left disabled:opacity-60 disabled:cursor-not-allowed hover:border-primary-200 dark:hover:border-primary-800 transition-all"
                        >
                            <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
                            >
                                <Icon size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm">
                                        {label}
                                    </p>
                                    {soon && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-100 dark:border-primary-800">
                                            SOON
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {desc}
                                </p>
                            </div>
                            {!soon && (
                                <ChevronRight
                                    size={16}
                                    className="text-slate-400 shrink-0"
                                />
                            )}
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
