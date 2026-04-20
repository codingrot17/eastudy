import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    "vendor-appwrite": ["appwrite"],
                    "vendor-framer": ["framer-motion"],
                    "vendor-react": ["react", "react-dom", "react-router-dom"],
                    "vendor-icons": ["lucide-react"],
                    "vendor-state": ["zustand"]
                }
            }
        }
    },

    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "react-router-dom",
            "appwrite",
            "framer-motion",
            "lucide-react",
            "zustand"
        ]
    }
});
