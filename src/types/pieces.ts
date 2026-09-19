/*
    Tipos de domínio da peça de xadrez — usados pelo <Square /> na Interface
*/

// Distinção de cor da peça
export type PieceColor = "white" | "black";

// Distinção do tipo da peça
export type PieceType = "king" | "queen" | "rook" | "bishop" | "knight" | "pawn";

// Componente principal da peça, com movimentação e quaisquer outras propriedades
// (Continuação da implementação dessa tipagem a cargo da Máquina de Regras)
export interface Piece {
    type: PieceType;
    // movement: (...) - Máquina de Regras
}

// Componente "jogável" de peça, incluindo a peça, sua cor e seu estado de vida
export interface PlayablePiece {
    piece: Piece;
    color: PieceColor;
    alive?: boolean; // Booleano para saber se a peça tá viva
}