import { Link } from "react-router-dom";
import { useAuth } from "../../stores/AuthContext";
import { Button } from "../ui/Button";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
    const { user, loading, available, action, error, isNewUser, signIn, signOut } = useAuth();
    const registering = mode === "register";
    const pending = loading || action !== null;

    return (
        <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
            <section className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8" aria-labelledby="auth-title">
                <div className="mb-6 flex items-center gap-3">
                    <span aria-hidden="true" className="text-4xl text-accent">♞</span>
                    <span className="font-mono text-xs uppercase tracking-widest text-text-muted">Xadrez · Sua conta</span>
                </div>
                <h1 id="auth-title" className="font-display text-3xl font-semibold">
                    {user ? (isNewUser ? "Conta criada" : "Você está conectado") : registering ? "Crie sua conta" : "Entre na sua conta"}
                </h1>
                {user ? (
                    <div className="mt-5">
                        <p role="status" className="text-success">{isNewUser ? "Seu cadastro foi criado automaticamente com o Google." : "Acesso realizado com sucesso."}</p>
                        <div className="my-6 flex min-w-0 items-center gap-3 rounded-lg border border-border bg-surface-alt p-4">
                            {user.photoURL && <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="h-10 w-10 shrink-0 rounded-full" />}
                            <div className="min-w-0">
                                <p className="break-words font-semibold">{user.displayName}</p>
                                {user.email && <p className="break-all text-sm text-text-muted">{user.email}</p>}
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Button to="/game">Jogar agora</Button>
                            <Button variant="secondary" onClick={() => void signOut()} disabled={pending}>{action === "signOut" ? "Saindo…" : "Sair da conta"}</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="mt-3 text-sm leading-relaxed text-text-muted">
                            {registering ? "Use sua conta Google. Seu cadastro é criado automaticamente no primeiro acesso." : "Acesse com o Google. Se esta for sua primeira visita, sua conta será criada automaticamente."}
                        </p>
                        <form className="mt-6" onSubmit={(event) => { event.preventDefault(); void signIn(); }} aria-busy={pending}>
                            <Button type="submit" variant="secondary" disabled={pending || !available}>
                                {loading ? "Verificando sessão…" : action === "signIn" ? "Aguardando Google…" : registering ? "Cadastrar com Google" : "Entrar com Google"}
                            </Button>
                        </form>
                        {!available && !loading && !error && <p role="status" className="mt-4 text-sm text-text-muted">O login está temporariamente indisponível. Você pode continuar jogando como visitante.</p>}
                        <p className="mt-4 text-xs leading-relaxed text-text-muted">Você escolhe sua conta na janela do Google. Não solicitamos nem armazenamos sua senha.</p>
                        <div className="my-6 border-t border-border" />
                        <p className="text-center text-sm text-text-muted">
                            {registering ? "Já tem uma conta? " : "Primeira vez aqui? "}
                            <Link className="font-semibold text-accent hover:underline" to={registering ? "/login" : "/register"}>{registering ? "Entrar" : "Criar conta"}</Link>
                        </p>
                        <Link to="/game" className="mt-4 block text-center text-sm text-text-muted underline underline-offset-4">Continuar como visitante</Link>
                    </>
                )}
                {error && <p role="alert" className="mt-4 rounded-lg border border-danger p-3 text-sm text-danger">{error}</p>}
            </section>
        </div>
    );
}
