export interface AuthUser {
    uid: string;
    displayName: string;
    email: string | null;
    photoURL: string | null;
}

export interface AuthService {
    configured: boolean;
    subscribe: (onUser: (user: AuthUser | null) => void, onError: (error: unknown) => void) => () => void;
    signIn: () => Promise<{ user: AuthUser; isNewUser: boolean }>;
    signOut: () => Promise<void>;
}
