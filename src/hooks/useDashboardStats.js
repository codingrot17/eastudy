import { useState, useEffect } from "react";
import { databases, DB_ID } from "../appwrite/config";
import { Query } from "appwrite";

const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
const SCHEDULES_ID = import.meta.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID;
const MATERIALS_ID = import.meta.env.VITE_APPWRITE_MATERIALS_COLLECTION_ID;
const USERS_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const QUIZZES_ID = import.meta.env.VITE_APPWRITE_QUIZZES_COLLECTION_ID;

export function useDashboardStats(departmentId) {
    const [stats, setStats] = useState({
        announcements: 0,
        materials: 0,
        classesToday: 0,
        quizzes: 0,
        studentsRegistered: 0
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

                const [
                    announcementsRes,
                    schedulesTodayRes,
                    materialsRes,
                    studentsRes,
                    quizzesRes
                ] = await Promise.all([
                    databases.listDocuments(DB_ID, ANNOUNCEMENTS_ID, [
                        Query.equal("departmentId", departmentId),
                        Query.limit(1)
                    ]),
                    databases.listDocuments(DB_ID, SCHEDULES_ID, [
                        Query.equal("departmentId", departmentId),
                        Query.equal("day", todayName),
                        Query.limit(25)
                    ]),
                    databases.listDocuments(DB_ID, MATERIALS_ID, [
                        Query.equal("departmentId", departmentId),
                        Query.limit(1)
                    ]),
                    databases.listDocuments(DB_ID, USERS_ID, [
                        Query.equal("departmentId", departmentId),
                        Query.limit(1)
                    ]),
                    databases.listDocuments(DB_ID, QUIZZES_ID, [
                        Query.equal("departmentId", departmentId),
                        Query.equal("published", true),
                        Query.limit(1)
                    ])
                ]);

                setStats({
                    announcements: announcementsRes.total,
                    classesToday: schedulesTodayRes.total,
                    materials: materialsRes.total,
                    studentsRegistered: studentsRes.total,
                    quizzes: quizzesRes.total
                });
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
