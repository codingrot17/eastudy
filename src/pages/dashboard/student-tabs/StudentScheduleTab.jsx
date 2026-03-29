import { CalendarDays, Clock } from "lucide-react";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];

export default function StudentScheduleTab() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">Class Schedule</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Your weekly timetable
                </p>
            </div>

            {/* Today Highlight */}
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 text-cyan-100 text-sm font-medium mb-2">
                    <CalendarDays size={16} />
                    Today —{" "}
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric"
                    })}
                </div>
                <p className="font-bold text-lg">No classes scheduled today</p>
                <p className="text-cyan-200 text-sm mt-1">
                    Your rep hasn't set up the timetable yet
                </p>
            </div>

            {/* Weekly View */}
            <div className="flex flex-col gap-3">
                {DAYS.map(day => (
                    <div
                        key={day}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                            <span className="font-bold text-sm">{day}</span>
                        </div>
                        <div className="p-4 flex items-center gap-3 text-slate-400 dark:text-slate-600">
                            <Clock size={14} />
                            <span className="text-sm">
                                No classes scheduled
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
