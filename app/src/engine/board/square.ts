import type { Square } from '../types';

// Compara duas casas pelos valores.
export function sameSquare(a: Square, b: Square): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

// Verifica se a linha e a coluna estao dentro do tabuleiro (0 a 7).
export function isInside(row: number, col: number): boolean {
  return row >= 0 && row <= 7 && col >= 0 && col <= 7;
}

// Verifica se uma casa esta na lista.
export function containsSquare(list: readonly Square[], square: Square): boolean {
  for (const s of list) {
    if (sameSquare(s, square)) {
      return true;
    }
  }
  return false;
}
