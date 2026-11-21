import { expect, test } from 'vitest';
import type { Color, GameState, GameStatus, Move, PromotionPieceType } from '../../engine';
import { applyMove, getGameStatus, getLegalMoves, promotePawn } from '../../engine';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { boardToFen } from './engineTestHelpers';

// Dois efeitos distintos da escolha: torre da xeque; subpromocao a cavalo encerra por material.
test.each<{
  description: string; color: Color; fen: string; move: Move; pendingFen: string;
  choice: PromotionPieceType; finalFen: string; nextTurn: Color; fullmove: number; status: GameStatus;
}>([
  { description: 'promoção do peão branco a torre', color: 'w', fen: '7k/P7/8/8/8/8/8/7K',
    move: { from: [1, 0], to: [0, 0] }, pendingFen: 'P6k/8/8/8/8/8/8/7K',
    choice: 'r', finalFen: 'R6k/8/8/8/8/8/8/7K', nextTurn: 'b', fullmove: 12, status: 'check' },
  { description: 'promoção do peão preto a cavalo', color: 'b', fen: '7k/8/8/8/8/8/p7/7K',
    move: { from: [6, 0], to: [7, 0] }, pendingFen: '7k/8/8/8/8/8/8/p6K',
    choice: 'n', finalFen: '7k/8/8/8/8/8/8/n6K', nextTurn: 'w', fullmove: 13, status: 'insufficient-material' },
])('$description conclui exatamente um meio-lance',
  ({ color, fen, move, pendingFen, choice, finalFen, nextTurn, fullmove, status }) => {
    const initial: GameState = {
      board: boardFromFen(fen), turn: color, pendingPromotion: null,
      internal: {
        castling: { whiteKingSide: false, whiteQueenSide: false, blackKingSide: false, blackQueenSide: false },
        enPassant: null, halfmoveClock: 99, fullmoveNumber: 12,
      },
    };
    const original = structuredClone(initial);
    expect(getGameStatus(initial)).toBe('playing');
    expect(getLegalMoves(initial)).toContainEqual(move);
    const pending = applyMove(initial, move);
    const pendingSnapshot = structuredClone(pending);
    expect(boardToFen(pending.board)).toBe(pendingFen);
    expect(pending.pendingPromotion).toEqual(move.to);
    expect(pending.turn).toBe(color);
    expect(pending.internal.fullmoveNumber).toBe(12);
    expect(pending.internal.halfmoveClock).toBe(0);
    // Sem historico recebido, a API registra a posicao inicial, mas nao a incompleta.
    expect(pending.internal.positionHistory).toHaveLength(1);
    expect(getLegalMoves(pending)).toEqual([]);
    expect(getGameStatus(pending)).toBe('playing');
    expect(initial).toEqual(original);

    const completed = promotePawn(pending, choice);
    expect(boardToFen(completed.board)).toBe(finalFen);
    expect(completed.pendingPromotion).toBeNull();
    expect(completed.turn).toBe(nextTurn);
    expect(completed.internal.fullmoveNumber).toBe(fullmove);
    expect(completed.internal.halfmoveClock).toBe(0);
    expect(completed.internal.positionHistory).toHaveLength(2);
    expect(completed.internal.positionHistory?.slice(0, 1)).toEqual(pendingSnapshot.internal.positionHistory);
    expect(completed.internal.positionHistory?.[1]).not.toBe(completed.internal.positionHistory?.[0]);
    expect(getGameStatus(completed)).toBe(status);
    expect(pending).toEqual(pendingSnapshot);
    expect(initial).toEqual(original);

    // Uma escolha diferente revelaria uma troca indevida da peça após a conclusão.
    const finalSnapshot = structuredClone(completed);
    expect(promotePawn(completed, 'q')).toEqual(finalSnapshot);
    expect(completed).toEqual(finalSnapshot);
  });
