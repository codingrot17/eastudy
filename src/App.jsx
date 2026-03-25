import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import useThemeStore from "./store/useThemeStore";
import LandingPage from "./pages/LandingPage";

export default function App() {
    const init = useThemeStore(s => s.init);

    // Initialize theme on app load
    useEffect(() => {
        init();
    }, []);

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Auth routes come later */}
        </Routes>
    );
}
