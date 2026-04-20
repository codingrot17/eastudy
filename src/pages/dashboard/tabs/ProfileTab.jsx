import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Mail,
    Building2,
    GraduationCap,
    ShieldCheck,
    LogOut,
    Pencil,
    Check,
    X,
    Loader2,
    Moon,
    Sun,
    Bell,
    BellOff,
    BookOpen,
    Hash,
    Calendar
} from "lucide-react";
import { account } from "../../../appwrite/config";
import { databases, DB_ID, USERS_ID } from "../../../appwrite/config";
import { Query } from "appwrite";
import useAuthStore from "../../../store/useAuthStore";
import useThemeStore from "../../../store/useThemeStore";
import { usePWAContext } from "../../../components/pwa/PWAProvider";
import { logout } from "../../../appwrite/auth";
import Button from "../../../components/ui/Button";

// Role display config
const ROLE_CONFIG = {
    rep: {
        label: "Class Rep",
        icon: ShieldCheck,
        color: "text-primary-700 dark:text-primary-400",
        bg: "bg-primary-50 dark:bg-primary-900/20",
        border: "border-primary-200 dark:border-primary-800"
    },
    assistant: {
        label: "Assistant Rep",
        icon: ShieldCheck,
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        border: "border-cyan-200 dark:border-cyan-800"
    },
    student: {
        label: "Student",
        icon: GraduationCap,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800"
    }
};

export default function ProfileTab({ user, profile, department }) {
    const navigate = useNavigate();
    const { clear, setAuth } = useAuthStore();
    const { isDark, toggle: toggleTheme } = useThemeStore();
    const pwa = usePWAContext();

    const [editing, setEditing] = useState(false);
    const [nameValue, setNameValue] = useState(user?.name ?? "");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [loggingOut, setLoggingOut] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const roleConfig = ROLE_CONFIG[profile?.role] ?? ROLE_CONFIG.student;
    const RoleIcon = roleConfig.icon;

    // Avatar initials — up to 2 chars
    const initials = (user?.name ?? "?")
        .split(" ")
        .slice(0, 2)
        .map(w => w[0]?.toUpperCase() ?? "")
        .join("");

    // ── Save name ────────────────────────────────
    const handleSaveName = async () => {
        const trimmed = nameValue.trim();
        if (!trimmed || trimmed === user?.name) {
            setEditing(false);
            return;
        }
        if (trimmed.length < 2) {
            setSaveError("Name must be at least 2 characters.");
            return;
        }
        setSaving(true);
        setSaveError("");
        try {
            // Update Appwrite auth account name
            await account.updateName(trimmed);

            // Update the users collection doc
            const res = await databases.listDocuments(DB_ID, USERS_ID, [
                Query.equal("authId", user.$id)
            ]);
            if (res.total > 0) {
                await databases.updateDocument(
                    DB_ID,
                    USERS_ID,
                    res.documents[0].$id,
                    {
                        name: trimmed
                    }
                );
            }

            // Update local Zustand state so UI reflects immediately
            setAuth(
                { ...user, name: trimmed },
                { ...profile, name: trimmed },
                department
            );
            setEditing(false);
        } catch (err) {
            setSaveError(
                err?.message || "Failed to update name. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setNameValue(user?.name ?? "");
        setSaveError("");
        setEditing(false);
    };

    // ── Logout ───────────────────────────────────
    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            clear();
            navigate("/");
        } catch {
            setLoggingOut(false);
            setShowLogoutConfirm(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div>
                <h2 className="text-xl font-extrabold">Profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Your account and preferences
                </p>
            </div>

            {/* ── Avatar + Name card ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-700 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-extrabold text-2xl tracking-tight">
                                {initials}
                            </span>
                        </div>
                        {/* Role badge on avatar */}
                        <div
                            className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full ${roleConfig.bg} ${roleConfig.border} border-2 flex items-center justify-center`}
                        >
                            <RoleIcon size={13} className={roleConfig.color} />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Name + edit */}
                        {editing ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        autoFocus
                                        value={nameValue}
                                        onChange={e =>
                                            setNameValue(e.target.value)
                                        }
                                        maxLength={60}
                                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-600 transition"
                                        onKeyDown={e => {
                                            if (e.key === "Enter")
                                                handleSaveName();
                                            if (e.key === "Escape")
                                                handleCancelEdit();
                                        }}
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        disabled={saving}
                                        className="p-2 rounded-xl bg-primary-700 hover:bg-primary-600 text-white transition-colors disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <Loader2
                                                size={15}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Check size={15} />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>
                                {saveError && (
                                    <p className="text-xs text-red-500">
                                        {saveError}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-start gap-2">
                                <div className="min-w-0">
                                    <p className="font-bold text-lg leading-tight truncate">
                                        {user?.name ?? "—"}
                                    </p>
                                    <span
                                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${roleConfig.bg} ${roleConfig.color}`}
                                    >
                                        <RoleIcon size={10} />
                                        {roleConfig.label}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setEditing(true)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors shrink-0 mt-0.5"
                                    title="Edit name"
                                >
                                    <Pencil size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email row */}
                <div className="flex items-center gap-3 px-1">
                    <Mail size={15} className="text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {user?.email ?? "—"}
                    </p>
                </div>

                {/* Member since */}
                {user?.$createdAt && (
                    <div className="flex items-center gap-3 px-1">
                        <Calendar
                            size={15}
                            className="text-slate-400 shrink-0"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Joined{" "}
                            {new Date(user.$createdAt).toLocaleDateString(
                                "en-US",
                                {
                                    month: "long",
                                    year: "numeric"
                                }
                            )}
                        </p>
                    </div>
                )}
            </div>

            {/* ── Department card ── */}
            {department && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                            <Building2 size={18} className="text-indigo-500" />
                        </div>
                        <p className="font-bold">Your Department</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {
                                icon: BookOpen,
                                label: "Department",
                                value: department.name
                            },
                            {
                                icon: Building2,
                                label: "School",
                                value: department.school
                            },
                            {
                                icon: GraduationCap,
                                label: "Level",
                                value: department.level
                            },
                            {
                                icon: Calendar,
                                label: "Session",
                                value: department.session
                            },
                            ...(department.code
                                ? [
                                      {
                                          icon: Hash,
                                          label: "Class Code",
                                          value: department.code,
                                          mono: true
                                      }
                                  ]
                                : [])
                        ].map(({ icon: Icon, label, value, mono }) => (
                            <div key={label} className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                    <Icon size={11} />
                                    {label}
                                </div>
                                <p
                                    className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${mono ? "font-mono tracking-wider" : ""}`}
                                >
                                    {value ?? "—"}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Preferences card ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <p className="px-5 pt-4 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    Preferences
                </p>

                {/* Dark mode toggle */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {isDark ? (
                            <Sun size={17} className="text-yellow-500" />
                        ) : (
                            <Moon size={17} className="text-slate-600" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold">
                            {isDark ? "Light mode" : "Dark mode"}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Currently using {isDark ? "dark" : "light"} theme
                        </p>
                    </div>
                    {/* Toggle visual */}
                    <div
                        className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? "bg-primary-700" : "bg-slate-200 dark:bg-slate-700"}`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isDark ? "translate-x-6" : "translate-x-1"}`}
                        />
                    </div>
                </button>

                {/* Notifications toggle */}
                <button
                    onClick={() =>
                        pwa?.notifPermission === "default" &&
                        pwa?.requestNotifPermission()
                    }
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-t border-slate-100 dark:border-slate-800"
                >
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            pwa?.notifPermission === "granted"
                                ? "bg-green-50 dark:bg-green-900/20"
                                : "bg-slate-100 dark:bg-slate-800"
                        }`}
                    >
                        {pwa?.notifPermission === "granted" ? (
                            <Bell size={17} className="text-green-500" />
                        ) : pwa?.notifPermission === "denied" ? (
                            <BellOff size={17} className="text-red-400" />
                        ) : (
                            <Bell size={17} className="text-slate-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold">Notifications</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {pwa?.notifPermission === "granted"
                                ? "You'll get alerts for new announcements"
                                : pwa?.notifPermission === "denied"
                                  ? "Blocked — enable in browser settings"
                                  : "Tap to enable push notifications"}
                        </p>
                    </div>
                    {pwa?.notifPermission === "granted" && (
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    )}
                    {pwa?.notifPermission === "default" && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                    )}
                </button>
            </div>

            {/* ── Sign out card ── */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <AnimatePresence mode="wait">
                    {!showLogoutConfirm ? (
                        <motion.button
                            key="logout-btn"
                            initial={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left"
                        >
                            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                <LogOut size={17} className="text-red-500" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                    Sign out
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    You'll need to sign in again to access your
                                    dashboard
                                </p>
                            </div>
                        </motion.button>
                    ) : (
                        <motion.div
                            key="logout-confirm"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-5 flex flex-col gap-3"
                        >
                            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                Sign out of Eastudy?
                            </p>
                            <p className="text-xs text-slate-400">
                                Your data is saved. You can sign back in
                                anytime.
                            </p>
                            <div className="flex gap-2 mt-1">
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loggingOut && (
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                    )}
                                    {loggingOut
                                        ? "Signing out…"
                                        : "Yes, sign out"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Version footer */}
            <p className="text-center text-xs text-slate-300 dark:text-slate-700 pb-2">
                Eastudy · Built for Nigerian universities
            </p>
        </div>
    );
}
