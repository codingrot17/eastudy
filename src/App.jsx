import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import useThemeStore from "./store/useThemeStore";
import useAuthStore from "./store/useAuthStore";
import LandingPage from "./pages/LandingPage";
import RepSignup from "./pages/auth/RepSignup";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";

export default function App() {
    const init = useThemeStore(s => s.init);
    const hydrate = useAuthStore(s => s.hydrate);

    // Initialize theme on app load
    useEffect(() => {
        init();
        hydrate();
    }, []);

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth/rep/signup" element={<RepSignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/login" element={<Login />} />
        </Routes>
    );
}
