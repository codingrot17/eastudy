import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    UserCheck,
    UserX,
    Loader2,
    Shield,
    ShieldCheck,
    AlertCircle,
    CheckCircle,
    X
} from "lucide-react";
import {
    getUserByEmail,
    assignAssistantRep,
    removeAssistantRep,
    getAssistantProfile
} from "../../../appwrite/department";
import useAuthStore from "../../../store/useAuthStore";
import Button from "../../../components/ui/Button";

export default function SettingsTab({ department, user }) {
    const { setDepartment } = useAuthStore();

    const [searchEmail, setSearchEmail] = useState("");
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState(null);
    const [searchError, setSearchError] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }
    const [assistant, setAssistant] = useState(null);
    const [loadingAssistant, setLoadingAssistant] = useState(true);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    const searchRef = useRef(null);
    const debounceRef = useRef(null);

    // Load existing assistant on mount
    useEffect(() => {
        const load = async () => {
            if (!department?.assistantRepId) {
                setLoadingAssistant(false);
                return;
            }
            try {
                const a = await getAssistantProfile(department.assistantRepId);
                setAssistant(a);
            } catch {
                // no-op
            } finally {
                setLoadingAssistant(false);
            }
        };
        load();
    }, [department?.assistantRepId]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 4000);
    };

    // Debounced search — fires 600ms after user stops typing
    const handleEmailChange = e => {
        const val = e.target.value;
        setSearchEmail(val);
        setFoundUser(null);
        setSearchError("");

        clearTimeout(debounceRef.current);
        if (!val.trim() || !val.includes("@")) return;

        debounceRef.current = setTimeout(() => {
            runSearch(val.trim());
        }, 600);
    };

    const runSearch = async email => {
        setSearching(true);
        setFoundUser(null);
        setSearchError("");

        try {
            const found = await getUserByEmail(email);

            if (!found) {
                setSearchError("No Eastudy account found with that email.");
                return;
            }
            if (found.authId === user?.$id) {
                setSearchError("That's you — you're already the class rep.");
                return;
            }
            if (found.departmentId !== department?.$id) {
                setSearchError(
                    "This student isn't in your department. They must join with your class code first."
                );
                return;
            }
            if (found.role === "assistant") {
                setSearchError("This student is already an assistant rep.");
                return;
            }
            if (found.role === "rep") {
                setSearchError("This user is a rep in another department.");
                return;
            }

            setFoundUser(found);
        } catch {
            setSearchError(
                "Search failed. Check your connection and try again."
            );
        } finally {
            setSearching(false);
        }
    };

    // Manual search trigger (button / enter)
    const handleManualSearch = e => {
        e.preventDefault();
        if (!searchEmail.trim()) return;
        clearTimeout(debounceRef.current);
        runSearch(searchEmail.trim());
    };

    // Assign assistant
    const handleAssign = async () => {
        if (!foundUser || !department) return;
        setAssigning(true);

        try {
            await assignAssistantRep(foundUser.authId, department.$id);

            // Update local state
            setAssistant(foundUser);
            setFoundUser(null);
            setSearchEmail("");
            setSearchError("");

            // Update Zustand department so sidebar code widget stays in sync
            const { setDepartment } = useAuthStore();
            setDepartment({ ...department, assistantRepId: foundUser.authId });

            showToast(
                "success",
                `${foundUser.name} is now your assistant rep.`
            );
        } catch (err) {
            showToast(
                "error",
                err.message?.includes("not authorized")
                    ? "Permission error — check your Appwrite collection permissions allow updates."
                    : err.message || "Failed to assign assistant rep."
            );
        } finally {
            setAssigning(false);
        }
    };

    // Remove assistant
    const handleRemove = async () => {
        if (!assistant || !department) return;
        setRemoving(true);
        setShowRemoveConfirm(false);

        try {
            await removeAssistantRep(assistant.authId, department.$id);

            const removedName = assistant.name;
            setAssistant(null);

            const { setDepartment } = useAuthStore();
            setDepartment({ ...department, assistantRepId: null });
            
            showToast(
                "success",
                `${removedName} has been removed as assistant rep.`
            );
        } catch (err) {
            showToast(
                "error",
                err.message || "Failed to remove assistant rep."
            );
        } finally {
            setRemoving(false);
        }
    };

    const clearSearch = () => {
        setSearchEmail("");
        setFoundUser(null);
        setSearchError("");
        clearTimeout(debounceRef.current);
        searchRef.current?.focus();
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-extrabold">Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your department and team
                </p>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
                            toast.type === "success"
                                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        }`}
                    >
                        {toast.type === "success" ? (
                            <CheckCircle
                                size={16}
                                className="text-green-500 shrink-0"
                            />
                        ) : (
                            <AlertCircle
                                size={16}
                                className="text-red-500 shrink-0"
                            />
                        )}
                        <p
                            className={`text-sm flex-1 ${
                                toast.type === "success"
                                    ? "text-green-700 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            }`}
                        >
                            {toast.msg}
                        </p>
                        <button onClick={() => setToast(null)}>
                            <X
                                size={14}
                                className="text-slate-400 hover:text-slate-600"
                            />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Department Info Card */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                        <Shield
                            size={20}
                            className="text-primary-700 dark:text-primary-400"
                        />
                    </div>
                    <div>
                        <p className="font-bold">Department Info</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Your registered department details
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        ["Department", department?.name],
                        ["School", department?.school],
                        ["Level", department?.level],
                        ["Session", department?.session],
                        ["Code", department?.code],
                        ["Students", department?.studentCount ?? "—"]
                    ].map(([key, val]) => (
                        <div key={key} className="flex flex-col gap-0.5">
                            <p className="text-xs text-slate-400">{key}</p>
                            <p className="font-semibold text-sm">
                                {key === "Code" ? (
                                    <span className="font-mono tracking-wider">
                                        {val}
                                    </span>
                                ) : (
                                    val
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rep Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-cyan-500 flex items-center justify-center shrink-0">
                    <span className="text-white font-extrabold text-lg">
                        {user?.name?.[0]?.toUpperCase() ?? "R"}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{user?.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {user?.email}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 mt-1">
                        <ShieldCheck size={12} />
                        Class Rep
                    </span>
                </div>
            </div>

            {/* ── Assistant Rep Section ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Section header */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                        <UserCheck
                            size={18}
                            className="text-cyan-600 dark:text-cyan-400"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Assistant Class Rep</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            One student can help you manage the department
                        </p>
                    </div>
                </div>

                <div className="p-5 flex flex-col gap-4">
                    {/* Current assistant card */}
                    {loadingAssistant ? (
                        <div className="animate-pulse flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                            <div className="w-11 h-11 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                            </div>
                        </div>
                    ) : assistant ? (
                        <div className="flex flex-col gap-3">
                            {/* Assistant card */}
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
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
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 mt-1">
                                        <ShieldCheck size={11} />
                                        Assistant Rep
                                    </span>
                                </div>
                            </div>

                            {/* Remove — confirm step */}
                            {!showRemoveConfirm ? (
                                <button
                                    onClick={() => setShowRemoveConfirm(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                    <UserX size={15} />
                                    Remove Assistant Rep
                                </button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                                >
                                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                        Remove {assistant.name}?
                                    </p>
                                    <p className="text-xs text-red-600/70 dark:text-red-400/70">
                                        They'll go back to being a regular
                                        student.
                                    </p>
                                    <div className="flex gap-2 mt-1">
                                        <button
                                            onClick={() =>
                                                setShowRemoveConfirm(false)
                                            }
                                            className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleRemove}
                                            disabled={removing}
                                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {removing && (
                                                <Loader2
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                            )}
                                            {removing
                                                ? "Removing..."
                                                : "Yes, Remove"}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        /* No assistant — show search */
                        <div className="flex flex-col gap-4">
                            <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                                💡 Search by the student's email address. They
                                must have already joined your department using
                                your class code.
                            </p>

                            {/* Search input */}
                            <form
                                onSubmit={handleManualSearch}
                                className="flex flex-col gap-3"
                            >
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        {searching ? (
                                            <Loader2
                                                size={16}
                                                className="text-primary-500 animate-spin"
                                            />
                                        ) : (
                                            <Search
                                                size={16}
                                                className="text-slate-400"
                                            />
                                        )}
                                    </div>
                                    <input
                                        ref={searchRef}
                                        type="email"
                                        placeholder="Student's email address..."
                                        value={searchEmail}
                                        onChange={handleEmailChange}
                                        className="input-field pl-10 pr-10"
                                        autoComplete="off"
                                    />
                                    {searchEmail && (
                                        <button
                                            type="button"
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>

                                {/* Search error */}
                                <AnimatePresence>
                                    {searchError && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-start gap-2 text-sm text-red-500 px-1"
                                        >
                                            <AlertCircle
                                                size={14}
                                                className="mt-0.5 shrink-0"
                                            />
                                            {searchError}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Found user card */}
                                <AnimatePresence>
                                    {foundUser && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col gap-3"
                                        >
                                            {/* Student preview */}
                                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                                                    <span className="text-white font-extrabold text-base">
                                                        {foundUser.name?.[0]?.toUpperCase() ??
                                                            "S"}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">
                                                        {foundUser.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {foundUser.email}
                                                    </p>
                                                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                                                        <CheckCircle
                                                            size={11}
                                                        />
                                                        In your department
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Assign CTA */}
                                            <Button
                                                type="button"
                                                onClick={handleAssign}
                                                disabled={assigning}
                                                className="w-full"
                                            >
                                                {assigning ? (
                                                    <Loader2
                                                        size={16}
                                                        className="animate-spin mr-2"
                                                    />
                                                ) : (
                                                    <UserCheck
                                                        size={16}
                                                        className="mr-2"
                                                    />
                                                )}
                                                {assigning
                                                    ? "Assigning..."
                                                    : `Make ${foundUser.name.split(" ")[0]} Assistant Rep`}
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
