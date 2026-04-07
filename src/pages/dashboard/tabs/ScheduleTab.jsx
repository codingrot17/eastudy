import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    Plus,
    Clock,
    MapPin,
    User,
    BookOpen,
    Pencil,
    Trash2,
    Loader2,
    X,
    Check,
    RefreshCw,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { useSchedule } from "../../../hooks/useSchedule";
import { DAYS } from "../../../appwrite/schedule";
import Button from "../../../components/ui/Button";

const TIME_SLOTS = [
    "7:00 AM",
    "7:30 AM",
    "8:00 AM",
    "8:30 AM",
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
    "8:00 PM"
];

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

const emptyForm = {
    day: "Monday",
    courseCode: "",
    courseName: "",
    lecturer: "",
    venue: "",
    startTime: "8:00 AM",
    endTime: "10:00 AM"
};

export default function ScheduleTab({ department }) {
    const { byDay, loading, error, addClass, editClass, removeClass, refresh } =
        useSchedule(department?.$id);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [formError, setFormError] = useState("");
    const [collapsedDays, setCollapsedDays] = useState({});

    const totalClasses = Object.values(byDay).reduce(
        (sum, arr) => sum + arr.length,
        0
    );

    const handleChange = e =>
        setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const openAddForm = (day = "Monday") => {
        setForm({ ...emptyForm, day });
        setEditingId(null);
        setFormError("");
        setShowForm(true);
    };

    const openEditForm = entry => {
        setForm({
            day: entry.day,
            courseCode: entry.courseCode,
            courseName: entry.courseName,
            lecturer: entry.lecturer,
            venue: entry.venue,
            startTime: entry.startTime,
            endTime: entry.endTime
        });
        setEditingId(entry.$id);
        setFormError("");
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormError("");
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setFormError("");

        if (form.startTime === form.endTime) {
            setFormError("Start and end time cannot be the same.");
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await editClass(editingId, form);
            } else {
                await addClass(form);
            }
            closeForm();
        } catch {
            setFormError("Failed to save. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async id => {
        setDeletingId(id);
        try {
            await removeClass(id);
        } catch {
        } finally {
            setDeletingId(null);
        }
    };

    const toggleCollapse = day => {
        setCollapsedDays(p => ({ ...p, [day]: !p[day] }));
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Class Schedule</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {totalClasses} class{totalClasses !== 1 ? "es" : ""}{" "}
                        across the week
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={refresh}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Button size="sm" onClick={() => openAddForm()}>
                        <Plus size={16} className="mr-1" />
                        Add Class
                    </Button>
                </div>
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

            {/* Add / Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-sm overflow-hidden"
                    >
                        {/* Form header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
                            <p className="font-bold text-primary-900 dark:text-primary-200 text-sm">
                                {editingId ? "Edit Class" : "Add New Class"}
                            </p>
                            <button
                                onClick={closeForm}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="p-5 flex flex-col gap-4"
                        >
                            {/* Day */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                    Day
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {DAYS.map(d => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() =>
                                                setForm(p => ({ ...p, day: d }))
                                            }
                                            className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                                form.day === d
                                                    ? DAY_COLORS[d] + " border"
                                                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {d.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Course code + name */}
                            <div className="grid grid-cols-5 gap-3">
                                <div className="col-span-2 flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Course Code
                                    </label>
                                    <input
                                        name="courseCode"
                                        type="text"
                                        placeholder="e.g. CSC 301"
                                        value={form.courseCode}
                                        onChange={handleChange}
                                        required
                                        maxLength={12}
                                        className="input-field uppercase"
                                    />
                                </div>
                                <div className="col-span-3 flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Course Name
                                    </label>
                                    <input
                                        name="courseName"
                                        type="text"
                                        placeholder="e.g. Data Structures"
                                        value={form.courseName}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Lecturer + Venue */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Lecturer
                                    </label>
                                    <input
                                        name="lecturer"
                                        type="text"
                                        placeholder="e.g. Dr. Adeyemi"
                                        value={form.lecturer}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Venue
                                    </label>
                                    <input
                                        name="venue"
                                        type="text"
                                        placeholder="e.g. LT 3"
                                        value={form.venue}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {/* Time */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        Start Time
                                    </label>
                                    <select
                                        name="startTime"
                                        value={form.startTime}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        {TIME_SLOTS.map(t => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                        End Time
                                    </label>
                                    <select
                                        name="endTime"
                                        value={form.endTime}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        {TIME_SLOTS.map(t => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {formError && (
                                <p className="text-red-500 text-sm flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    {formError}
                                </p>
                            )}

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="flex-1 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
                                >
                                    Cancel
                                </button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1"
                                >
                                    {saving ? (
                                        <Loader2
                                            size={16}
                                            className="animate-spin mr-2"
                                        />
                                    ) : (
                                        <Check size={16} className="mr-2" />
                                    )}
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                          ? "Save Changes"
                                          : "Add Class"}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

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
            ) : (
                /* Day columns */
                <div className="flex flex-col gap-4">
                    {DAYS.map(day => {
                        const classes = byDay[day] ?? [];
                        const isCollapsed = collapsedDays[day];
                        const isToday =
                            new Date().toLocaleDateString("en-US", {
                                weekday: "long"
                            }) === day;

                        return (
                            <div
                                key={day}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                            >
                                {/* Day header */}
                                <div
                                    className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
                                    onClick={() => toggleCollapse(day)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`text-sm font-bold px-3 py-1 rounded-lg border ${DAY_COLORS[day]}`}
                                        >
                                            {day}
                                        </span>
                                        {isToday && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-700 text-white">
                                                TODAY
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400 font-medium">
                                            {classes.length} class
                                            {classes.length !== 1 ? "es" : ""}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                openAddForm(day);
                                            }}
                                            className="text-xs font-semibold text-primary-700 dark:text-primary-400 hover:underline px-2 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                        >
                                            + Add
                                        </button>
                                        {isCollapsed ? (
                                            <ChevronDown
                                                size={16}
                                                className="text-slate-400"
                                            />
                                        ) : (
                                            <ChevronUp
                                                size={16}
                                                className="text-slate-400"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Classes list */}
                                <AnimatePresence initial={false}>
                                    {!isCollapsed && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{
                                                height: "auto",
                                                opacity: 1
                                            }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                                                {classes.length === 0 ? (
                                                    <div className="flex items-center gap-3 py-3 text-slate-400 dark:text-slate-600">
                                                        <Clock size={14} />
                                                        <span className="text-sm">
                                                            No classes — tap +
                                                            Add to schedule one
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <AnimatePresence
                                                        initial={false}
                                                    >
                                                        {classes.map(cls => (
                                                            <motion.div
                                                                key={cls.$id}
                                                                layout
                                                                initial={{
                                                                    opacity: 0,
                                                                    x: -8
                                                                }}
                                                                animate={{
                                                                    opacity: 1,
                                                                    x: 0
                                                                }}
                                                                exit={{
                                                                    opacity: 0,
                                                                    x: -8
                                                                }}
                                                                className={`flex items-start gap-3 p-4 rounded-xl border border-l-4 bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 ${CARD_LEFT[day]}`}
                                                            >
                                                                <div className="flex-1 min-w-0 flex flex-col gap-1">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                                                                            {
                                                                                cls.courseCode
                                                                            }
                                                                        </span>
                                                                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                                                            {
                                                                                cls.courseName
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                                            <Clock
                                                                                size={
                                                                                    11
                                                                                }
                                                                            />
                                                                            {
                                                                                cls.startTime
                                                                            }{" "}
                                                                            –{" "}
                                                                            {
                                                                                cls.endTime
                                                                            }
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                                            <MapPin
                                                                                size={
                                                                                    11
                                                                                }
                                                                            />
                                                                            {
                                                                                cls.venue
                                                                            }
                                                                        </span>
                                                                        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                                                            <User
                                                                                size={
                                                                                    11
                                                                                }
                                                                            />
                                                                            {
                                                                                cls.lecturer
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                {/* Actions */}
                                                                <div className="flex items-center gap-1 shrink-0">
                                                                    <button
                                                                        onClick={() =>
                                                                            openEditForm(
                                                                                cls
                                                                            )
                                                                        }
                                                                        className="p-2 rounded-lg text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                                    >
                                                                        <Pencil
                                                                            size={
                                                                                14
                                                                            }
                                                                        />
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                cls.$id
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            deletingId ===
                                                                            cls.$id
                                                                        }
                                                                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-50"
                                                                    >
                                                                        {deletingId ===
                                                                        cls.$id ? (
                                                                            <Loader2
                                                                                size={
                                                                                    14
                                                                                }
                                                                                className="animate-spin"
                                                                            />
                                                                        ) : (
                                                                            <Trash2
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </AnimatePresence>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
