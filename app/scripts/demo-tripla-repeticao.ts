// Salve em app/scripts/demo-tripla-repeticao.ts.
// Dentro de app, execute: node --import tsx scripts/demo-tripla-repeticao.ts
// Requer os arquivos da implementacao de tripla repeticao ja instalados.

import {
  applyMove,
  createGame,
  getGameStatus,
  getLegalMoves,
  isThreefoldRepetition,
  sameSquare,
} from '../src/engine/index';
import type { GameState, Square } from '../src/engine/index';

function square(name: string): Square {
  return [8 - Number(name[1]), 'abcdefgh'.indexOf(name[0])];
}

// Le o historico apenas para exibir o diagnostico; a decisao de empate
// e tomada pela API real da engine, nao por uma regra recriada no script.
function occurrences(state: GameState): number {
  const history = state.internal.positionHistory;
  if (!history?.length) {
    throw new Error('Historico de posicoes ausente. Instale primeiro os arquivos da engine enviados no ZIP.');
  }
  return history.filter((key) => key === history.at(-1)).length;
}

function requireCondition(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

function main(): void {
  let game = createGame();
  const sequence = ['g1f3', 'g8f6', 'f3g1', 'f6g8', 'g1f3', 'g8f6', 'f3g1', 'f6g8'];
  const rows: { etapa: string; movimento: string; vez: string; ocorrencias: number; status: string }[] = [];

  function show(etapa: string, movimento: string): void {
    rows.push({
      etapa,
      movimento,
      vez: game.turn === 'w' ? 'Brancas' : 'Pretas',
      ocorrencias: occurrences(game),
      status: getGameStatus(game),
    });
  }

  console.log('\nDemonstracao de tripla repeticao com a engine do projeto.');
  console.log('Os cavalos saem e voltam duas vezes. A posicao inicial ja conta como primeira ocorrencia.\n');
  show('Inicio', '-');
  requireCondition(!isThreefoldRepetition(game), 'A partida nova nao deve estar empatada.');

  sequence.forEach((notation, index) => {
    const from = square(notation.slice(0, 2));
    const to = square(notation.slice(2));
    const move = getLegalMoves(game).find((candidate) =>
      sameSquare(candidate.from, from) && sameSquare(candidate.to, to));
    requireCondition(move !== undefined, `A engine rejeitou o lance ${notation}.`);
    game = applyMove(game, move!);
    show(`${index + 1}`, `${notation.slice(0, 2)} -> ${notation.slice(2)}`);

    if (index < sequence.length - 1) {
      requireCondition(!isThreefoldRepetition(game), `Empate antecipado apos ${notation}.`);
      requireCondition(getGameStatus(game) === 'playing', `Status inesperado apos ${notation}.`);
    }
    if (index === 3) {
      requireCondition(occurrences(game) === 2, 'O primeiro ciclo deve completar apenas a segunda ocorrencia.');
    }
  });

  console.table(rows);
  requireCondition(occurrences(game) === 3, 'Esperadas tres ocorrencias da posicao final.');
  requireCondition(isThreefoldRepetition(game), 'A engine nao detectou a tripla repeticao.');
  requireCondition(getGameStatus(game) === 'threefold-repetition', 'Esperado o status threefold-repetition.');
  console.log('OK: a segunda ocorrencia manteve a partida em playing.');
  console.log('OK: a terceira ocorrencia retornou threefold-repetition.');

  const newGame = createGame();
  requireCondition(occurrences(newGame) === 1 && !isThreefoldRepetition(newGame), 'O historico nao foi reiniciado.');
  console.log('OK: uma nova partida recomecou com apenas uma ocorrencia.');
  console.log('\nTESTE APROVADO: empate por tripla repeticao detectado.\n');
}

try {
  main();
} catch (error) {
  console.error('\nTESTE REPROVADO:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
