import { expect, test } from 'vitest';
import { boardFromFen } from '../../engine/board/notation_for_test';
import { RookStrategy } from '../../engine/pieces/rook';
import { QueenStrategy } from '../../engine/pieces/queen';
import { KnightStrategy } from '../../engine/pieces/knight';
import { PawnStrategy } from '../../engine/pieces/pawn';
import type { Square } from '../../engine';
import type { PieceStrategy } from '../../engine/pieces/pieces';

type Case = { rule: string; strategy: PieceStrategy; fen: string; from: Square; expected: Square[] };

// Literal sets worked from chess rules, never generated from production offsets.
const cases: Case[] = [
  { rule: 'torre para antes de aliada e depois da captura adversaria', strategy: new RookStrategy(),
    fen: '8/8/4P3/8/4R3/8/4b3/8', from: [4,4],
    expected: [[3,4],[5,4],[6,4],[4,0],[4,1],[4,2],[4,3],[4,5],[4,6],[4,7]] },
  { rule: 'dama central combina eixos com bloqueio e capturas diagonais', strategy: new QueenStrategy(),
    fen: '8/8/2p1P1p1/8/2P1Q1P1/8/2p1P1p1/8', from: [4,4],
    expected: [[3,4],[5,4],[4,3],[4,5],[3,3],[2,2],[3,5],[2,6],[5,3],[6,2],[5,5],[6,6]] },
  { rule: 'cavalo salta cerco aliado mas exclui destino aliado e permite captura', strategy: new KnightStrategy(),
    fen: '8/8/3P1p2/3PPP2/3PNP2/3PPP2/8/8', from: [4,4],
    expected: [[2,5],[3,2],[3,6],[5,2],[5,6],[6,3],[6,5]] },
  { rule: 'peão branco oferece avanço simples e duplo e exclui diagonais vazia e aliada', strategy: new PawnStrategy(),
    fen: '8/8/8/8/8/3P4/4P3/8', from: [6,4], expected: [[5,4],[4,4]] },
  { rule: 'branco fora da fileira inicial nao avanca duas casas', strategy: new PawnStrategy(),
    fen: '8/8/8/8/4P3/8/8/8', from: [4,4], expected: [[3,4]] },
  { rule: 'preto nao atravessa aliada frontal', strategy: new PawnStrategy(),
    fen: '8/4p3/4n3/8/8/8/8/8', from: [1,4], expected: [] },
];

test.each(cases)('$rule', ({ strategy, fen, from, expected }) => {
  const board = boardFromFen(fen);
  const before = structuredClone(board);
  const actual = strategy.moves(board, from);
  expect([...actual].sort()).toEqual([...expected].sort());
  expect(board).toEqual(before);
});
