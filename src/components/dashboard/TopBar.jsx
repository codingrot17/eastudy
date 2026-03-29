import { BookOpen, LogOut, Bell } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";

export default function TopBar({ user, role, onLogout, loggingOut }) {
    return (
        <header className="lg:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center">
                        <BookOpen size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-sm leading-none text-slate-900 dark:text-white">
                            Eastudy
                        </p>
                        <p className="text-[10px] text-slate-400 capitalize">
                            {role}
                        </p>
                    </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    <button className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                        <Bell size={20} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
                    </button>
                    <button
                        onClick={onLogout}
                        disabled={loggingOut}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
