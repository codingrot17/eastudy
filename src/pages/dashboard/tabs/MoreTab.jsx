import {
    ClipboardList,
    Users,
    Lightbulb,
    Settings,
    ChevronRight,
    Wrench
} from "lucide-react";

const moreItems = [
    {
        icon: Users,
        label: "Students",
        desc: "See everyone in your department",
        color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400",
        tab: "students",
        soon: false
    },
    {
        icon: ClipboardList,
        label: "Quizzes & Tests",
        desc: "Create assessments for your class",
        color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
        tab: null,
        soon: true
    },
    {
        icon: Lightbulb,
        label: "Study Plans",
        desc: "Create personal and shared plans",
        color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
        tab: null,
        soon: true
    },
    {
        icon: Settings,
        label: "Settings",
        desc: "Manage department and account",
        color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
        tab: "settings",
        soon: false
    }
];

export default function MoreTab({ onTabChange }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">More</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    More tools for your department
                </p>
            </div>

            <div className="flex flex-col gap-3">
                {moreItems.map(
                    ({ icon: Icon, label, desc, color, tab, soon }) => (
                        <button
                            key={label}
                            onClick={() => tab && onTabChange(tab)}
                            disabled={soon}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-sm transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed"
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

            <div className="bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-900/20 dark:to-cyan-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                    <Wrench
                        size={20}
                        className="text-primary-700 dark:text-primary-400"
                    />
                </div>
                <div>
                    <p className="font-semibold text-primary-900 dark:text-primary-200 text-sm">
                        More features shipping soon
                    </p>
                    <p className="text-xs text-primary-700/70 dark:text-primary-400/70 mt-1">
                        Quizzes and study plans are actively being built for
                        Eastudy.
                    </p>
                </div>
            </div>
        </div>
    );
}
