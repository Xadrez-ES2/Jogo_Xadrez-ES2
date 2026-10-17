import type { GameState, Move } from '../types';
import { movePiece } from '../board/movePiece';
import type { Board, Color } from '../types';

function applyBoardMove(state: GameState, move: Move): Board {
  const piece = state.board[move.from[0]][move.from[1]];
  let board = movePiece(state.board, move);
  if (piece?.type === 'k' && Math.abs(move.to[1] - move.from[1]) === 2) {
    const row = move.from[0];
    const rookFrom = move.to[1] > move.from[1] ? 7 : 0;
    const rookTo = move.to[1] > move.from[1] ? 5 : 3;
    board = movePiece(board, { from: [row, rookFrom], to: [row, rookTo] });
  }
  return board;
}

function updateCastlingRights(state: GameState, move: Move) {
  const rights: {
    whiteKingSide: boolean;
    whiteQueenSide: boolean;
    blackKingSide: boolean;
    blackQueenSide: boolean;
  } = { ...state.internal.castling };
  const moving = state.board[move.from[0]][move.from[1]];
  const captured = state.board[move.to[0]][move.to[1]];
  const revokeRookRight = (color: Color, row: number, col: number) => {
    if (color === 'w' && row === 7 && col === 0) rights.whiteQueenSide = false;
    if (color === 'w' && row === 7 && col === 7) rights.whiteKingSide = false;
    if (color === 'b' && row === 0 && col === 0) rights.blackQueenSide = false;
    if (color === 'b' && row === 0 && col === 7) rights.blackKingSide = false;
  };
  if (moving?.type === 'k') {
    if (moving.color === 'w') rights.whiteKingSide = rights.whiteQueenSide = false;
    else rights.blackKingSide = rights.blackQueenSide = false;
  }
  if (moving?.type === 'r') revokeRookRight(moving.color, move.from[0], move.from[1]);
  if (captured?.type === 'r') revokeRookRight(captured.color, move.to[0], move.to[1]);
  return rights;
}

// Aplica a jogada e devolve um estado novo: peca movida, turno trocado
// e numero do lance atualizado. O estado recebido nao e alterado.
// Os outros campos (roque, en passant, contador dos 50 lances, promocao)
// ainda passam sem mudanca e serao atualizados nas issues de cada um.
export function applyMove(state: GameState, move: Move): GameState {
  const nextTurn = state.turn === 'w' ? 'b' : 'w';

  // O numero do lance aumenta depois que as pretas jogam
  const fullmoveNumber = state.turn === 'b'
    ? state.internal.fullmoveNumber + 1
    : state.internal.fullmoveNumber;

  return {
    ...state,
    board: applyBoardMove(state, move),
    turn: nextTurn,
    internal: {
      ...state.internal,
      castling: updateCastlingRights(state, move),
      fullmoveNumber,
    },
  };
}
