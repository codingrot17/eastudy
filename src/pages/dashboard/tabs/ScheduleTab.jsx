import { CalendarDays, Plus, Clock, BookOpen } from "lucide-react";
import Button from "../../../components/ui/Button";

const DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
];
const PERIODS = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM"
];

export default function ScheduleTab() {
    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Class Schedule</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Weekly timetable for your department
                    </p>
                </div>
                <Button size="sm">
                    <Plus size={16} className="mr-1" />
                    Add Class
                </Button>
            </div>

            {/* Day Cards */}
            <div className="flex flex-col gap-4">
                {DAYS.map(day => (
                    <div
                        key={day}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                            <span className="font-bold text-sm">{day}</span>
                            <button className="text-xs text-primary-700 dark:text-primary-400 font-semibold hover:underline">
                                + Add
                            </button>
                        </div>
                        <div className="p-4">
                            {/* Empty state per day */}
                            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-600 py-2">
                                <Clock size={14} />
                                <span className="text-sm">
                                    No classes scheduled
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Coming Soon */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800 p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center shrink-0">
                    <CalendarDays
                        size={20}
                        className="text-primary-700 dark:text-primary-400"
                    />
                </div>
                <div>
                    <p className="font-semibold text-primary-900 dark:text-primary-200 text-sm">
                        Full schedule builder coming soon
                    </p>
                    <p className="text-xs text-primary-700/70 dark:text-primary-400/70 mt-1">
                        You'll be able to add courses, time slots, venues, and
                        lecturers. Students will see the timetable
                        automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}
