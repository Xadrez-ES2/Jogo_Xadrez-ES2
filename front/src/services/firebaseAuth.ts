import type { User } from "firebase/auth";
import type { AuthService, AuthUser } from "../types/auth";

const env = import.meta.env ?? {};
const config = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
};
const configured = Object.values(config).every((value) => typeof value === "string" && value.trim().length > 0);

function toAuthUser(user: User): AuthUser {
    return { uid: user.uid, displayName: user.displayName || "Jogador", email: user.email, photoURL: user.photoURL };
}

async function initializeClient() {
    const [{ initializeApp }, sdk] = await Promise.all([import("firebase/app"), import("firebase/auth")]);
    const auth = sdk.getAuth(initializeApp(config, "chess-auth"));
    auth.languageCode = "pt-BR";
    await sdk.setPersistence(auth, sdk.browserSessionPersistence);
    const provider = new sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    return { auth, provider, sdk };
}

let clientPromise: ReturnType<typeof initializeClient> | undefined;
function getClient() {
    if (!configured) throw new Error("Autenticação não configurada.");
    if (!clientPromise) {
        clientPromise = initializeClient().catch((error: unknown) => {
            clientPromise = undefined;
            throw error;
        });
    }
    return clientPromise;
}

export const firebaseAuthService: AuthService = {
    configured,
    subscribe(onUser, onError) {
        let cancelled = false;
        let unsubscribe: (() => void) | undefined;
        void getClient().then(({ auth, sdk }) => {
            if (cancelled) return;
            unsubscribe = sdk.onAuthStateChanged(auth, (user) => onUser(user ? toAuthUser(user) : null), onError);
        }).catch((error: unknown) => { if (!cancelled) onError(error); });
        return () => { cancelled = true; unsubscribe?.(); };
    },
    async signIn() {
        const { auth, provider, sdk } = await getClient();
        const credential = await sdk.signInWithPopup(auth, provider);
        return { user: toAuthUser(credential.user), isNewUser: sdk.getAdditionalUserInfo(credential)?.isNewUser ?? false };
    },
    async signOut() {
        const { auth, sdk } = await getClient();
        await sdk.signOut(auth);
    },
};
