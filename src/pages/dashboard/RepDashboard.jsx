import DashboardLayout from "../../components/dashboard/DashboardLayout";
import HomeTab from "./tabs/HomeTab";
import AnnouncementsTab from "./tabs/AnnouncementsTab";
import ScheduleTab from "./tabs/ScheduleTab";
import MaterialsTab from "./tabs/MaterialsTab";
import StudentsTab from "./tabs/StudentsTab";
import QuizzesTab from "./tabs/QuizzesTab";
import GroupStudyTab from "./tabs/GroupStudyTab";
import StudyPlansTab from "./tabs/StudyPlansTab";
import MoreTab from "./tabs/MoreTab";
import SettingsTab from "./tabs/SettingsTab";
import FeedTab from "./tabs/FeedTab";
import ProfileTab from "./tabs/ProfileTab";

const tabs = {
    home: HomeTab,
    feed: FeedTab,
    announcements: AnnouncementsTab,
    schedule: ScheduleTab,
    materials: MaterialsTab,
    students: StudentsTab,
    quizzes: QuizzesTab,
    more: MoreTab,
    "group-study": GroupStudyTab,
    "study-plans": StudyPlansTab,
    settings: SettingsTab,
    profile: ProfileTab
};

export default function RepDashboard() {
    return <DashboardLayout role="rep" tabs={tabs} defaultTab="home" />;
}
