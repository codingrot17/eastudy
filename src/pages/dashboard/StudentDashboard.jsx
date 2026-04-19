import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StudentHomeTab from "./student-tabs/StudentHomeTab";
import StudentAnnouncementsTab from "./student-tabs/StudentAnnouncementsTab";
import StudentScheduleTab from "./student-tabs/StudentScheduleTab";
import StudentMaterialsTab from "./student-tabs/StudentMaterialsTab";
import StudentQuizzesTab from "./student-tabs/StudentQuizzesTab";
import GroupStudyTab from "./tabs/GroupStudyTab";
import StudyPlansTab from "./tabs/StudyPlansTab";
import StudentMoreTab from "./student-tabs/StudentMoreTab";
import FeedTab from "./tabs/FeedTab";

const tabs = {
    home: StudentHomeTab,
    feed: FeedTab, // ← new
    announcements: StudentAnnouncementsTab,
    schedule: StudentScheduleTab,
    materials: StudentMaterialsTab,
    quizzes: StudentQuizzesTab,
    "group-study": GroupStudyTab,
    "study-plans": StudyPlansTab,
    more: StudentMoreTab
};

export default function StudentDashboard() {
    return <DashboardLayout role="student" tabs={tabs} defaultTab="home" />;
}
