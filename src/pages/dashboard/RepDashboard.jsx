import DashboardLayout from "../../components/dashboard/DashboardLayout";
import HomeTab from "./tabs/HomeTab";
import AnnouncementsTab from "./tabs/AnnouncementsTab";
import ScheduleTab from "./tabs/ScheduleTab";
import MaterialsTab from "./tabs/MaterialsTab";
import MoreTab from "./tabs/MoreTab";

const tabs = {
    home: HomeTab,
    announcements: AnnouncementsTab,
    schedule: ScheduleTab,
    materials: MaterialsTab,
    more: MoreTab,
    // more tabs route back to more
    quizzes: MoreTab,
    "group-study": MoreTab,
    "study-plans": MoreTab,
    settings: MoreTab
};

export default function RepDashboard() {
    return <DashboardLayout role="rep" tabs={tabs} defaultTab="home" />;
}
