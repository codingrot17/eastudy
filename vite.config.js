import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],

    build: {
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules/appwrite"))
                        return "vendor-appwrite";
                    if (id.includes("node_modules/framer-motion"))
                        return "vendor-framer";
                    if (
                        id.includes("node_modules/react-dom") ||
                        id.includes("node_modules/react-router")
                    )
                        return "vendor-react";
                    if (id.includes("node_modules/react"))
                        return "vendor-react";
                    if (id.includes("node_modules/lucide-react"))
                        return "vendor-icons";
                    if (id.includes("node_modules/zustand"))
                        return "vendor-state";
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
