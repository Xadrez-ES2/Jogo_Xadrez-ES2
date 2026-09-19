import type { Piece, PlayablePiece } from "../../types/pieces";

/*
    Glifos Unicode de xadrez, por cor e tipo de peça.

    Outras opções para representação visual das Peças:
    - SVG
    - Sprites (12 imagens PNG)
    - Biblioteca de Ícones
*/
const PlayablePiece_GLYPHS: Record<PlayablePiece["color"], Record<Piece["type"], string>> = {
    white: { king: "♔", queen: "♕", rook: "♖", bishop: "♗", knight: "♘", pawn: "♙" },
    black: { king: "♚", queen: "♛", rook: "♜", bishop: "♝", knight: "♞", pawn: "♟" },
};

const PlayablePiece_NAMES_PT: Record<Piece["type"], string> = {
    king: "rei",
    queen: "dama",
    rook: "torre",
    bishop: "bispo",
    knight: "cavalo",
    pawn: "peão",
};

// Rótulo acessível, ex: "peça branca: rei" — usado no aria-label da casa.
export function getPlayablePieceAccessibleLabel(PlayablePiece: PlayablePiece): string {
    
    const colorLabel = PlayablePiece.color === "white" ? "peça branca" : "peça preta";
    
    return `${colorLabel}: ${PlayablePiece_NAMES_PT[PlayablePiece.piece.type]}`;
}

export function PieceGlyph({ playablePiece }: { playablePiece: PlayablePiece }) {
    return (
        <span
            aria-hidden="true"
            className={`pointer-events-none select-none text-[2.1rem] leading-none drop-shadow-sm sm:text-[2.4rem] ${
                playablePiece.color === "white" ? "text-white" : "text-black"
            }`}
        >
            {PlayablePiece_GLYPHS[playablePiece.color][playablePiece.piece.type]}
        
        </span>
    );
}