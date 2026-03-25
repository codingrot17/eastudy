import { create } from "zustand";
import { persist } from "zustand/middleware";

const useThemeStore = create(
    persist(
        set => ({
            isDark: false,
            toggle: () =>
                set(state => {
                    const next = !state.isDark;
                    // Apply class to <html> element
                    document.documentElement.classList.toggle("dark", next);
                    return { isDark: next };
                }),
            init: () => {
                const stored = localStorage.getItem("theme-storage");
                if (stored) {
                    const { state } = JSON.parse(stored);
                    document.documentElement.classList.toggle(
                        "dark",
                        state.isDark
                    );
                }
            }
        }),
        { name: "theme-storage" }
    )
);

export default useThemeStore;
