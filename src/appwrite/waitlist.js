import { databases, DB_ID, WAITLIST_ID } from "./config";
import { ID } from "appwrite";

export const joinWaitlist = async ({ email, role, school = "" }) => {
    try {
        const result = await databases.createDocument(
            DB_ID,
            WAITLIST_ID,
            ID.unique(),
            {
                email,
                role,
                school,
                $createdAt: new Date().toISOString()
            }
        );
        return result;
    } catch (err) {
        console.error("Waitlist error:", err?.code, err?.message);

        if (err?.code === 409 || err?.message?.includes("unique")) {
            throw new Error("already_exists");
        }

        throw err;
    }
};
