import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { AuthService, AuthUser } from "../types/auth";
import { firebaseAuthService } from "../services/firebaseAuth";
import { getAuthErrorMessage } from "../services/authErrors";

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    available: boolean;
    action: "signIn" | "signOut" | null;
    error: string | null;
    isNewUser: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children, service = firebaseAuthService }: { children: ReactNode; service?: AuthService }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(service.configured);
    const [available, setAvailable] = useState(service.configured);
    const [action, setAction] = useState<AuthContextValue["action"]>(null);
    const [error, setError] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const busy = useRef(false);
    const mounted = useRef(false);

    useEffect(() => {
        mounted.current = true;
        if (!service.configured) return () => { mounted.current = false; };
        const unsubscribe = service.subscribe((nextUser) => {
            setUser(nextUser);
            if (!nextUser) setIsNewUser(false);
            setLoading(false);
        }, (failure) => {
            setError(getAuthErrorMessage(failure));
            setUser(null);
            setLoading(false);
            setAvailable(false);
        });
        return () => { mounted.current = false; unsubscribe(); };
    }, [service]);

    async function signIn() {
        if (busy.current || loading || !available) return;
        busy.current = true;
        setAction("signIn");
        setError(null);
        try {
            const result = await service.signIn();
            if (mounted.current) { setUser(result.user); setIsNewUser(result.isNewUser); }
        } catch (failure) {
            if (mounted.current) setError(getAuthErrorMessage(failure));
        } finally {
            busy.current = false;
            if (mounted.current) setAction(null);
        }
    }

    async function signOut() {
        if (busy.current || loading || !available) return;
        busy.current = true;
        setAction("signOut");
        setError(null);
        try {
            await service.signOut();
            if (mounted.current) { setUser(null); setIsNewUser(false); }
        } catch {
            if (mounted.current) setError("Não foi possível sair da conta. Tente novamente.");
        } finally {
            busy.current = false;
            if (mounted.current) setAction(null);
        }
    }

    return <AuthContext.Provider value={{ user, loading, available, action, error, isNewUser, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
    return context;
}
