import type { PieceColor } from "../../types/pieces";
import type { GameMode } from "../../types/gameSetup";

const colorNames: Record<PieceColor, { plural: string; piece: string }> = {
    white: { plural: "brancas", piece: "branca" },
    black: { plural: "pretas", piece: "preta" },
};

/*
    `playerColor` só importa no modo Pessoa vs. IA: define se a vez atual é
    da pessoa (instrução de jogada) ou da IA ("pensando").
*/
export function StatusPanel({ activeColor, mode, playerColor = "white" }: { activeColor: PieceColor; mode: GameMode; playerColor?: PieceColor }) {
    const message = mode === "human-human"
        ? "Partida local: as duas pessoas jogam neste dispositivo."
        : mode === "ai-ai"
            ? "As IAs estão jogando."
            : activeColor === playerColor
                ? `Selecione uma peça ${colorNames[playerColor].piece} e depois um destino destacado.`
                : "A IA está pensando.";
    return (
        <section aria-live="polite" className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-semibold text-text-primary">Status</h2>
            <p className="mt-3 text-sm text-text-muted">
                Vez das <span className="font-semibold text-accent">{colorNames[activeColor].plural}</span>.
            </p>
            <p className="mt-3 text-sm text-text-muted">{message}</p>
        </section>
    );
}
