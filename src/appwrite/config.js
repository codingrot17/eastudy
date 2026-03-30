import { Client, Databases, Account } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const WAITLIST_ID = import.meta.env.VITE_APPWRITE_WAITLIST_COLLECTION_ID;
export const USERS_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID;
export const DEPARTMENTS_ID = import.meta.env
    .VITE_APPWRITE_DEPARTMENTS_COLLECTION_ID;
export const ANNOUNCEMENTS_ID = import.meta.env
    .VITE_APPWRITE_ANNOUNCEMENTS_COLLECTION_ID;
