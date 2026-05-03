import webpush from "web-push";
import { Client, Databases, Query } from "node-appwrite";

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL; // e.g. mailto:you@example.com

const DB_ID = process.env.APPWRITE_DATABASE_ID;
const PUSH_SUBS_ID = process.env.PUSH_SUBS_COLLECTION_ID;

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

export default async ({ req, res, log, error }) => {
    const client = new Client()
        .setEndpoint(process.env.APPWRITE_ENDPOINT)
        .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
        .setKey(process.env.APPWRITE_API_KEY);

    const db = new Databases(client);

    // Parse the event payload Appwrite sends
    const eventData = req.body;
    const eventType = req.headers["x-appwrite-event"] ?? "";

    log("Event:", eventType);
    log("Payload:", JSON.stringify(eventData).slice(0, 300));

    // Build notification content based on event type
    let notification = null;
    let targetDepartmentId = eventData?.departmentId;

    if (eventType.includes("announcements") && eventType.includes("create")) {
        notification = {
            title: eventData.pinned
                ? `📌 Pinned: ${eventData.repName ?? "Your Rep"}`
                : `📢 ${eventData.repName ?? "Your Rep"}`,
            body: (eventData.content ?? "").slice(0, 120),
            tag: `announcement-${eventData.$id}`,
            url: "/dashboard/student",
            icon: "/favicon.svg"
        };
    } else if (
        eventType.includes("schedules") &&
        (eventType.includes("create") || eventType.includes("update"))
    ) {
        const action = eventType.includes("create") ? "added" : "updated";
        notification = {
            title: `📅 Schedule ${action} — ${eventData.day}`,
            body: `${eventData.courseCode}: ${eventData.courseName} at ${eventData.startTime} in ${eventData.venue}`,
            tag: `schedule-${action}-${eventData.$id}`,
            url: "/dashboard/student",
            icon: "/favicon.svg"
        };
    } else if (
        eventType.includes("quizzes") &&
        eventType.includes("update") &&
        eventData.published === true
    ) {
        notification = {
            title: "📝 New Quiz Available",
            body: `${eventData.title} — tap to take it now`,
            tag: `quiz-published-${eventData.$id}`,
            url: "/dashboard/student",
            icon: "/favicon.svg"
        };
    } else if (
        eventType.includes("materials") &&
        eventType.includes("create")
    ) {
        notification = {
            title: "📂 New Material Added",
            body: `${eventData.title} · ${eventData.category}`,
            tag: `material-${eventData.$id}`,
            url: "/dashboard/student",
            icon: "/favicon.svg"
        };
    } else if (
        eventType.includes("group_study") &&
        eventType.includes("create")
    ) {
        notification = {
            title: "📚 New Study Session",
            body: `${eventData.title} — ${eventData.date} at ${eventData.time} · ${eventData.location}`,
            tag: `group-study-${eventData.$id}`,
            url: "/dashboard/student",
            icon: "/favicon.svg"
        };
    } else if (eventType.includes("posts") && eventType.includes("create")) {
        // Feed post — notify department
        const typeLabel =
            eventData.type === "question"
                ? "❓ Question"
                : eventData.type === "resource"
                  ? "📎 Resource"
                  : "💬 Post";
        notification = {
            title: `${typeLabel} from ${eventData.authorName}`,
            body: (eventData.content ?? "").slice(0, 100),
            tag: `post-${eventData.$id}`,
            url: "/dashboard/student",
            icon: "/favicon.svg"
        };
    }

    if (!notification || !targetDepartmentId) {
        log("No notification needed or missing departmentId, skipping.");
        return res.json({ ok: true, sent: 0 });
    }

    // Fetch all push subscriptions for this department
    let subscriptions = [];
    try {
        const result = await db.listDocuments(DB_ID, PUSH_SUBS_ID, [
            Query.equal("departmentId", targetDepartmentId),
            Query.limit(500)
        ]);
        subscriptions = result.documents;
    } catch (err) {
        error("Failed to fetch subscriptions:", err.message);
        return res.json({ ok: false, error: err.message });
    }

    log(`Sending to ${subscriptions.length} subscribers`);

    const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        tag: notification.tag,
        url: notification.url
    });

    // Send to all subscribers — collect stale ones to clean up
    const staleIds = [];
    const sends = subscriptions.map(async sub => {
        const pushSub = {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth }
        };
        try {
            await webpush.sendNotification(pushSub, payload);
            log("Sent to:", sub.userId);
        } catch (err) {
            if (err.statusCode === 404 || err.statusCode === 410) {
                // Subscription expired — mark for cleanup
                staleIds.push(sub.$id);
                log("Stale subscription, will delete:", sub.$id);
            } else {
                error("Push failed for", sub.userId, ":", err.message);
            }
        }
    });

    await Promise.allSettled(sends);

    // Clean up expired subscriptions
    await Promise.allSettled(
        staleIds.map(id => db.deleteDocument(DB_ID, PUSH_SUBS_ID, id))
    );

    return res.json({ ok: true, sent: subscriptions.length - staleIds.length });
};
