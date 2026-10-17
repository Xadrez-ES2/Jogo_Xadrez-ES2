import type { Board, Color, GameState, Move } from '../types';
import { PIECE_STRATEGIES } from './strategies';
import { movePiece } from '../board/movePiece';
import { isInCheck, isSquareAttacked } from '../status/attack';

// Gera os lances pseudo-legais da cor: respeitam o movimento de cada peca,
// mas ainda podem deixar o proprio rei atacado.
function pseudoLegalMoves(board: Board, color: Color): Move[] {
  const moves: Move[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === null || piece.color !== color) {
        continue;
      }
      const strategy = PIECE_STRATEGIES[piece.type];
      for (const to of strategy.moves(board, [row, col])) {
        moves.push({ from: [row, col], to });
      }
    }
  }
  return moves;
}

function castlingMoves(state: GameState): Move[] {
  const { board, turn: color, internal: { castling } } = state;
  const row = color === 'w' ? 7 : 0;
  const enemy: Color = color === 'w' ? 'b' : 'w';
  const king = board[row][4];
  if (king?.type !== 'k' || king.color !== color || isInCheck(board, color)) return [];

  const moves: Move[] = [];
  const sides = color === 'w'
    ? [[castling.whiteKingSide, 7, 5, 6], [castling.whiteQueenSide, 0, 3, 2]] as const
    : [[castling.blackKingSide, 7, 5, 6], [castling.blackQueenSide, 0, 3, 2]] as const;
  for (const [allowed, rookCol, transitCol, targetCol] of sides) {
    const rook = board[row][rookCol];
    if (!allowed || rook?.type !== 'r' || rook.color !== color) continue;
    const between = rookCol === 7 ? [5, 6] : [1, 2, 3];
    if (between.some((col) => board[row][col] !== null)) continue;
    const transitBoard = movePiece(board, { from: [row, 4], to: [row, transitCol] });
    if (isSquareAttacked(transitBoard, [row, transitCol], enemy)) continue;
    moves.push({ from: [row, 4], to: [row, targetCol] });
  }
  return moves;
}

function enPassantMoves(state: GameState): Move[] {
  const target = state.internal.enPassant;
  if (!target) return [];
  const { board, turn: color } = state;
  const dir = color === 'w' ? -1 : 1;
  const fromRow = target[0] - dir;
  const moves: Move[] = [];
  for (const fromCol of [target[1] - 1, target[1] + 1]) {
    if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7) continue;
    const pawn = board[fromRow][fromCol];
    const captured = board[fromRow][target[1]];
    if (pawn?.type === 'p' && pawn.color === color && captured?.type === 'p' && captured.color !== color) {
      moves.push({ from: [fromRow, fromCol], to: target });
    }
  }
  return moves;
}

function boardAfterMove(state: GameState, move: Move): Board {
  const { board, internal: { enPassant } } = state;
  const piece = board[move.from[0]][move.from[1]];
  let result = movePiece(board, move);
  if (piece?.type === 'p' && enPassant && move.to[0] === enPassant[0] && move.to[1] === enPassant[1]
    && move.from[1] !== move.to[1] && board[move.to[0]][move.to[1]] === null) {
    const capturedRow = move.to[0] + (piece.color === 'w' ? 1 : -1);
    const mutable = result.map((row) => [...row]);
    mutable[capturedRow][move.to[1]] = null;
    result = mutable;
  }
  if (piece?.type === 'k' && Math.abs(move.to[1] - move.from[1]) === 2) {
    const rookFrom = move.to[1] > move.from[1] ? 7 : 0;
    const rookTo = move.to[1] > move.from[1] ? 5 : 3;
    result = movePiece(result, { from: [move.from[0], rookFrom], to: [move.from[0], rookTo] });
  }
  return result;
}

// Retorna as jogadas legais do jogador da vez: os lances pseudo-legais
// que, depois de simulados, nao deixam o proprio rei atacado.
export function getLegalMoves(state: GameState): Move[] {
  const color = state.turn;
  return [...pseudoLegalMoves(state.board, color), ...castlingMoves(state), ...enPassantMoves(state)].filter(
    (move) => !isInCheck(boardAfterMove(state, move), color),
  );
}
