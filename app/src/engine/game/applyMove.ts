import type { GameState, Move } from '../types';
import { movePiece } from '../board/movePiece';
import { getPiece } from '../board/board';

// Aplica a jogada e devolve um estado novo: peca movida, turno trocado,
// numero do lance e contador dos 50 lances atualizados.
// O estado recebido nao e alterado.
// Os outros campos (roque, en passant, promocao) ainda passam sem mudanca
// e serao atualizados nas issues de cada um.
export function applyMove(state: GameState, move: Move): GameState {
  const nextTurn = state.turn === 'w' ? 'b' : 'w';

  // O numero do lance aumenta depois que as pretas jogam
  const fullmoveNumber = state.turn === 'b'
    ? state.internal.fullmoveNumber + 1
    : state.internal.fullmoveNumber;

  // Contador dos 50 lances: zera em lance de peao ou captura, senao soma 1
  const isPawnMove = getPiece(state.board, move.from)?.type === 'p';
  const isCapture = getPiece(state.board, move.to) !== null;
  const halfmoveClock = isPawnMove || isCapture ? 0 : state.internal.halfmoveClock + 1;

  return {
    ...state,
    board: movePiece(state.board, move),
    turn: nextTurn,
    internal: {
      ...state.internal,
      halfmoveClock,
      fullmoveNumber,
    },
  };
}
