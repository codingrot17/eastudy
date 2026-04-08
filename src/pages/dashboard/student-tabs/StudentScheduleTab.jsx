import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    Clock,
    MapPin,
    User,
    RefreshCw,
    AlertCircle
} from "lucide-react";
import { useSchedule } from "../../../hooks/useSchedule";
import { DAYS } from "../../../appwrite/schedule";

const DAY_COLORS = {
    Monday: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
    Tuesday:
        "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-800",
    Wednesday:
        "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border-cyan-100 dark:border-cyan-800",
    Thursday:
        "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-800",
    Friday: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
    Saturday:
        "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800"
};

const CARD_LEFT = {
    Monday: "border-l-indigo-400",
    Tuesday: "border-l-violet-400",
    Wednesday: "border-l-cyan-400",
    Thursday: "border-l-amber-400",
    Friday: "border-l-emerald-400",
    Saturday: "border-l-rose-400"
};

export default function StudentScheduleTab({ department }) {
    const { byDay, loading, error, refresh } = useSchedule(department?.$id);

    const todayName = new Date().toLocaleDateString("en-US", {
        weekday: "long"
    });
    const todayClasses = byDay[todayName] ?? [];
    const totalClasses = Object.values(byDay).reduce((s, a) => s + a.length, 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Class Schedule</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Your weekly timetable
                    </p>
                </div>
                <button
                    onClick={refresh}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600 dark:text-red-400">
                        {error}
                    </p>
                </div>
            )}

            {/* Today highlight banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative">
                    <div className="flex items-center gap-2 text-cyan-100 text-sm font-medium mb-2">
                        <CalendarDays size={15} />
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric"
                        })}
                    </div>

                    {loading ? (
                        <div className="h-5 w-40 bg-white/20 rounded-lg animate-pulse" />
                    ) : todayClasses.length === 0 ? (
                        <div>
                            <p className="font-bold text-lg">
                                No classes today 🎉
                            </p>
                            <p className="text-cyan-200 text-sm mt-0.5">
                                Enjoy your free day
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="font-bold text-lg">
                                {todayClasses.length} class
                                {todayClasses.length !== 1 ? "es" : ""} today
                            </p>
                            <p className="text-cyan-200 text-sm mt-0.5">
                                First up: {todayClasses[0].courseCode} at{" "}
                                {todayClasses[0].startTime}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Today's classes (expanded at top when there are classes) */}
            {!loading && todayClasses.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                        Today's Classes
                    </p>
                    {todayClasses.map(cls => (
                        <ClassCard
                            key={cls.$id}
                            cls={cls}
                            day={todayName}
                            highlight
                        />
                    ))}
                </div>
            )}

            {/* Loading skeletons */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse"
                        >
                            <div className="h-12 bg-slate-100 dark:bg-slate-800" />
                            <div className="p-4 flex flex-col gap-2">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : totalClasses === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                        <CalendarDays size={24} className="text-cyan-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No schedule yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Your rep hasn't set up the timetable yet. Check back
                        soon.
                    </p>
                </div>
            ) : (
                /* Full week view */
                <div className="flex flex-col gap-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">
                        Full Week
                    </p>
                    {DAYS.map(day => {
                        const classes = byDay[day] ?? [];
                        const isToday = todayName === day;

                        return (
                            <div
                                key={day}
                                className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden ${
                                    isToday
                                        ? "border-primary-200 dark:border-primary-800 shadow-sm"
                                        : "border-slate-100 dark:border-slate-800"
                                }`}
                            >
                                {/* Day header */}
                                <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <span
                                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${DAY_COLORS[day]}`}
                                    >
                                        {day}
                                    </span>
                                    {isToday && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-700 text-white">
                                            TODAY
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 ml-auto">
                                        {classes.length} class
                                        {classes.length !== 1 ? "es" : ""}
                                    </span>
                                </div>

                                <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                                    {classes.length === 0 ? (
                                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 py-2">
                                            <Clock size={13} />
                                            <span className="text-sm">
                                                No classes
                                            </span>
                                        </div>
                                    ) : (
                                        classes.map(cls => (
                                            <ClassCard
                                                key={cls.$id}
                                                cls={cls}
                                                day={day}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function ClassCard({ cls, day, highlight }) {
    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-xl border border-l-4 transition-all ${
                highlight
                    ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700"
            } ${CARD_LEFT[day]}`}
        >
            <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                        {cls.courseCode}
                    </span>
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        {cls.courseName}
                    </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={11} />
                        {cls.startTime} – {cls.endTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin size={11} />
                        {cls.venue}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <User size={11} />
                        {cls.lecturer}
                    </span>
                </div>
            </div>
        </div>
    );
}
