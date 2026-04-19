import { account } from "./config";
import { OAuthProvider } from "appwrite";

// ── Email / Password ────────────────────────────

export const createAccount = async (name, email, password) => {
    const { ID } = await import("appwrite");
    return await account.create(ID.unique(), email, password, name);
};

export const loginEmail = async (email, password) => {
    try {
        // Clear any stale session first
        await account.deleteSession("current");
    } catch {
        // No active session — fine
    }
    return await account.createEmailPasswordSession(email, password);
};

// Build Appwrite OAuth URL manually so we can redirect synchronously
function buildOAuthURL(successPath, failurePath) {
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
    const provider = "google";

    const successURL = encodeURIComponent(
        `${window.location.origin}${successPath}`
    );
    const failureURL = encodeURIComponent(
        `${window.location.origin}${failurePath}`
    );

    return `${endpoint}/account/sessions/oauth2/${provider}?project=${projectId}&success=${successURL}&failure=${failureURL}`;
}

export const loginGoogle = () => {
    // Fully synchronous — Safari allows this from a click handler
    window.location.href = buildOAuthURL("/auth/callback", "/auth/failure");
};

export const loginGoogleAsStudent = () => {
    // Fully synchronous — Safari allows this from a click handler
    window.location.href = buildOAuthURL(
        "/auth/callback?type=student",
        "/auth/failure"
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
