import { expect, test } from 'vitest';
import { containsSquare } from '../../engine';
import type { Square } from '../../engine';

test('encontra uma casa na lista pelas coordenadas', () => {
  const squares: Square[] = [[0, 0], [4, 4]];

  expect(containsSquare(squares, [4, 4])).toBe(true);
  expect(containsSquare(squares, [4, 5])).toBe(false);
});
