import { expect, test } from 'vitest';
import type { GameState, Move, Square } from '../../engine';
import { createGame, getGameStatus, getLegalMoves } from '../../engine';
import { allCastlingRights, boardToFen, playLegalMove } from './engineTestHelpers';

const onlyBlackCastlingRights = { ...allCastlingRights, whiteKingSide: false, whiteQueenSide: false };

type Step = {
  notation: string; move: Move; fen: string; turn: 'w' | 'b';
  halfmove: number; fullmove: number; enPassant: Square | null;
  castling?: GameState['internal']['castling'];
};

// Positions worked independently from the Italian opening, after each half-move.
const opening: Step[] = [
  { notation: '1.e4', move: { from: [6, 4], to: [4, 4] }, fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR', turn: 'b', halfmove: 0, fullmove: 1, enPassant: [5, 4] },
  { notation: '1...e5', move: { from: [1, 4], to: [3, 4] }, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR', turn: 'w', halfmove: 0, fullmove: 2, enPassant: [2, 4] },
  { notation: '2.Nf3', move: { from: [7, 6], to: [5, 5] }, fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R', turn: 'b', halfmove: 1, fullmove: 2, enPassant: null },
  { notation: '2...Nc6', move: { from: [0, 1], to: [2, 2] }, fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R', turn: 'w', halfmove: 2, fullmove: 3, enPassant: null },
  { notation: '3.Bc4', move: { from: [7, 5], to: [4, 2] }, fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R', turn: 'b', halfmove: 3, fullmove: 3, enPassant: null },
  { notation: '3...Bc5', move: { from: [0, 5], to: [3, 2] }, fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R', turn: 'w', halfmove: 4, fullmove: 4, enPassant: null },
  { notation: '4.O-O', move: { from: [7, 4], to: [7, 6] }, fen: 'r1bqk1nr/pppp1ppp/2n5/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1', turn: 'b', halfmove: 5, fullmove: 4, enPassant: null, castling: onlyBlackCastlingRights },
  { notation: '4...d6', move: { from: [1, 3], to: [2, 3] }, fen: 'r1bqk1nr/ppp2ppp/2np4/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1', turn: 'w', halfmove: 0, fullmove: 5, enPassant: null, castling: onlyBlackCastlingRights },
];

test('abertura italiana até o roque preserva posições anteriores e atualiza cada meio-lance', () => {
  let state = createGame();
  const states: GameState[] = [state];
  const snapshots: GameState[] = [structuredClone(state)];
  expect(boardToFen(state.board)).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
  expect(state.turn).toBe('w');
  expect(state.pendingPromotion).toBeNull();
  expect(state.internal).toMatchObject({
    castling: allCastlingRights, halfmoveClock: 0, fullmoveNumber: 1, enPassant: null,
  });
  expect(state.internal.positionHistory).toHaveLength(1);
  const initialLegal = getLegalMoves(state);
  expect(initialLegal).not.toContainEqual({ from: [1, 4], to: [3, 4] });
  expect(initialLegal).not.toContainEqual({ from: [7, 5], to: [6, 4] });
  expect(getGameStatus(state)).toBe('playing');
  for (const [index, step] of opening.entries()) {
    const previous = state;
    state = playLegalMove(previous, step.move);
    expect(boardToFen(state.board), step.notation).toBe(step.fen);
    expect(state.turn, step.notation).toBe(step.turn);
    expect(state.pendingPromotion, step.notation).toBeNull();
    expect(state.internal, step.notation).toMatchObject({
      castling: step.castling ?? allCastlingRights, halfmoveClock: step.halfmove,
      fullmoveNumber: step.fullmove, enPassant: step.enPassant,
    });
    expect(state.internal.positionHistory, step.notation).toHaveLength(index + 2);
    expect(state.internal.positionHistory?.slice(0, -1), step.notation)
      .toEqual(previous.internal.positionHistory);
    expect(getGameStatus(state), step.notation).toBe('playing');
    states.push(state);
    snapshots.push(structuredClone(state));
    states.forEach((old, i) => expect(old, step.notation).toEqual(snapshots[i]));
  }
});
