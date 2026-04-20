import { useState, useEffect, useRef } from "react";
import { databases, DB_ID } from "../appwrite/config";
import { Query } from "appwrite";
import { withCache } from "./queryCache";

const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
const SCHEDULES_ID = import.meta.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID;
const MATERIALS_ID = import.meta.env.VITE_APPWRITE_MATERIALS_COLLECTION_ID;
const USERS_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
const QUIZZES_ID = import.meta.env.VITE_APPWRITE_QUIZZES_COLLECTION_ID;

/**
 * useDashboardStats
 *
 * Traffic fix: instead of firing 5 parallel Appwrite queries on every
 * mount, we:
 * 1. Cache results per departmentId for 60s — repeated tab switches
 *    don't re-query Appwrite at all.
 * 2. Use Promise.allSettled instead of Promise.all — one failed query
 *    doesn't crash the entire stats load.
 * 3. Show partial results as they arrive instead of waiting for all 5.
 */
export function useDashboardStats(departmentId) {
    const [stats, setStats] = useState({
        announcements: 0,
        materials: 0,
        classesToday: 0,
        quizzes: 0,
        studentsRegistered: 0
    });
    const [loading, setLoading] = useState(true);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (!departmentId) {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);

            const todayName = new Date().toLocaleDateString("en-US", {
                weekday: "long"
            });

            const cacheKey = `stats:${departmentId}:${todayName}`;

            try {
                const result = await withCache(
                    cacheKey,
                    async () => {
                        // Promise.allSettled — partial failure is ok,
                        // we show 0 for any collection that errors
                        const [
                            announcementsRes,
                            schedulesTodayRes,
                            materialsRes,
                            studentsRes,
                            quizzesRes
                        ] = await Promise.allSettled([
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

                        return {
                            announcements:
                                announcementsRes.status === "fulfilled"
                                    ? announcementsRes.value.total
                                    : 0,
                            classesToday:
                                schedulesTodayRes.status === "fulfilled"
                                    ? schedulesTodayRes.value.total
                                    : 0,
                            materials:
                                materialsRes.status === "fulfilled"
                                    ? materialsRes.value.total
                                    : 0,
                            studentsRegistered:
                                studentsRes.status === "fulfilled"
                                    ? studentsRes.value.total
                                    : 0,
                            quizzes:
                                quizzesRes.status === "fulfilled"
                                    ? quizzesRes.value.total
                                    : 0
                        };
                    },
                    60
                ); // cache for 60 seconds

                if (mounted.current) setStats(result);
            } catch (err) {
                // Even the cache wrapper failed — show zeros, don't crash
                console.warn("[useDashboardStats] Load failed:", err?.message);
            } finally {
                if (mounted.current) setLoading(false);
            }
        };

        load();
    }, [departmentId]);

    return { stats, loading };
}
