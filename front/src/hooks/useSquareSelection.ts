import { useCallback, useState } from "react";
import type { SquareId } from "../types/square";

/*
    Hook personalizado para tratar estado de seleção de casas no tabuleiro: 
    guarda qual casa está selecionada (se houver) e alterna a seleção a 
    cada clique — clicar na mesma casa selecionada desmarca ela.

    Quando a Máquina de Regras existir, este hook tratará os possíceis movimentos:
    ao selecionar uma casa com peça, ele passa a calcular e expor também
    os lances legais dessa peça (para o <Board legalMoves={...} />).
*/
export function useSquareSelection() {
    const [selectedSquare, setSelectedSquare] = useState<SquareId | undefined>();

    const handleSquareSelect = useCallback((square: SquareId) => {
        setSelectedSquare((current) => (current === square ? undefined : square));
    }, []);

    const clearSelection = useCallback(() => setSelectedSquare(undefined), []);

    return { selectedSquare, handleSquareSelect, clearSelection };
}