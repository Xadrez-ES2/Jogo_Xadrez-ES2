import { useEffect, useRef } from "react";
import type { PlayedMove } from "../../hooks/useGameMoves";

function label(move?: PlayedMove) {
    if (!move) return "—";
    if (move.castle === "kingSide") return "O-O";
    if (move.castle === "queenSide") return "O-O-O";

    const promotionSymbol = move.promotion ? `=${move.promotion.toUpperCase()}` : "";

    if (move.piece === "pawn") {
        return (move.capture
            ? `${move.from[0]}x${move.to}`
            : move.to) + promotionSymbol;
    }

    const symbols: Record<string, string> = {
        knight: "N",
        bishop: "B",
        rook: "R",
        queen: "Q",
        king: "K",
    };

    const symbol = symbols[move.piece];

    return (move.capture
        ? `${symbol}x${move.to}`
        : `${symbol}${move.to}`) + promotionSymbol;
}

interface MoveHistoryPanelProps {
    moves: PlayedMove[];
    /*
        Índice do lance em foco (0-based no array `moves`).
        `null` = nenhum lance em foco (modo ao vivo, sem destaque especial).
    */
    focusedMoveIndex?: number | null;
    /* Chamado com o índice do array `moves` quando o usuário clica em um lance. */
    onMoveClick?: (moveIndex: number) => void;
    /* Navegar para o início (antes do 1º lance). */
    onGoToStart?: () => void;
    /* Recuar um lance. */
    onGoBack?: () => void;
    /* Avançar um lance. */
    onGoForward?: () => void;
    /* Ir para o lance mais recente (ao vivo). */
    onGoToEnd?: () => void;
    /* Desfazer o(s) último(s) lance(s). */
    onUndo?: () => void;
    /* Se verdadeiro, o botão Undo está disponível. */
    canUndo?: boolean;
    /* Se verdadeiro, estamos visualizando o histórico (não ao vivo). */
    isViewingHistory?: boolean;
    /* Retornar ao modo ao vivo (usado no banner de aviso). */
    onReturnToLive?: () => void;
}

export function MoveHistoryPanel({
    moves,
    focusedMoveIndex = null,
    onMoveClick,
    onGoToStart,
    onGoBack,
    onGoForward,
    onGoToEnd,
    onUndo,
    canUndo = false,
    isViewingHistory = false,
    onReturnToLive,
}: MoveHistoryPanelProps) {
    const rows = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
        number: index + 1, white: moves[index * 2], black: moves[index * 2 + 1],
        whiteIdx: index * 2, blackIdx: index * 2 + 1,
    }));

    // Scroll automático para o lance em foco
    const focusedRowRef = useRef<HTMLTableRowElement | null>(null);
    useEffect(() => {
        focusedRowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [focusedMoveIndex]);

    return (
        <section className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-text-primary">Histórico de jogadas</h2>
                <span className="font-mono text-xs text-text-muted">{moves.length} lance{moves.length === 1 ? "" : "s"}</span>
            </div>

            {/* Banner: modo de visualização de histórico */}
            {isViewingHistory && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2">
                    <span className="text-xs text-accent">Visualizando histórico</span>
                    <button
                        type="button"
                        onClick={onReturnToLive}
                        className="ml-auto text-xs font-semibold text-accent underline underline-offset-2 hover:text-text-primary"
                    >
                        Voltar ao lance atual
                    </button>
                </div>
            )}

            {/* Botões de navegação rápida */}
            <div className="mt-3 flex items-center justify-center gap-1">
                
                <HistoryNavButton onClick={onGoToStart} title="Início da partida" aria-label="Ir ao início da partida">
                    {/* |< */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M3 4h2v12H3V4zm4.293 1.293l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 17V7a1 1 0 011.293-.707z" />
                    </svg>
                </HistoryNavButton>
                
                <HistoryNavButton onClick={onGoBack} title="Lance anterior" aria-label="Lance anterior">
                    {/* < */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </HistoryNavButton>
                
                <HistoryNavButton onClick={onGoForward} title="Próximo lance" aria-label="Próximo lance">
                    {/* > */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </HistoryNavButton>
                
                <HistoryNavButton onClick={onGoToEnd} title="Lance mais recente" aria-label="Ir ao lance mais recente">
                    {/* >| */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M15 4h2v12h-2V4zm-8.293 1.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 17V7a1 1 0 01.707-.707z" />
                    </svg>
                </HistoryNavButton>
                
                {canUndo && (
                    <HistoryNavButton onClick={onUndo} title="Desfazer último lance" aria-label="Desfazer último lance" className="ml-2 border-danger/40 text-danger hover:border-danger hover:bg-danger/10">
                        {/* ↩ */}
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                            <path fillRule="evenodd" d="M9.707 4.293a1 1 0 00-1.414 0L3 9.586V6a1 1 0 00-2 0v6a1 1 0 001 1h6a1 1 0 000-2H4.414l5.293-5.293a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                    </HistoryNavButton>
                )}
            
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto" aria-live="polite">
                {rows.length ? (
                    <table className="w-full border-collapse text-sm">
                        <thead><tr><th scope="col">Lance</th><th scope="col">Brancas</th><th scope="col">Pretas</th></tr></thead>
                        <tbody>{rows.map((row, index) => {
                            const isLastRow = index === rows.length - 1;
                            const whiteIsFocused = focusedMoveIndex === row.whiteIdx;
                            const blackIsFocused = focusedMoveIndex === row.blackIdx;
                            const rowIsFocused = whiteIsFocused || blackIsFocused;
                            return (
                                <tr
                                    key={row.number}
                                    ref={rowIsFocused ? focusedRowRef : null}
                                    className={`border-b border-border/60 ${isLastRow ? "bg-surface-alt" : ""}`}
                                >
                                    <th scope="row" className="py-1.5 font-mono">{row.number}.</th>
                                    <td className="py-1.5 text-center font-mono">
                                        <MoveCell
                                            moveLabel={label(row.white)}
                                            isFocused={whiteIsFocused}
                                            onClick={row.white ? () => onMoveClick?.(row.whiteIdx) : undefined}
                                        />
                                    </td>
                                    <td className="py-1.5 text-center font-mono">
                                        <MoveCell
                                            moveLabel={label(row.black)}
                                            isFocused={blackIsFocused}
                                            onClick={row.black ? () => onMoveClick?.(row.blackIdx) : undefined}
                                        />
                                    </td>
                                </tr>
                            );
                        })}</tbody>
                    </table>
                ) : <p className="text-sm text-text-muted">Nenhuma jogada realizada ainda.</p>}
            </div>
        </section>
    );
}

/* Célula clicável de um lance na tabela de histórico. */
function MoveCell({
    moveLabel,
    isFocused,
    onClick,
}: {
    moveLabel: string;
    isFocused: boolean;
    onClick?: () => void;
}) {
    if (!onClick || moveLabel === "—") {
        return <span className="text-text-muted">{moveLabel}</span>;
    }
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded px-2 py-0.5 font-mono transition-colors ${
                isFocused
                    ? "bg-accent text-background font-bold"
                    : "hover:bg-surface-alt text-text-primary"
            }`}
        >
            {moveLabel}
        </button>
    );
}

/* Botão pequeno de navegação do histórico. */
function HistoryNavButton({
    children,
    onClick,
    title,
    "aria-label": ariaLabel,
    className = "",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    "aria-label"?: string;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={ariaLabel}
            disabled={!onClick}
            className={`inline-flex items-center justify-center rounded border border-border bg-surface-alt p-2.5 text-text-muted transition-colors hover:border-accent hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
        >
            {children}
        </button>
    );
}
