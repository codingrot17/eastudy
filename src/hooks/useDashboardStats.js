import { useState, useEffect } from "react";
import { databases, DB_ID } from "../appwrite/config";
import { Query } from "appwrite";

const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
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
        if (!departmentId) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            try {
                const todayName = new Date().toLocaleDateString("en-US", {
                    weekday: "long"
                });

                const [announcementsRes, schedulesTodayRes] = await Promise.all(
                    [
                        databases.listDocuments(DB_ID, ANNOUNCEMENTS_ID, [
                            Query.equal("departmentId", departmentId),
                            Query.limit(1)
                        ]),
                        databases.listDocuments(DB_ID, SCHEDULES_ID, [
                            Query.equal("departmentId", departmentId),
                            Query.equal("day", todayName),
                            Query.limit(25)
                        ])
                    ]
                );

                setStats(prev => ({
                    ...prev,
                    announcements: announcementsRes.total,
                    classesToday: schedulesTodayRes.total
                }));
            } catch (err) {
                console.warn("useDashboardStats error:", err?.message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [departmentId]);

    return { stats, loading };
}
