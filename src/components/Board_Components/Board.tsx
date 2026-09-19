
import type { PieceColor, PlayablePiece } from "../../types/pieces";
import type { Player } from "../../types/player";
import type { BoardState, Files, Move, Ranks, SquareId } from "../../types/square";
import { PlayerBar } from "./PlayerBar";
import { Square } from "./Square";

/* Coordenadas "reais" do tabuleiro — não mudam com a orientação visual. */
const BASE_FILES: Files[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
const BASE_RANKS: Ranks[] = [8, 7, 6, 5, 4, 3, 2, 1];

interface BoardProps {
    // Jogador exibido acima do tabuleiro (o bot).
    topPlayer?: Player;

    // Jogador exibido abaixo do tabuleiro (o usuário).
    bottomPlayer?: Player;

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

    /*
        Orientação do tabuleiro: 
        - "white" (padrão) mostra a linha 8 no topo; 
        - "black" inverte tudo — útil quando o usuário joga de pretas.
    */
    orientation?: PieceColor;
}

export function Board({
    topPlayer,
    bottomPlayer,
    pieces,
    selectedSquare,
    legalMoves,
    lastMove,
    checkSquare,
    onSquareSelect,
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
                <PlayerBar player={topPlayer} />
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

                    <div className="grid flex-1 grid-cols-8 grid-rows-8 overflow-hidden rounded-lg border border-border shadow-2xl shadow-black/30">
                        {displayRanks.flatMap((rank) =>
                        displayFiles.map((file) => {
                            const fileIndex = BASE_FILES.indexOf(file) + 1; // 1 (a) .. 8 (h)
                            // Regra padrão de xadrez: a1 é escura. Calculado a partir das
                            // coordenadas reais, não da ordem de exibição, para a cor de
                            // cada casa não se inverter quando o tabuleiro é virado.
                            const isLight = (fileIndex + rank) % 2 === 1;
                            const squareId: SquareId = `${file}${rank}`;

                            return (
                            <Square
                                key={squareId}
                                id={squareId}
                                isLight={isLight}
                                piece={getPiece(squareId)}
                                isSelected={selectedSquare === squareId}
                                isLegalMove={legalMoves?.includes(squareId)}
                                isLastMove={isLastMoveSquare(squareId)}
                                isCheck={checkSquare === squareId}
                                onSelect={onSquareSelect}
                            />
                            );
                        })
                        )}
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
                <PlayerBar player={bottomPlayer} />
            </div>
        
        </div>
    );
}