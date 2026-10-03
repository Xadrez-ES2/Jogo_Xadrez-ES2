import type { PieceColor } from "../../types/pieces";
import type { GameMode } from "../../types/gameSetup";

export function StatusPanel({ activeColor, mode }: { activeColor: PieceColor; mode: GameMode }) {
    return (
        <section aria-live="polite" className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">Status</h2>
            <p className="mt-3 text-sm text-text-muted">
                Vez das <span className="font-semibold text-accent">{activeColor === "white" ? "brancas" : "pretas"}</span>.
            </p>
            <p className="mt-3 text-sm text-text-muted">
                {mode === "human-human" ? "Partida local: as duas pessoas jogam neste dispositivo." : mode === "ai-ai" || activeColor === "black" ? "Aguardando a IA. A resposta automática ainda não está disponível." : "Selecione uma peça branca e depois um destino destacado."}
            </p>
        </section>
    );
}
