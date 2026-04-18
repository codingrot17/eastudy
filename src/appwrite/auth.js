import { account } from "./config";
import { OAuthProvider } from "appwrite";

// ── Email / Password ────────────────────────────

export const createAccount = async (name, email, password) => {
    const { ID } = await import("appwrite");
    return await account.create(ID.unique(), email, password, name);
};

export const loginEmail = async (email, password) => {
    try {
        // Clear any stale session before logging in
        await account.deleteSession("current");
    } catch {
        // No active session — that's fine, continue
    }
    return await account.createEmailPasswordSession(email, password);
};

export const loginGoogle = () => {
    account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/auth/failure`
    );
};

export const loginGoogleAsStudent = () => {
    account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/auth/callback?type=student`,
        `${window.location.origin}/auth/failure`
    );
};

// ── Session helpers ─────────────────────────────

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
