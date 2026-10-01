import { useCallback, useEffect, useRef, useState } from "react";
import type { SquareId } from "../types/square";


// Interface da Seta, só com Quadrado Inicial e Final do Tabuleiro
export interface BoardArrow {
    from: SquareId;
    to: SquareId;
}

/*
    Hook personalizado para gerenciar as setas e casas destacadas desenhadas 
    com o botão direito do mouse (Anotações visuais do jogador).

    Convenção usada por apps de xadrez (Chess.com):
    - Botão direito pressionado numa casa e solto na MESMA casa
        -> alterna o destaque daquela casa (liga/desliga).
    
    - Botão direito pressionado numa casa e solto em OUTRA casa
        -> alterna uma seta entre as duas (desenha se não existir,
    remove se a mesma seta já existir).

    'clearAnnotations()' deve ser chamado sempre que o jogador fizer um
    clique esquerdo no tabuleiro — senão as setas ficam
    acumulando indefinidamente.
*/
export function useBoardArrows() {

    // Array de Setas existentes
    const [arrows, setArrows] = useState<BoardArrow[]>([]);
    // Quadrados destacados
    const [highlightedSquares, setHighlightedSquares] = useState<SquareId[]>([]);
    
    const dragStartSquare = useRef<SquareId | null>(null);

    // Segurança: se o botão direito for solto fora de qualquer casa
    // (ex: arrastou pra fora do tabuleiro), não deixa um "início" pendente.
    useEffect(() => {
        
        function handleWindowMouseUp() {
            dragStartSquare.current = null;
        }
        
        window.addEventListener("mouseup", handleWindowMouseUp);
        
        return () => window.removeEventListener("mouseup", handleWindowMouseUp);
    
    }, []);

    const handleSquareContextMouseDown = useCallback(
        (square: SquareId, event: React.MouseEvent) => {
            
            if (event.button !== 2) return; // só botão direito
            
            event.preventDefault();
            
            dragStartSquare.current = square;
        },
        []
    );

    const handleSquareContextMouseUp = useCallback(
        (square: SquareId, event: React.MouseEvent) => {
            
            if (event.button !== 2) return; // só botão direito
            
            const start = dragStartSquare.current;
            
            dragStartSquare.current = null;
            if (!start) return;

            if (start === square) {
                
                setHighlightedSquares((current) =>
                    current.includes(square)
                        ? current.filter((s) => s !== square)
                        : [...current, square]
                );
                
                return;
            }

            setArrows((current) => {
                
                const alreadyExists = current.some(
                    (arrow) => arrow.from === start && arrow.to === square
                );
                
                if (alreadyExists) {
                    return current.filter(
                        (arrow) => !(arrow.from === start && arrow.to === square)
                    );
                }
                
                return [...current, { from: start, to: square }];
            });
        },
        []
    );

    const clearAnnotations = useCallback(() => {
        setArrows([]);
        setHighlightedSquares([]);
    }, []);

    return {
        arrows,
        highlightedSquares,
        handleSquareContextMouseDown,
        handleSquareContextMouseUp,
        clearAnnotations,
    };
}