/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    darkMode: "class", // enables class-based dark mode
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#3B35C4",
                    900: "#1e1b4b"
                },
                accent: {
                    400: "#4ade80",
                    500: "#22C55E"
                }
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"]
            }
        }
    },
    plugins: []
};
