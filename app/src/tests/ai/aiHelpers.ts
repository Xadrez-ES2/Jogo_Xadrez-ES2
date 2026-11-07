// Funcoes de apoio dos testes da IA (nao e um arquivo de teste).
import type { Color, GameState } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';

// Monta um estado a partir da FEN, sem roque e sem en passant
export function stateFromFen(fen: string, turn: Color = 'w', halfmoveClock = 0): GameState {
  return {
    board: boardFromFen(fen),
    turn,
    pendingPromotion: null,
    internal: {
      castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
      enPassant: null,
      halfmoveClock,
      fullmoveNumber: 1,
    },
  };
}

// Posicoes conhecidas usadas nos testes
export const MATED = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR'; // mate do louco: brancas levaram mate
export const STALEMATE = '7k/5Q2/6K1/8/8/8/8/8'; // pretas jogam e nao tem lance
export const WHITE_MATE_IN_1 = '6k1/5ppp/8/8/8/8/8/R5K1'; // Ta8#
export const BLACK_MATE_IN_1 = 'r5k1/8/8/8/8/8/5PPP/6K1'; // ...Ta1#
export const HANGING_QUEEN = 'k7/8/8/3q4/8/8/1p1R4/4K3'; // torre pode pegar dama ou peao
export const PROMOTION = '7k/P7/8/8/8/8/8/K7';
export const MIDDLEGAME = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R';
export const TRAP = 'k7/8/4p3/3p4/8/8/8/K2R4'; // Txd5 ganha peao mas perde a torre
