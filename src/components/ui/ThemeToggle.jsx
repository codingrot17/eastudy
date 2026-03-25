import { Sun, Moon } from "lucide-react";
import useThemeStore from "../../store/useThemeStore";

export default function ThemeToggle() {
    const { isDark, toggle } = useThemeStore();

    return (
        <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all duration-200"
        >
            {isDark ? (
                <Sun size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} />
            )}
        </button>
    );
}
