import { expect, test } from 'vitest';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { QueenStrategy } from '../../engine/pieces/queen';
import type { Square } from '../../engine';

test('dama central combina eixos com bloqueio e capturas diagonais', () => {
  const board = boardFromFen('8/8/2p1P1p1/8/2P1Q1P1/8/2p1P1p1/8');
  const before = structuredClone(board);
  const expected: Square[] = [
    [3, 4], [5, 4], [4, 3], [4, 5],
    [3, 3], [2, 2], [3, 5], [2, 6], [5, 3], [6, 2], [5, 5], [6, 6],
  ];

  const actual = new QueenStrategy().moves(board, [4, 4]);

  expect([...actual].sort()).toEqual([...expected].sort());
  expect(board).toEqual(before);
});
