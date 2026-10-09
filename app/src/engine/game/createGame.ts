import type { GameState } from '../types';
import { createInitialBoard } from '../board/board';

// Cria o estado de uma partida nova: posicao inicial, brancas comecam,
// todos os roques permitidos, sem en passant, sem pecas capturadas
// e contadores no inicio.
export function createGame(): GameState {
  return {
    board: createInitialBoard(),
    turn: 'w',
    pendingPromotion: null,
    captured: [],
    internal: {
      castling: {
        whiteKingSide: true,
        whiteQueenSide: true,
        blackKingSide: true,
        blackQueenSide: true,
      },
      enPassant: null,
      halfmoveClock: 0,
      fullmoveNumber: 1,
    },
  };
}
