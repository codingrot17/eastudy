import { Home, Rss, CalendarDays, FolderOpen, LayoutGrid } from "lucide-react";

// Feed replaces Announcements in bottom nav (announcements still exist in sidebar/More)
// The feed IS the primary "alive" surface students will check daily
const tabs = [
    { icon: Home, label: "Home", tab: "home" },
    { icon: Rss, label: "Feed", tab: "feed" },
    { icon: CalendarDays, label: "Schedule", tab: "schedule" },
    { icon: FolderOpen, label: "Materials", tab: "materials" },
    { icon: LayoutGrid, label: "More", tab: "more" }
];

export default function BottomNav({ activeTab, onTabChange }) {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 safe-area-pb">
            <div className="flex items-center justify-around px-2 pt-2 pb-safe">
                {tabs.map(({ icon: Icon, label, tab }) => {
                    const isActive =
                        activeTab === tab ||
                        (tab === "more" &&
                            !tabs.slice(0, 4).some(t => t.tab === activeTab));

                    return (
                        <button
                            key={tab}
                            onClick={() => onTabChange(tab)}
                            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px]"
                        >
                            <div
                                className={`p-1.5 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? "bg-primary-700 text-white shadow-md shadow-primary-700/30"
                                        : "text-slate-400 dark:text-slate-500"
                                }`}
                            >
                                <Icon size={20} />
                            </div>
                            <span
                                className={`text-[10px] font-semibold transition-colors ${
                                    isActive
                                        ? "text-primary-700 dark:text-primary-400"
                                        : "text-slate-400 dark:text-slate-500"
                                }`}
                            >
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
