import { account } from "./config";

// ── Email / Password ────────────────────────────

export const createAccount = async (name, email, password) => {
    const { ID } = await import("appwrite");
    return await account.create(ID.unique(), email, password, name);
};

export const loginEmail = async (email, password) => {
    // Attempt to clear any stale session. A 401 here just means the user
    // is already a guest (no session) — that's fine, we swallow it and
    // proceed. Any other error is also non-fatal; we still attempt login.
    try {
        await account.deleteSession("current");
    } catch {
        // 401 = guest (no session to delete) — expected, not an error
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
    window.location.href = buildOAuthURL("/auth/callback", "/auth/failure");
};

export const loginGoogleAsStudent = () => {
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
