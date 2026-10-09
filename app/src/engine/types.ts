// Contratos da Engine

// Casa: [linha, coluna]. Linha 0 = fileira 8, coluna 0 = coluna a.
export type Square = readonly [number, number];

export type Color = 'w' | 'b';

// p = peao, n = cavalo, b = bispo, r = torre, q = dama, k = rei
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export type Piece = {
  readonly type: PieceType;
  readonly color: Color;
};

// Matriz 8x8. null = casa vazia.
export type Board = readonly (readonly (Piece | null)[])[];

export type Move = {
  readonly from: Square;
  readonly to: Square;
};

// Booleano relativo ao direito de executar o roque
export type CastlingRights = {
  readonly whiteKingSide: boolean;
  readonly whiteQueenSide: boolean;
  readonly blackKingSide: boolean;
  readonly blackQueenSide: boolean;
};

export type GameState = {
  readonly board: Board;
  readonly turn: Color;
  readonly pendingPromotion: Square | null;
  // Uso interno da engine, interface e IA nao devem depender disso
  readonly internal: {
    readonly castling: CastlingRights;
    readonly enPassant: Square | null;
    readonly halfmoveClock: number;
    readonly fullmoveNumber: number;
  };
};

// Situacao da partida para o jogador da vez.
// 'check': o rei da vez esta atacado. 'checkmate': esta atacado e nao ha lances.
export type GameStatus = 'playing' | 'check' | 'checkmate';
