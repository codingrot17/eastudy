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
import AssistantSettingsTab from "./tabs/AssistantSettingsTab";

const tabs = {
    home: HomeTab,
    announcements: AnnouncementsTab,
    schedule: ScheduleTab,
    materials: MaterialsTab,
    students: StudentsTab,
    quizzes: QuizzesTab,
    more: MoreTab,
    "group-study": GroupStudyTab,
    "study-plans": StudyPlansTab,
    settings: AssistantSettingsTab
};

export default function AssistantDashboard() {
    return <DashboardLayout role="assistant" tabs={tabs} defaultTab="home" />;
}
