import { NavLink } from "react-router-dom";
import { useAuth } from "../../stores/AuthContext";

export function AccountControls() {
    const { user, loading, action, signOut, error } = useAuth();
    if (loading) return <span role="status" className="text-xs text-text-muted">Verificando conta…</span>;
    if (!user) return <NavLink to="/login" className="text-sm font-medium text-text-muted hover:text-text-primary">Entrar</NavLink>;
    return (
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
            <span className="max-w-32 truncate text-text-primary" title={user.displayName}>{user.displayName}</span>
            <button type="button" onClick={() => void signOut()} disabled={action !== null} className="rounded-md border border-border px-3 py-1 text-text-muted hover:border-accent disabled:opacity-50">
                {action === "signOut" ? "Saindo…" : "Sair"}
            </button>
            {error && <span role="alert" className="w-full max-w-64 text-xs text-danger">{error}</span>}
        </div>
    );
}
