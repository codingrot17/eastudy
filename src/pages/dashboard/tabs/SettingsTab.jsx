import { useState, useEffect } from "react";
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
    Mail,
    User
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
    const { setAuth, profile } = useAuthStore();

    const [searchEmail, setSearchEmail] = useState("");
    const [searching, setSearching] = useState(false);
    const [foundUser, setFoundUser] = useState(null);
    const [searchError, setSearchError] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [actionMsg, setActionMsg] = useState("");
    const [actionError, setActionError] = useState("");
    const [assistant, setAssistant] = useState(null);
    const [loadingAssistant, setLoadingAssistant] = useState(true);

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
            } finally {
                setLoadingAssistant(false);
            }
        };
        load();
    }, [department?.assistantRepId]);

    // Search student by email
    const handleSearch = async e => {
        e.preventDefault();
        if (!searchEmail.trim()) return;

        setSearching(true);
        setFoundUser(null);
        setSearchError("");

        try {
            const found = await getUserByEmail(searchEmail);
            if (!found) {
                setSearchError("No user found with that email.");
                return;
            }
            if (found.authId === user?.$id) {
                setSearchError("That's you — you're already the rep.");
                return;
            }
            if (found.departmentId !== department?.$id) {
                setSearchError("This user is not in your department.");
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
            setSearchError("Something went wrong. Try again.");
        } finally {
            setSearching(false);
        }
    };

    // Assign assistant
    const handleAssign = async () => {
        if (!foundUser || !department) return;
        setAssigning(true);
        setActionMsg("");
        setActionError("");

        try {
            const updatedDept = await assignAssistantRep(
                foundUser.authId,
                department.$id
            );
            setAssistant(foundUser);
            setFoundUser(null);
            setSearchEmail("");
            setActionMsg(`${foundUser.name} is now your assistant rep.`);

            // Update local auth store department
            const { department: currentDept, ...rest } =
                useAuthStore.getState();
            useAuthStore.setState({
                department: { ...currentDept, assistantRepId: foundUser.authId }
            });
        } catch (err) {
            setActionError(err.message || "Failed to assign assistant rep.");
        } finally {
            setAssigning(false);
        }
    };

    // Remove assistant
    const handleRemove = async () => {
        if (!assistant || !department) return;
        setRemoving(true);
        setActionMsg("");
        setActionError("");

        try {
            await removeAssistantRep(assistant.authId, department.$id);
            setActionMsg(
                `${assistant.name} has been removed as assistant rep.`
            );
            setAssistant(null);

            useAuthStore.setState(state => ({
                department: { ...state.department, assistantRepId: null }
            }));
        } catch (err) {
            setActionError(err.message || "Failed to remove assistant rep.");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-xl font-extrabold">Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your department and team
                </p>
            </div>

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
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center">
                        <UserCheck
                            size={20}
                            className="text-cyan-600 dark:text-cyan-400"
                        />
                    </div>
                    <div>
                        <p className="font-bold">Assistant Class Rep</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Assign a student to help manage the department
                        </p>
                    </div>
                </div>

                {/* Action Messages */}
                <AnimatePresence>
                    {actionMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-4 py-3"
                        >
                            <CheckCircle
                                size={16}
                                className="text-green-500 shrink-0"
                            />
                            <p className="text-sm text-green-700 dark:text-green-400">
                                {actionMsg}
                            </p>
                        </motion.div>
                    )}
                    {actionError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-4 py-3"
                        >
                            <AlertCircle
                                size={16}
                                className="text-red-500 shrink-0"
                            />
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {actionError}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Current Assistant */}
                {loadingAssistant ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 animate-pulse flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
                        <div className="flex-1">
                            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2 mb-2" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
                        </div>
                    </div>
                ) : assistant ? (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl border border-cyan-200 dark:border-cyan-800 p-4 flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-primary-700 flex items-center justify-center shrink-0">
                            <span className="text-white font-extrabold">
                                {assistant.name?.[0]?.toUpperCase() ?? "A"}
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
                                <ShieldCheck size={12} />
                                Assistant Rep
                            </span>
                        </div>
                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors disabled:opacity-50"
                        >
                            {removing ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <UserX size={14} />
                            )}
                            {removing ? "Removing..." : "Remove"}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-5 flex flex-col items-center gap-2 text-center">
                        <UserCheck
                            size={24}
                            className="text-slate-300 dark:text-slate-600"
                        />
                        <p className="font-semibold text-sm text-slate-500 dark:text-slate-400">
                            No assistant rep assigned
                        </p>
                        <p className="text-xs text-slate-400 max-w-xs">
                            Search for a student in your department below to
                            assign them.
                        </p>
                    </div>
                )}

                {/* Search Form — only show if no assistant yet */}
                {!assistant && (
                    <form
                        onSubmit={handleSearch}
                        className="flex flex-col gap-3"
                    >
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="email"
                                    placeholder="Search by student email..."
                                    value={searchEmail}
                                    onChange={e => {
                                        setSearchEmail(e.target.value);
                                        setFoundUser(null);
                                        setSearchError("");
                                    }}
                                    className="input-field pl-10"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching || !searchEmail.trim()}
                                className="px-4 py-3 rounded-xl bg-primary-700 hover:bg-primary-600 text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
                            >
                                {searching ? (
                                    <Loader2
                                        size={16}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Search size={16} />
                                )}
                                Find
                            </button>
                        </div>

                        {/* Search Error */}
                        {searchError && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-red-500 flex items-center gap-2"
                            >
                                <AlertCircle size={14} />
                                {searchError}
                            </motion.p>
                        )}

                        {/* Found User Preview */}
                        <AnimatePresence>
                            {foundUser && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-4"
                                >
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0">
                                        <span className="text-white font-extrabold">
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
                                        <span className="inline-flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <User size={11} />
                                            Student
                                        </span>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleAssign}
                                        disabled={assigning}
                                        type="button"
                                    >
                                        {assigning ? (
                                            <Loader2
                                                size={14}
                                                className="animate-spin mr-1"
                                            />
                                        ) : (
                                            <UserCheck
                                                size={14}
                                                className="mr-1"
                                            />
                                        )}
                                        {assigning ? "Assigning..." : "Assign"}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                )}
            </div>
        </div>
    );
}
