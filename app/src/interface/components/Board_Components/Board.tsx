import type { BoardArrow } from "../../hooks/useBoardArrows";
import type { PieceColor, PieceType, PlayablePiece } from "../../types/pieces";
import type { PromotionPieceType } from "../../../engine";
import type { Player } from "../../types/player";
import { type BoardState, type Files, type Move, type Ranks, type SquareId } from "../../types/square";
import { BoardArrowsOverlay } from "./BoardArrowOverlay";
import { PieceGlyph } from "./PieceGlyph";
import { PlayerBar } from "./PlayerBar";
import { Square } from "./Square";
import type { ClockTimes } from "../../hooks/useChessClock";

/* Coordenadas "reais" do tabuleiro — não mudam com a orientação visual. */
const BASE_FILES: Files[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
const BASE_RANKS: Ranks[] = [8, 7, 6, 5, 4, 3, 2, 1];

interface BoardProps {
    disabled?: boolean;
    clockTimes?: ClockTimes;
    activeClock?: PieceColor;
    // Jogador exibido acima do tabuleiro (o bot).
    topPlayer?: Player;

    // Jogador exibido abaixo do tabuleiro (o usuário).
    bottomPlayer?: Player;
    topCapturedPieces?: PieceType[];
    bottomCapturedPieces?: PieceType[];
    promotionSquare?: SquareId;
    onPromotionSelect?: (piece: PromotionPieceType) => void;

    // Posição atual: mapa esparso de casa -> peça. Sem isso, o tabuleiro renderiza vazio.
    pieces?: BoardState;

    // Casa selecionada pelo jogador (origem de um lance em andamento).
    selectedSquare?: SquareId;

    // Casas de destino legais para a peça selecionada.
    legalMoves?: SquareId[];

    // Último lance jogado, para destacar origem e destino.
    lastMove?: Move;

    // Casa do rei em xeque no momento, se houver.
    checkSquare?: SquareId;

    // Chamado com o id da casa quando o jogador clica/toca nela.
    onSquareSelect?: (square: SquareId) => void;

    // Setas desenhadas manualmente pelo jogador com o botão direito.
    arrows?: BoardArrow[];
    
    // Casas destacadas manualmente (botão direito pressionado e solto na mesma casa).
    highlightedSquares?: SquareId[];
    
    // Botão direito pressionado sobre uma casa — repassa pro hook decidir o que fazer.
    onSquareContextMouseDown?: (square: SquareId, event: React.MouseEvent) => void;
    
    // Botão direito solto sobre uma casa — fecha a seta ou alterna o destaque.
    onSquareContextMouseUp?: (square: SquareId, event: React.MouseEvent) => void;

    /*
        Orientação do tabuleiro: 
        - "white" (padrão) mostra a linha 8 no topo; 
        - "black" inverte tudo — útil quando o usuário joga de pretas.
    */
    orientation?: PieceColor;
}

export function Board({
    disabled = false,
    clockTimes,
    activeClock,
    topPlayer,
    bottomPlayer,
    topCapturedPieces = [],
    bottomCapturedPieces = [],
    promotionSquare,
    onPromotionSelect,
    pieces,
    selectedSquare,
    legalMoves,
    lastMove,
    checkSquare,
    onSquareSelect,
    arrows = [],
    highlightedSquares = [],
    onSquareContextMouseDown,
    onSquareContextMouseUp,
    orientation = "white",
}: BoardProps) {
    
    const displayFiles = orientation === "black" ? [...BASE_FILES].reverse() : BASE_FILES;
    const displayRanks = orientation === "black" ? [...BASE_RANKS].reverse() : BASE_RANKS;
    
    function getPiece(squareId: SquareId): PlayablePiece | undefined {
        return pieces?.[squareId];
    }
    
    function isLastMoveSquare(squareId: SquareId): boolean {
        return lastMove?.from === squareId || lastMove?.to === squareId;
    }

 
    return (
        <div className="flex flex-col items-center gap-3">
            
            <div className="w-full max-w-[560px]">
                
                <PlayerBar player={topPlayer} capturedPieces={topCapturedPieces} remainingMs={topPlayer ? clockTimes?.[topPlayer.color] : undefined} clockActive={topPlayer?.color === activeClock} />
            
            </div>
    
            <div className="w-full max-w-[560px]">
                <div className="flex gap-2">
                    
                    {/* Régua de linhas (ranks), seguindo a orientação atual */}
                    <div className="grid w-5 grid-rows-8 sm:w-6">
                        
                        {displayRanks.map((rank) => (
                            <span
                                key={rank}
                                className="flex items-center justify-end pr-1 font-mono text-[10px] text-text-muted"
                            >
                                {rank}
                            </span>
                        ))}
                    
                    </div>
        
                    {/* Wrapper relativo: o overlay de setas precisa se posicionar
                        exatamente por cima do grid, casa por casa. */}
                    <div className="relative flex-1">
                        <div className="relative overflow-hidden rounded-lg border border-border shadow-2xl shadow-black/30">
                        <div className="grid grid-cols-8 grid-rows-8">
                            
                            {displayRanks.flatMap((rank) =>
                                displayFiles.map((file) => {
                                    
                                    // Regra padrão de xadrez: a1 é escura
                                    const fileIndex = BASE_FILES.indexOf(file) + 1; // 1 (a) .. 8 (h)
                                    
                                    
                                    const isLight = (fileIndex + rank) % 2 === 1;
                                    const squareId: SquareId = `${file}${rank}`;
                    
                                    return (
                                        <Square
                                            disabled={disabled}
                                            key={squareId}
                                            id={squareId}
                                            isLight={isLight}
                                            piece={getPiece(squareId)}
                                            isSelected={selectedSquare === squareId}
                                            isLegalMove={legalMoves?.includes(squareId)}
                                            isLastMove={isLastMoveSquare(squareId)}
                                            isCheck={checkSquare === squareId}
                                            isAnnotated={highlightedSquares.includes(squareId)}
                                            onSelect={onSquareSelect}
                                            onContextMouseDown={onSquareContextMouseDown}
                                            onContextMouseUp={onSquareContextMouseUp}
                                        />
                                    );
                                })
                            )}
                        
                        </div>
            
                        <BoardArrowsOverlay arrows={arrows} orientation={orientation} />
                        </div>
                        {promotionSquare && onPromotionSelect && (() => {
                            const row = 8 - Number(promotionSquare[1]);
                            const col = BASE_FILES.indexOf(promotionSquare[0] as Files);
                            const color = pieces?.[promotionSquare]?.color ?? (row === 0 ? "white" : "black");
                            const options: PromotionPieceType[] = ["q", "r", "b", "n"];
                            return (
                                <div
                                    role="group"
                                    aria-label="Escolha a peça para promoção"
                                    className={`pointer-events-auto absolute z-30 flex h-1/2 w-[12.5%] overflow-hidden rounded-md border border-border bg-surface shadow-xl ${row === 7 ? "flex-col-reverse" : "flex-col"}`}
                                    style={{
                                        left: `${(col >= 6 ? col - 1 : col + 1) * 12.5}%`,
                                        top: `${row === 7 ? 50 : 0}%`,
                                    }}
                                >
                                    {options.map((piece) => {
                                        const pieceName = { q: "dama", r: "torre", b: "bispo", n: "cavalo" }[piece];
                                        const pieceType = { q: "queen", r: "rook", b: "bishop", n: "knight" }[piece] as PieceType;
                                        return (
                                            <button
                                                key={piece}
                                                type="button"
                                                onClick={() => onPromotionSelect(piece)}
                                                aria-label={`Promover para ${pieceName}`}
                                                title={`Promover para ${pieceName}`}
                                                className="flex h-1/4 w-full items-center justify-center bg-surface hover:bg-accent/30 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                                            >
                                                <PieceGlyph
                                                    playablePiece={{ piece: { type: pieceType }, color }}
                                                    className="h-full w-full object-contain"
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                
                </div>
        
                {/* Régua de colunas (files), seguindo a orientação atual */}
                <div className="mt-1 flex gap-2">
                    
                    <div className="w-5 sm:w-6" aria-hidden="true" />
        
                    <div className="grid flex-1 grid-cols-8">
                        
                        {displayFiles.map((file) => (
                            <span
                                key={file}
                                className="text-center font-mono text-[10px] uppercase text-text-muted"
                            >
                                {file}
                            </span>
                        ))}
                    
                    </div>
                
                </div>
            
            </div>
    
            <div className="w-full max-w-[560px]">
                
                <PlayerBar player={bottomPlayer} capturedPieces={bottomCapturedPieces} remainingMs={bottomPlayer ? clockTimes?.[bottomPlayer.color] : undefined} clockActive={bottomPlayer?.color === activeClock} />
            
            </div>
        
        </div>
    );
}
