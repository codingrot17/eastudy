import { useState, useEffect } from "react";
import { databases, DB_ID } from "../appwrite/config";
import { Query } from "appwrite";

const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
const MATERIALS_ID = import.meta.env.VITE_APPWRITE_MATERIALS_COLLECTION_ID;
const SCHEDULES_ID = import.meta.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID;

export function useDashboardStats(departmentId) {
    const [stats, setStats] = useState({
        announcements: 0,
        materials: 0,
        classesToday: 0,
        quizzes: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!departmentId) return;

        const load = async () => {
            setLoading(true);
            try {
                const todayName = new Date().toLocaleDateString("en-US", {
                    weekday: "long"
                });

                const [announcementsRes, materialsRes, schedulesTodayRes] =
                    await Promise.all([
                        databases.listDocuments(DB_ID, ANNOUNCEMENTS_ID, [
                            Query.equal("departmentId", departmentId),
                            Query.limit(1)
                        ]),
                        databases.listDocuments(DB_ID, MATERIALS_ID, [
                            Query.equal("departmentId", departmentId),
                            Query.limit(1)
                        ]),
                        databases.listDocuments(DB_ID, SCHEDULES_ID, [
                            Query.equal("departmentId", departmentId),
                            Query.equal("day", todayName),
                            Query.limit(25)
                        ])
                    ]);

                setStats({
                    announcements: announcementsRes.total,
                    materials: materialsRes.total,
                    classesToday: schedulesTodayRes.total,
                    quizzes: 0 // placeholder until quizzes are built
                });
            } catch {
                // fail silently — stats are non-critical
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [departmentId]);

    return { stats, loading };
}
