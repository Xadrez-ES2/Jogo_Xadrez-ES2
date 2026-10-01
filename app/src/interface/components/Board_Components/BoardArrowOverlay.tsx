import type { BoardArrow } from "../../hooks/useBoardArrows";
import type { PieceColor } from "../../types/pieces";
import type { Files, Ranks, SquareId } from "../../types/square";

const BASE_FILES: Files[] = ["a", "b", "c", "d", "e", "f", "g", "h"];

/*
    Posição (em "unidades de casa", 0 a 8) do CENTRO de uma casa, 
    considerando a orientação atual do tabuleiro. 
    
    Mesma lógica de inversão usada pelo <Board /> para as réguas — se o tabuleiro vira,
    a seta tem que virar junto.
*/
function getSquareCenter(squareId: SquareId, orientation: PieceColor) {
    const file = squareId[0] as Files;
    const rank = Number(squareId.slice(1)) as Ranks;
    const fileIndex = BASE_FILES.indexOf(file); // 0 (a) .. 7 (h)

    const col = orientation === "black" ? 7 - fileIndex : fileIndex;
    const row = orientation === "black" ? rank - 1 : 8 - rank;

    return { x: col + 0.5, y: row + 0.5 };
}

// Props do Componente Visual da Seta (BoardArrowsOverlay)
interface BoardArrowsOverlayProps {
    arrows: BoardArrow[];
    orientation: PieceColor;
}

/*
    Camada de setas desenhadas pelo jogador (botão direito do mouse).
    Usa SVG para o visual das setas.

    Usa viewBox="0 0 8 8" — 1 unidade = 1 casa — para as setas escalarem
    junto com o tabuleiro sem precisar recalcular pixels no resize.
*/
export function BoardArrowsOverlay({ arrows, orientation }: BoardArrowsOverlayProps) {
    
    if (arrows.length === 0) return null;

    return (
        <svg
            viewBox="0 0 8 8"
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
        >
            <defs>
                
                <marker
                    id="board-arrow-head"
                    markerWidth="3" // 3
                    markerHeight="3" // 3
                    refX="1.4" // 2.4
                    refY="1.5" // 1.5
                    orient="auto-start-reverse"
                >
                    <path d="M0,0 L3,1.5 L0,3 Z" className="fill-danger" />
                
                </marker>
            
            </defs>

            {arrows.map((arrow) => {
                
                const start = getSquareCenter(arrow.from, orientation);
                const end = getSquareCenter(arrow.to, orientation);

                // Encurta a linha perto do destino para a ponta da seta não
                // ficar "enterrada" atrás do marcador de seta.
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const length = Math.hypot(dx, dy) || 1;
                const shorten = 0.38; //0.38
                const endX = end.x - (dx / length) * shorten;
                const endY = end.y - (dy / length) * shorten;

                return (
                    <line
                        key={`${arrow.from}-${arrow.to}`}
                        x1={start.x}
                        y1={start.y}
                        x2={endX}
                        y2={endY}
                        className="stroke-danger"
                        strokeWidth={0.14} // 0.14
                        strokeLinecap="round"
                        opacity={0.85}
                        markerEnd="url(#board-arrow-head)"
                    />
                );
            })}
        
        </svg>
    );
}