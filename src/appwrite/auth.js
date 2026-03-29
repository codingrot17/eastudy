import { account } from "./config";
import { OAuthProvider } from "appwrite";

// ── Email/Password ──────────────────────────────

export const createAccount = async (name, email, password) => {
    // Creates the Appwrite auth account
    const { ID } = await import("appwrite");
    return await account.create(ID.unique(), email, password, name);
};

export const loginEmail = async (email, password) => {
    try {
        // Delete existing session first if any
        await account.deleteSession("current");
    } catch {}
    return await account.createEmailPasswordSession(email, password);
};

export const loginGoogle = async () => {
    try {
        await account.deleteSession("current");
    } catch {}
    account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/auth/failure`
    );
};

export const loginGoogleAsStudent = async () => {
    try {
        await account.deleteSession("current");
    } catch {
        /* no session */
    }

    account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback?type=student`,
        `${window.location.origin}/auth/failure`
    );
};

export const getCurrentUser = async () => {
    try {
        return await account.get();
    } catch {
        return null;
    }
};

export const logout = async () => {
    return await account.deleteSession("current");
};
