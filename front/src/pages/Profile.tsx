
import { useState } from "react";
import { useAuth } from "../stores/AuthContext";
import { useMatchHistory } from "../hooks/useMatchHistory";
import { UserAvatar } from "../components/auth/UserAvatar";
import { Button } from "../components/ui/Button";
import { difficultyLabels, type Difficulty } from "../types/matchHistory";
import { resultTitles, type GameResult } from "../types/gameResult";

const outcomeColors = { victory: "text-success", defeat: "text-danger", draw: "text-accent" };
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const PAGE_SIZE = 10;

export function Profile() {
    const { user, loading, action, error, signOut } = useAuth();
    const { records, status, retry } = useMatchHistory(user?.uid);
    const [outcome, setOutcome] = useState<GameResult["outcome"] | "all">("all");
    const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
    const [page, setPage] = useState(1);

    if (loading) return <p role="status" className="mx-auto px-6 py-16 text-text-muted">Carregando seu perfil…</p>;
    if (!user) return (
        <section className="mx-auto w-full max-w-md px-6 py-16 text-center">
            <h1 className="font-display text-3xl font-semibold">Seu perfil</h1>
            <p className="my-6 text-text-muted">Entre com sua conta Google para ver seu perfil e suas partidas.</p>
            <Button to="/login">Entrar com Google</Button>
            <Button to="/game" variant="ghost" className="mt-3">Jogar como visitante</Button>
        </section>
    );

    const wins = records.filter((record) => record.outcome === "victory").length;
    const losses = records.filter((record) => record.outcome === "defeat").length;
    const draws = records.filter((record) => record.outcome === "draw").length;
    const stats = [
        { label: "Partidas", value: records.length },
        { label: "Vitórias", value: wins },
        { label: "Derrotas", value: losses },
        { label: "Empates", value: draws },
        { label: "Taxa de vitória", value: `${records.length ? Math.round(wins / records.length * 100) : 0}%` },
    ];
    const filtered = records.filter((record) => (outcome === "all" || record.outcome === outcome) && (difficulty === "all" || record.difficulty === difficulty));
    const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, pageCount);
    const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="profile-title">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <UserAvatar name={user.displayName} photoURL={user.photoURL} large />
                        <div className="min-w-0">
                            <p className="mb-1 font-mono text-xs uppercase tracking-widest text-text-muted">Meu perfil</p>
                            <h1 id="profile-title" className="break-words font-display text-2xl font-semibold sm:text-3xl">{user.displayName}</h1>
                            {user.email && <p className="mt-2 break-all text-sm text-text-muted">{user.email}</p>}
                            <p className="mt-2 text-xs text-text-muted">Conta conectada com Google</p>
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-3 sm:w-48">
                        <Button to="/game">Jogar agora</Button>
                        <Button variant="secondary" onClick={() => void signOut()} disabled={action !== null}>{action === "signOut" ? "Saindo…" : "Sair da conta"}</Button>
                    </div>
                </div>
                {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}
            </section>

            <section aria-label="Estatísticas das partidas salvas" className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {stats.map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-border bg-surface p-5">
                        <p className="text-sm text-text-muted">{label}</p>
                        <p className="mt-2 font-mono text-2xl font-semibold text-accent">{status === "ready" ? value : "—"}</p>
                    </div>
                ))}
            </section>

            <section aria-labelledby="history-title" className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
                <h2 id="history-title" className="font-display text-2xl font-semibold">Histórico de partidas</h2>
                <p className="mt-2 text-sm text-text-muted">Suas partidas concluídas, da mais recente para a mais antiga.</p>
                <div className="my-6 flex flex-col gap-4 sm:flex-row">
                    <label className="flex flex-1 flex-col gap-2 text-sm text-text-muted">
                        Resultado
                        <select value={outcome} disabled={status !== "ready"} onChange={(event) => { setOutcome(event.target.value as typeof outcome); setPage(1); }} className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-text-primary disabled:opacity-50">
                            <option value="all">Todos os resultados</option>
                            {Object.entries(resultTitles).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                    <label className="flex flex-1 flex-col gap-2 text-sm text-text-muted">
                        Dificuldade
                        <select value={difficulty} disabled={status !== "ready"} onChange={(event) => { setDifficulty(event.target.value as typeof difficulty); setPage(1); }} className="rounded-lg border border-border bg-surface-alt px-3 py-2 text-text-primary disabled:opacity-50">
                            <option value="all">Todas as dificuldades</option>
                            {Object.entries(difficultyLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                </div>
                {status === "loading" && <p role="status" className="text-text-muted">Carregando suas partidas…</p>}
                {status === "unavailable" && <p role="status" className="text-text-muted">O histórico ainda não está disponível. Você pode continuar jogando.</p>}
                {status === "error" && <div role="alert"><p className="text-danger">Não foi possível carregar seu histórico. Tente novamente.</p><Button variant="secondary" className="mt-4 sm:w-auto" onClick={retry}>Tentar novamente</Button></div>}
                {status === "ready" && records.length === 0 && <p role="status" className="text-text-muted">Você ainda não tem partidas salvas. Jogue uma partida para começar seu histórico.</p>}
                {status === "ready" && records.length > 0 && filtered.length === 0 && <p role="status" className="text-text-muted">Nenhuma partida corresponde aos filtros selecionados.</p>}
                {status === "ready" && visible.length > 0 && (
                    <>
                        <ul className="space-y-3" aria-label="Partidas salvas">
                            {visible.map((record) => (
                                <li key={record.id} className="rounded-xl border border-border bg-surface-alt p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className={`font-semibold ${outcomeColors[record.outcome]}`}>{resultTitles[record.outcome]}</span>
                                        <time dateTime={new Date(record.endedAt).toISOString()} className="text-xs text-text-muted">{dateFormat.format(record.endedAt)}</time>
                                    </div>
                                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                                        <div><dt className="text-xs text-text-muted">Oponente</dt><dd className="mt-1 break-words">{record.opponent}</dd></div>
                                        <div><dt className="text-xs text-text-muted">Dificuldade</dt><dd className="mt-1">{difficultyLabels[record.difficulty]}</dd></div>
                                        <div><dt className="text-xs text-text-muted">Encerramento</dt><dd className="mt-1 break-words">{record.reason}</dd></div>
                                    </dl>
                                </li>
                            ))}
                        </ul>
                        <nav aria-label="Paginação do histórico" className="mt-5 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-text-muted">Página {currentPage} de {pageCount} · {filtered.length} partidas</p>
                            <div className="flex gap-2">
                                <button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-border px-3 py-2 disabled:opacity-40">Anterior</button>
                                <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-border px-3 py-2 disabled:opacity-40">Próxima</button>
                            </div>
                        </nav>
                    </>
                )}
            </section>
        </div>
    );
}
