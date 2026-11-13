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

export interface MoveHistoryPanelProps {
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
    /* Alternar pausa da partida. */
    onTogglePause?: () => void;
    /* Se a partida está pausada. */
    isPaused?: boolean;
    /* Se o botão de pausa deve ser exibido. */
    canPause?: boolean;
    /* Desistir da partida. */
    onResign?: () => void;
    /* Se o botão de desistência deve ser exibido. */
    canResign?: boolean;
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
    onTogglePause,
    isPaused = false,
    canPause = false,
    onResign,
    canResign = false,
}: MoveHistoryPanelProps) {
    const rows = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
        number: index + 1,
        white: moves[index * 2],
        black: moves[index * 2 + 1],
        whiteIdx: index * 2,
        blackIdx: index * 2 + 1,
    }));

    // Scroll automático para o lance em foco
    const focusedRowRef = useRef<HTMLTableRowElement | null>(null);
    useEffect(() => {
        focusedRowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, [focusedMoveIndex]);

    function handleKeyDown(event: React.KeyboardEvent) {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            onGoBack?.();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            onGoForward?.();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            onGoToStart?.();
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            onGoToEnd?.();
        }
    }

    return (
        <section
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Painel de Histórico de jogadas"
            className="rounded-xl border border-border bg-surface p-5 focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-text-primary">Histórico de jogadas</h2>
                    <span className="text-xs text-text-muted" title="Navegável pelas setas do teclado (← e →)">(← / →)</span>
                </div>
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

            {/* Botões de navegação rápida e ações da partida */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-1">
                <HistoryNavButton onClick={onGoToStart} title="Início da partida (Seta cima)" aria-label="Ir ao início da partida">
                    {/* |< */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M3 4h2v12H3V4zm4.293 1.293l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 17V7a1 1 0 011.293-.707z" />
                    </svg>
                </HistoryNavButton>

                <HistoryNavButton onClick={onGoBack} title="Lance anterior (Seta esquerda)" aria-label="Lance anterior">
                    {/* < */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </HistoryNavButton>

                <HistoryNavButton onClick={onGoForward} title="Próximo lance (Seta direita)" aria-label="Próximo lance">
                    {/* > */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </HistoryNavButton>

                <HistoryNavButton onClick={onGoToEnd} title="Lance mais recente (Seta baixo)" aria-label="Ir ao lance mais recente">
                    {/* >| */}
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                        <path d="M15 4h2v12h-2V4zm-8.293 1.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6A1 1 0 016 17V7a1 1 0 01.707-.707z" />
                    </svg>
                </HistoryNavButton>

                {canUndo && (
                    <HistoryNavButton
                        onClick={onUndo}
                        title="Desfazer último lance"
                        aria-label="Desfazer último lance"
                        className="border-danger/40 text-danger hover:border-danger hover:bg-danger/10"
                    >
                        {/* ↩ */}
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                            <path fillRule="evenodd" d="M9.707 4.293a1 1 0 00-1.414 0L3 9.586V6a1 1 0 00-2 0v6a1 1 0 001 1h6a1 1 0 000-2H4.414l5.293-5.293a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                    </HistoryNavButton>
                )}

                {(canPause || canResign) && (
                    <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />
                )}

                {canPause && (
                    <HistoryNavButton
                        onClick={onTogglePause}
                        title={isPaused ? "Retomar partida" : "Pausar partida"}
                        aria-label={isPaused ? "Retomar partida" : "Pausar partida"}
                        aria-pressed={isPaused}
                        className={isPaused ? "border-accent bg-accent/20 text-accent hover:border-accent hover:bg-accent/30" : ""}
                    >
                        {isPaused ? (
                            /* Símbolo Retomar ▶ */
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            /* Símbolo Pausar ⏸ */
                            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v8a.75.75 0 01-1.5 0v-8a.75.75 0 01.75-.75zm6.5 0a.75.75 0 01.75.75v8a.75.75 0 01-1.5 0v-8a.75.75 0 01.75-.75z" clipRule="evenodd" />
                            </svg>
                        )}
                    </HistoryNavButton>
                )}

                {canResign && (
                    <HistoryNavButton
                        onClick={onResign}
                        title="Desistir da partida"
                        aria-label="Desistir da partida"
                        className="border-danger/30 text-text-muted hover:border-danger hover:text-danger hover:bg-danger/10"
                    >
                        {/* Símbolo Desistir 🏳 (Bandeira) */}
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                            <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l1.122 1.12A1.5 1.5 0 0014.62 4H16.5A1.5 1.5 0 0118 5.5v8a1.5 1.5 0 01-1.5 1.5h-4.879a1.5 1.5 0 01-1.06-.44l-1.122-1.12A1.5 1.5 0 008.38 13H4.5A1.5 1.5 0 013 11.5v-8zM4.5 3.5a.5.5 0 00-.5.5v7.5a.5.5 0 00.5.5H8.38a3 3 0 012.121.879l1.122 1.12H16.5a.5.5 0 00.5-.5v-8a.5.5 0 00-.5-.5h-1.879a3 3 0 01-2.121-.879l-1.122-1.12H4.5z" clipRule="evenodd" />
                            <path d="M3.75 2a.75.75 0 01.75.75v15a.75.75 0 01-1.5 0v-15A.75.75 0 013.75 2z" />
                        </svg>
                    </HistoryNavButton>
                )}
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto" aria-live="polite">
                {rows.length ? (
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b border-border text-xs text-text-muted">
                                <th scope="col" className="py-1 text-left font-normal">#</th>
                                <th scope="col" className="py-1 text-center font-normal">Brancas</th>
                                <th scope="col" className="py-1 text-center font-normal">Pretas</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => {
                                const isLastRow = index === rows.length - 1;
                                const whiteIsFocused = focusedMoveIndex === row.whiteIdx;
                                const blackIsFocused = focusedMoveIndex === row.blackIdx;
                                const rowIsFocused = whiteIsFocused || blackIsFocused;
                                return (
                                    <tr
                                        key={row.number}
                                        ref={rowIsFocused ? focusedRowRef : null}
                                        className={`border-b border-border/60 ${isLastRow ? "bg-surface-alt/50" : ""}`}
                                    >
                                        <th scope="row" className="py-1.5 font-mono text-left font-normal text-text-muted">
                                            {row.number}.
                                        </th>
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
                            })}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-sm text-text-muted">Nenhuma jogada realizada ainda.</p>
                )}
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
                    ? "bg-accent font-bold text-background"
                    : "text-text-primary hover:bg-surface-alt"
            }`}
        >
            {moveLabel}
        </button>
    );
}

/* Botão pequeno de navegação e ação do histórico. */
function HistoryNavButton({
    children,
    onClick,
    title,
    "aria-label": ariaLabel,
    "aria-pressed": ariaPressed,
    className = "",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    title?: string;
    "aria-label"?: string;
    "aria-pressed"?: boolean;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={ariaLabel}
            aria-pressed={ariaPressed}
            disabled={!onClick}
            className={`inline-flex items-center justify-center rounded border border-border bg-surface-alt p-2.5 text-text-muted transition-colors hover:border-accent hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
        >
            {children}
        </button>
    );
}
