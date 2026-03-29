import DashboardLayout from "../../components/dashboard/DashboardLayout";
import StudentHomeTab from "./student-tabs/StudentHomeTab";
import StudentAnnouncementsTab from "./student-tabs/StudentAnnouncementsTab";
import StudentScheduleTab from "./student-tabs/StudentScheduleTab";
import StudentMaterialsTab from "./student-tabs/StudentMaterialsTab";
import StudentMoreTab from "./student-tabs/StudentMoreTab";

const tabs = {
    home: StudentHomeTab,
    announcements: StudentAnnouncementsTab,
    schedule: StudentScheduleTab,
    materials: StudentMaterialsTab,
    more: StudentMoreTab
};

export default function StudentDashboard() {
    return <DashboardLayout role="student" tabs={tabs} defaultTab="home" />;
}
