import type { PlayedMove } from "../../hooks/useGameMoves";

function label(move?: PlayedMove) {
    return move ? `${move.from} ${move.capture ? "×" : "→"} ${move.to}` : "—";
}
export function MoveHistoryPanel({ moves }: { moves: PlayedMove[] }) {
    const rows = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
        number: index + 1, white: moves[index * 2], black: moves[index * 2 + 1],
    }));
    return (
        <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-text-primary">Histórico de jogadas</h2>
                <span className="font-mono text-xs text-text-muted">{moves.length} lance{moves.length === 1 ? "" : "s"}</span>
            </div>
            <div className="mt-4 max-h-64 overflow-y-auto" aria-live="polite">
                {rows.length ? (
                    <table className="w-full border-collapse text-sm">
                        <thead><tr><th scope="col">Lance</th><th scope="col">Brancas</th><th scope="col">Pretas</th></tr></thead>
                        <tbody>{rows.map((row, index) => (
                            <tr key={row.number} className={`border-b border-border/60 ${index === rows.length - 1 ? "bg-surface-alt" : ""}`}>
                                <th scope="row" className="py-1.5 font-mono">{row.number}.</th>
                                <td className="py-1.5 text-center font-mono">{label(row.white)}</td>
                                <td className="py-1.5 text-center font-mono">{label(row.black)}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                ) : <p className="text-sm text-text-muted">Nenhuma jogada realizada ainda.</p>}
            </div>
        </section>
    );
}
