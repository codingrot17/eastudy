import {
    BookOpen,
    Home,
    Rss,
    Megaphone,
    CalendarDays,
    FolderOpen,
    ClipboardList,
    Users,
    UsersRound,
    Lightbulb,
    Settings,
    LogOut,
    Copy,
    Check,
    Download,
    Bell,
    BellOff
} from "lucide-react";
import { useState } from "react";
import { usePWAContext } from "../pwa/PWAProvider";

const repNav = [
    { icon: Home, label: "Home", tab: "home" },
    { icon: Rss, label: "Feed", tab: "feed" },
    { icon: Megaphone, label: "Announcements", tab: "announcements" },
    { icon: CalendarDays, label: "Schedule", tab: "schedule" },
    { icon: FolderOpen, label: "Materials", tab: "materials" },
    { icon: ClipboardList, label: "Quizzes", tab: "quizzes" },
    { icon: UsersRound, label: "Group Study", tab: "group-study" },
    { icon: Users, label: "Students", tab: "students" },
    { icon: Lightbulb, label: "Study Plans", tab: "study-plans" }
];

export default function Sidebar({
    role,
    user,
    department,
    activeTab,
    onTabChange,
    onLogout,
    loggingOut
}) {
    const [copied, setCopied] = useState(false);
    const pwa = usePWAContext();

    const copyCode = () => {
        if (!department?.code) return;
        navigator.clipboard.writeText(department.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#1E1B4B] text-white z-40 overflow-y-auto">
            {/* Logo */}
            <div className="px-6 py-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-white leading-none">
                            Eastudy
                        </p>
                        <p className="text-xs text-indigo-300 mt-0.5 capitalize">
                            {role}
                        </p>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {repNav.map(({ icon: Icon, label, tab }) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
                            activeTab === tab
                                ? "bg-white/15 text-white shadow-sm"
                                : "text-indigo-200 hover:bg-white/8 hover:text-white"
                        }`}
                    >
                        <Icon
                            size={18}
                            className={activeTab === tab ? "text-cyan-400" : ""}
                        />
                        {label}
                        {activeTab === tab && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Dept Code Widget */}
            {role === "rep" && department?.code && (
                <div className="mx-3 mb-3 bg-white/8 rounded-xl p-4 border border-white/10">
                    <p className="text-xs text-indigo-300 uppercase tracking-widest mb-2 font-medium">
                        Class Code
                    </p>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-white tracking-wider text-sm">
                            {department.code}
                        </span>
                        <button
                            onClick={copyCode}
                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            {copied ? (
                                <Check size={14} className="text-cyan-400" />
                            ) : (
                                <Copy size={14} className="text-indigo-300" />
                            )}
                        </button>
                    </div>
                    <p className="text-xs text-indigo-400 mt-2 truncate">
                        {department.name} · {department.level}
                    </p>
                </div>
            )}

            {/* Install App Button */}
            {pwa?.canInstall && (
                <div className="mx-3 mb-3">
                    <button
                        onClick={pwa.install}
                        disabled={pwa.isInstalling}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-all disabled:opacity-60"
                    >
                        <Download size={16} className="text-cyan-400" />
                        {pwa.isInstalling
                            ? "Installing..."
                            : "Install Eastudy App"}
                    </button>
                </div>
            )}

            {/* Bottom Actions */}
            <div className="px-3 pb-6 flex flex-col gap-1 border-t border-white/10 pt-4">
                <button
                    onClick={() =>
                        pwa?.notifPermission === "default" &&
                        pwa?.requestNotifPermission()
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-200 hover:bg-white/8 hover:text-white transition-all"
                >
                    {pwa?.notifPermission === "granted" ? (
                        <>
                            <Bell size={18} className="text-green-400" />
                            Notifications On
                            <span className="ml-auto w-2 h-2 rounded-full bg-green-400" />
                        </>
                    ) : pwa?.notifPermission === "denied" ? (
                        <>
                            <BellOff size={18} className="text-red-400" />
                            Notifications Off
                        </>
                    ) : (
                        <>
                            <Bell size={18} className="text-amber-400" />
                            Enable Notifications
                            <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        </>
                    )}
                </button>

                <button
                    onClick={() => onTabChange("settings")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        activeTab === "settings"
                            ? "bg-white/15 text-white"
                            : "text-indigo-200 hover:bg-white/8 hover:text-white"
                    }`}
                >
                    <Settings size={18} />
                    Settings
                </button>

                <button
                    onClick={onLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-indigo-200 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut size={18} />
                    {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
            </div>
        </aside>
    );
}
