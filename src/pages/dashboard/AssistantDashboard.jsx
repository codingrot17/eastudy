import DashboardLayout from "../../components/dashboard/DashboardLayout";
import HomeTab from "./tabs/HomeTab";
import AnnouncementsTab from "./tabs/AnnouncementsTab";
import ScheduleTab from "./tabs/ScheduleTab";
import MaterialsTab from "./tabs/MaterialsTab";
import MoreTab from "./tabs/MoreTab";
import AssistantSettingsTab from "./tabs/AssistantSettingsTab";

const tabs = {
    home: HomeTab,
    announcements: AnnouncementsTab,
    schedule: ScheduleTab,
    materials: MaterialsTab,
    more: MoreTab,
    quizzes: MoreTab,
    "group-study": MoreTab,
    "study-plans": MoreTab,
    settings: AssistantSettingsTab
};

export default function AssistantDashboard() {
    return <DashboardLayout role="assistant" tabs={tabs} defaultTab="home" />;
}
