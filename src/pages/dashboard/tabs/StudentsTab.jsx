import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    Search,
    RefreshCw,
    AlertCircle,
    GraduationCap,
    ShieldCheck,
    Shield,
    X
} from "lucide-react";
import {
    getDepartmentStudents,
    getAssistantProfile
} from "../../../appwrite/department";

export default function StudentsTab({ department }) {
    const [students, setStudents] = useState([]);
    const [assistant, setAssistant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const load = useCallback(async () => {
        if (!department?.$id) return;
        setLoading(true);
        setError(null);
        try {
            const [studentDocs, assistantDoc] = await Promise.all([
                getDepartmentStudents(department.$id),
                department.assistantRepId
                    ? getAssistantProfile(department.assistantRepId)
                    : Promise.resolve(null)
            ]);
            setStudents(studentDocs);
            setAssistant(assistantDoc);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [department?.$id, department?.assistantRepId]);

    useEffect(() => {
        load();
    }, [load]);

    const filtered = students.filter(s => {
        const q = search.toLowerCase();
        return (
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q)
        );
    });

    // Everyone in the class (assistant + students)
    const totalMembers = students.length + (assistant ? 1 : 0);

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-extrabold">Students</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        {loading
                            ? "Loading..."
                            : `${totalMembers} member${totalMembers !== 1 ? "s" : ""} in your department`}
                    </p>
                </div>
                <button
                    onClick={load}
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

            {/* Stats row */}
            {!loading && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        {
                            label: "Students",
                            value: students.length,
                            icon: GraduationCap,
                            color: "text-indigo-500",
                            bg: "bg-indigo-50 dark:bg-indigo-900/20"
                        },
                        {
                            label: "Assistant Rep",
                            value: assistant ? 1 : 0,
                            icon: ShieldCheck,
                            color: "text-cyan-500",
                            bg: "bg-cyan-50 dark:bg-cyan-900/20"
                        },
                        {
                            label: "Expected",
                            value: department?.studentCount ?? "—",
                            icon: Users,
                            color: "text-violet-500",
                            bg: "bg-violet-50 dark:bg-violet-900/20"
                        }
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <div
                            key={label}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-2"
                        >
                            <div
                                className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}
                            >
                                <Icon size={18} className={color} />
                            </div>
                            <p className="text-2xl font-extrabold">{value}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input-field pl-10 pr-10"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Loading skeletons */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div
                            key={i}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 animate-pulse"
                        >
                            <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : students.length === 0 && !assistant ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-10 flex flex-col items-center gap-3 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                        <Users size={24} className="text-indigo-500" />
                    </div>
                    <p className="font-semibold text-slate-500 dark:text-slate-400">
                        No students yet
                    </p>
                    <p className="text-sm text-slate-400 max-w-xs">
                        Share your class code with students so they can join
                        your department.
                    </p>
                    {department?.code && (
                        <div className="mt-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2 font-mono font-bold text-primary-700 dark:text-primary-400 tracking-wider text-sm">
                            {department.code}
                        </div>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {/* Assistant rep row */}
                    {assistant && (
                        <AnimatePresence>
                            <motion.div
                                key="assistant"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl border border-cyan-200 dark:border-cyan-800 p-4 flex items-center gap-4"
                            >
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-primary-700 flex items-center justify-center shrink-0">
                                    <span className="text-white font-extrabold text-base">
                                        {assistant.name?.[0]?.toUpperCase() ??
                                            "A"}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">
                                        {assistant.name}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {assistant.email}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 shrink-0">
                                    <ShieldCheck size={10} />
                                    ASSISTANT REP
                                </span>
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {/* Student rows */}
                    {filtered.length === 0 && search ? (
                        <p className="text-center text-sm text-slate-400 py-8">
                            No results for "{search}"
                        </p>
                    ) : (
                        <AnimatePresence initial={false}>
                            {filtered.map((s, i) => (
                                <motion.div
                                    key={s.$id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                                >
                                    {/* Avatar */}
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                                        <span className="text-white font-extrabold text-base">
                                            {s.name?.[0]?.toUpperCase() ?? "S"}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">
                                            {s.name}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {s.email}
                                        </p>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                                        <GraduationCap size={10} />
                                        STUDENT
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}

                    {/* Footer count */}
                    {!search && filtered.length > 0 && (
                        <p className="text-center text-xs text-slate-400 pt-2">
                            {filtered.length} student
                            {filtered.length !== 1 ? "s" : ""} · {totalMembers}{" "}
                            total member{totalMembers !== 1 ? "s" : ""}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
