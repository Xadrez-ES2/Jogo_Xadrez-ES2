// Contratos da Engine

// Casa: [linha, coluna]. Linha 0 = fileira 8, coluna 0 = coluna a.
export type Square = readonly [number, number];

export type Color = 'w' | 'b';

// p = peao, n = cavalo, b = bispo, r = torre, q = dama, k = rei
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PromotionPieceType = Exclude<PieceType, 'p' | 'k'>;

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
    // Chaves das posicoes completas, incluindo a inicial. Opcional para
    // compatibilidade com estados antigos; historico ausente nao e inferido.
    readonly positionHistory?: readonly string[];
  };
};

// Situacao da partida para o jogador da vez.
// 'checkmate': rei atacado sem lances; 'stalemate': sem lances e sem xeque.
// 'fifty-moves': empate pela regra dos 50 lances.
// 'threefold-repetition': a posicao atual ocorreu pelo menos tres vezes.
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate' | 'fifty-moves' | 'threefold-repetition';

