import type { PlayablePiece } from "../../types/pieces";
import type { SquareId } from "../../types/square";
import { getPlayablePieceAccessibleLabel, PieceGlyph } from "./PieceGlyph";


interface SquareProps {
    
    // Identificador de casa, ex: "e4".
    id: SquareId;
    
    // Casa clara ou escura, já calculada pelo <Board /> a partir da posição. 
    isLight: boolean;
    
    // Peça presente na casa, se houver. `undefined` = casa vazia. 
    piece?: PlayablePiece;
    
    // Casa atualmente selecionada pelo jogador (origem de um lance em andamento).
    isSelected?: boolean;
    
    // Casa é um destino legal para a peça selecionada (mostra indicadores/highlights de lances possíveis). 
    isLegalMove?: boolean;
    
    // Casa fez parte do último lance (origem ou destino), para destacar o histórico visualmente.
    isLastMove?: boolean;
    
    // Casa contém o rei em xeque no momento.
    isCheck?: boolean;

    // Casa marcada manualmente pelo jogador (anotação, não é lance).
    isAnnotated?: boolean;
    
    // Notificado com o id da casa quando ela é clicada/tocada.Opcional até conter lógica da Máquina de Regras.
    onSelect?: (square: SquareId) => void;

    // Botão direito pressionado sobre a casa — início de uma possível seta.
    onContextMouseDown?: (square: SquareId, event: React.MouseEvent) => void;
    
    // Botão direito solto sobre a casa — fecha a seta/alterna o destaque.
    onContextMouseUp?: (square: SquareId, event: React.MouseEvent) => void;
}

/*
    Única casa do tabuleiro que decide seu próprio visual com base
    em informações/dados/estado concedido(s) pelo Tabuleiro (<Board />).
*/
export function Square({
    id,
    isLight,
    piece,
    isSelected = false,
    isLegalMove = false,
    isLastMove = false,
    isCheck = false,
    isAnnotated = false,
    onSelect,
    onContextMouseDown,
    onContextMouseUp,
}: SquareProps) {
    
    const accessibleLabel = piece
        ? `Casa ${id}, ${getPlayablePieceAccessibleLabel(piece)}`
        : `Casa ${id}, vazia`;

    return (
        <button
            type="button"
            onClick={() => onSelect?.(id)}
            onContextMenu={(event) => event.preventDefault()}
            onMouseDown={(event) => onContextMouseDown?.(id, event)}
            onMouseUp={(event) => onContextMouseUp?.(id, event)}
            aria-label={accessibleLabel}
            aria-pressed={isSelected}
            className={`relative flex aspect-square cursor-default items-center justify-center transition-colors ${
                isLight ? "bg-board-light" : "bg-board-dark" }`}
        >
            {/* Destaque de último lance — atrás da peça, sutil (VERIFICAR ESTILIZAÇÃO) */}
            {isLastMove && (
                <span className="absolute inset-0 bg-accent/20" aria-hidden="true" />
            )}

            {/* Destaque de xeque — sobrepõe com um tom de perigo (VERIFICAR ESTILIZAÇÃO) */}
            {isCheck && <span className="absolute inset-0 bg-danger/40" aria-hidden="true" />}

            {/* Anotação manual do jogador (botão direito para setas) */}  
            {isAnnotated && (
                // "absolute inset-0 ring-2 ring-inset bg-danger/35" 
                <div 
                    className="absolute size-full bg-danger"
                    aria-hidden="true"
                />
            )}

            {/* Anel de seleção da casa de origem */}
            {isSelected && (

                // Versão com <span />:
                // <span
                //     className="absolute inset-0 ring-2 ring-inset ring-accent"
                //     aria-hidden="true"
                // />
                
                // Versão com <div /> (Mais aceito no momento)
                <div 
                    className="absolute size-full border-solid border-4 border-accent"
                    aria-hidden="true"
                />
            )}

            {/* Indicador de lance legal: bolinha para casa vazia, anel para captura (VERIFICAR ESTILIZAÇÃO) */}
            {/* Casa Vazia */}
            {isLegalMove && !piece && (
                <span
                    className="absolute h-1/3 w-1/3 rounded-full bg-text-muted/50"
                    aria-hidden="true"
                />
            )}
            
            {/* Captura */}
            {isLegalMove && piece && (
                <span
                    className="absolute inset-1 rounded-sm ring-[3px] ring-inset ring-accent/70"
                    aria-hidden="true"
                />
            )}

            {piece && <PieceGlyph playablePiece={piece} />}
        
        </button>
    );
}