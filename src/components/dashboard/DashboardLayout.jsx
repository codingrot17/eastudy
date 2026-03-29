import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../appwrite/auth";
import useAuthStore from "../../store/useAuthStore";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function DashboardLayout({ role, tabs, defaultTab = "home" }) {
    const navigate = useNavigate();
    const { user, profile, department, clear } = useAuthStore();
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            clear();
            navigate("/");
        } catch {
            setLoggingOut(false);
        }
    };

    const ActiveComponent = tabs[activeTab] ?? tabs[defaultTab];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            {/* Desktop Sidebar */}
            <Sidebar
                role={role}
                user={user}
                department={department}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onLogout={handleLogout}
                loggingOut={loggingOut}
            />

            {/* Mobile Top Bar */}
            <TopBar
                user={user}
                role={role}
                onLogout={handleLogout}
                loggingOut={loggingOut}
            />

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-8">
                    <ActiveComponent
                        user={user}
                        profile={profile}
                        department={department}
                        onTabChange={setActiveTab}
                    />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
    );
}
