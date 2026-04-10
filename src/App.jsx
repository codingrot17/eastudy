import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import useThemeStore from "./store/useThemeStore";
import useAuthStore from "./store/useAuthStore";
import PWAProvider from "./components/pwa/PWAProvider";
import LandingPage from "./pages/LandingPage";
import RepSignup from "./pages/auth/RepSignup";
import StudentSignup from "./pages/auth/StudentSignup";
import Login from "./pages/auth/Login";
import AuthCallback from "./pages/auth/AuthCallback";
import RepDashboard from "./pages/dashboard/RepDashboard";
import AssistantDashboard from "./pages/dashboard/AssistantDashboard";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import PwaStart from "./pages/PwaStart";

export default function App() {
    const init = useThemeStore(s => s.init);
    const hydrate = useAuthStore(s => s.hydrate);

    useEffect(() => {
        init();
        hydrate();
    }, []);

    return (
        <PWAProvider>
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/rep/signup" element={<RepSignup />} />
                <Route
                    path="/auth/student/signup"
                    element={<StudentSignup />}
                />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* PWA entry point — redirects to dashboard or login */}
                <Route path="/pwa-start" element={<PwaStart />} />

                {/* Protected */}
                <Route
                    path="/dashboard/rep"
                    element={
                        <ProtectedRoute role="rep">
                            <RepDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/student"
                    element={
                        <ProtectedRoute role="student">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/assistant"
                    element={
                        <ProtectedRoute role="assistant">
                            <AssistantDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </PWAProvider>
    );
}
