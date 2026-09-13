
interface MoveRecord {

    // Número da jogada, começando com 1. Cada jogada envolve 1 lance das brancas e 1 das pretas
    number: number;
    
    // String de lance, com notação algébrida do tabuleiro (Ex.: "e4", "c5") - Brancas
    white: string;

    // String de lance, com notação algébrida do tabuleiro (Ex.: "e4", "c5") - Pretas
    // Obs.: Opcional por ser o último lance da jogada
    black?: string;
}

/*
    Dados mockados para visualização.
*/
const mockMoves: MoveRecord[] = [
    { number: 1, white: "♟e4", black: "♟️e5" },
    { number: 2, white: "♟Cf3", black: "♟️Cc6" },
    { number: 3, white: "♟Bb5", black: "♟️a6" },
    { number: 4, white: "♟Ba4", black: "♟️Cf6" },
    { number: 5, white: "♟O-O", black: "♟️Be7" },
    { number: 6, white: "♟Te1", black: "♟️b5" },
    { number: 7, white: "♟Bb3", black: "♟️d6" },
    { number: 8, white: "♟c3", black: "♟️O-O" },
    { number: 9, white: "♟h3", black: "♟️Cb8" },
    { number: 10, white: "♟d4", black: undefined },
];

export function MoveHistoryPanel() {
    const hasMoves = mockMoves.length > 0;
    const lastMove = mockMoves[mockMoves.length - 1];
    const isLastMoveWhite = lastMove ? lastMove.black === undefined : false;

    return (
        <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
                
                <h2 className="font-display text-lg font-semibold text-text-primary">
                    Histórico de jogadas
                </h2>
                
                {hasMoves && (
                    <span className="font-mono text-xs text-text-muted">
                        {mockMoves.length} lance{mockMoves.length > 1 ? "s" : ""}
                    </span>
                )}
            
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto">
                {hasMoves ? (
                    <table className="w-full border-collapse">
                        <tbody>
                            {mockMoves.map((move) => {
                                const isCurrentRow = move.number === lastMove.number;
                                return (
                                    <tr
                                        key={move.number}
                                        className={`border-b border-border/60 last:border-0 ${
                                        isCurrentRow ? "bg-surface-alt" : ""
                                        }`}
                                    >
                                        <td className="w-8 py-1.5 pr-2 text-right font-mono text-xs text-text-muted/60">
                                            {move.number}.
                                        </td>
                                        
                                        <td
                                            className={`w-1/2 py-1.5 font-mono text-sm ${
                                                isCurrentRow && isLastMoveWhite
                                                ? "font-semibold text-accent"
                                                : "text-text-primary"
                                            }`}
                                        >
                                            {move.white}
                                        </td>
                                        
                                        <td
                                            className={`w-1/2 py-1.5 font-mono text-sm ${
                                                move.black === undefined
                                                ? "text-text-muted/30"
                                                : isCurrentRow
                                                    ? "font-semibold text-accent"
                                                    : "text-text-primary"
                                            }`}
                                        >
                                            {move.black ?? "—"}
                                        </td>
                                    
                                    </tr>
                                );
                            })}
                        </tbody>
                    
                    </table>
                    
                    ) : (
                    
                    <p className="font-mono text-sm text-text-muted/50">
                        Nenhuma jogada realizada ainda.
                    </p>
                )}
            </div>
        
        </div>
    );
}