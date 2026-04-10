import DashboardLayout from "../../components/dashboard/DashboardLayout";
import HomeTab from "./tabs/HomeTab";
import AnnouncementsTab from "./tabs/AnnouncementsTab";
import ScheduleTab from "./tabs/ScheduleTab";
import MaterialsTab from "./tabs/MaterialsTab";
import StudentsTab from "./tabs/StudentsTab";
import QuizzesTab from "./tabs/QuizzesTab";
import MoreTab from "./tabs/MoreTab";
import AssistantSettingsTab from "./tabs/AssistantSettingsTab";

const tabs = {
    home: HomeTab,
    announcements: AnnouncementsTab,
    schedule: ScheduleTab,
    materials: MaterialsTab,
    students: StudentsTab,
    quizzes: QuizzesTab,
    more: MoreTab,
    "group-study": MoreTab,
    "study-plans": MoreTab,
    settings: AssistantSettingsTab
};

export default function AssistantDashboard() {
    return <DashboardLayout role="assistant" tabs={tabs} defaultTab="home" />;
}
