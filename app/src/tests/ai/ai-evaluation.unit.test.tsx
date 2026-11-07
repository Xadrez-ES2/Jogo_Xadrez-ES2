// Issue: Testes da funcao de avaliacao
import { describe, expect, test } from 'vitest';
import { createGame } from '../../engine';
import { evaluate } from '../../ai/evaluation';
import { stateFromFen } from './aiHelpers';

describe('Funcao de avaliacao - valores exatos', () => {
  test('posicao inicial e tabuleiro vazio valem 0', () => {
    expect(evaluate(createGame())).toBe(0);
    expect(evaluate(stateFromFen('8/8/8/8/8/8/8/8'))).toBe(0);
  });

  test('peao soma valor + centro + avanco', () => {
    expect(evaluate(stateFromFen('8/8/8/8/8/8/4P3/8'))).toBe(105); // e2: 100 + 5 + 0
    expect(evaluate(stateFromFen('8/8/8/8/4P3/8/8/8'))).toBe(130); // e4: 100 + 20 + 2*5
    expect(evaluate(stateFromFen('8/4P3/8/8/8/8/8/8'))).toBe(130); // e7: 100 + 5 + 5*5
  });

  test('bonus de centro so vale para peao, cavalo e bispo', () => {
    expect(evaluate(stateFromFen('8/8/8/8/3N4/8/8/8'))).toBe(340); // cavalo d4
    expect(evaluate(stateFromFen('8/8/8/8/3B4/8/8/8'))).toBe(350); // bispo d4
    expect(evaluate(stateFromFen('8/8/8/8/3R4/8/8/8'))).toBe(500); // torre d4
    expect(evaluate(stateFromFen('8/8/8/8/3Q4/8/8/8'))).toBe(800); // dama d4
  });

  test('peca preta conta negativo e posicoes espelhadas se anulam', () => {
    expect(evaluate(stateFromFen('8/8/8/4p3/8/8/8/8'))).toBe(-130); // e5 preto
    expect(evaluate(stateFromFen('8/8/8/4p3/4P3/8/8/8'))).toBe(0); // e4 x e5
  });
});

describe('Funcao de avaliacao - qualidade', () => {
  test('mais material e melhor', () => {
    const equal = evaluate(stateFromFen('4k3/8/8/8/8/8/8/4K3'));
    const extraQueen = evaluate(stateFromFen('4k3/8/8/8/8/8/8/3QK3'));
    expect(extraQueen).toBeGreaterThan(equal);
  });

  test('cavalo no centro vale mais que no canto', () => {
    expect(evaluate(stateFromFen('8/8/8/8/3N4/8/8/8'))).toBeGreaterThan(evaluate(stateFromFen('8/8/8/8/8/8/8/N7')));
  });

  test('peao mais perto da promocao vale mais', () => {
    expect(evaluate(stateFromFen('8/P7/8/8/8/8/8/8'))).toBeGreaterThan(evaluate(stateFromFen('8/8/8/8/8/8/P7/8')));
  });

  test('avaliacao nao depende de quem joga', () => {
    const fen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R';
    expect(evaluate(stateFromFen(fen, 'w'))).toBe(evaluate(stateFromFen(fen, 'b')));
  });
});
