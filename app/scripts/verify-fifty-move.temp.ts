import { applyMove, createGame, getGameStatus, getLegalMoves } from '../src/engine';
import { boardFromFen } from '../src/engine/board/notation_for_test';

let state = createGame();
const cycle = [
  [[7, 1], [5, 2]], [[0, 1], [2, 2]],
  [[5, 2], [7, 1]], [[2, 2], [0, 1]],
] as const;

for (let index = 0; index < 100; index++) {
  const [from, to] = cycle[index % cycle.length];
  const move = getLegalMoves(state).find((candidate) =>
    candidate.from[0] === from[0] && candidate.from[1] === from[1]
    && candidate.to[0] === to[0] && candidate.to[1] === to[1]);
  if (!move) throw new Error(`No legal knight move at half-move ${index + 1}`);
  state = applyMove(state, move);
}

if (state.internal.halfmoveClock !== 100 || getGameStatus(state) !== 'fifty-moves') {
  throw new Error(`Expected draw at 100 half-moves; got ${state.internal.halfmoveClock} / ${getGameStatus(state)}`);
}
console.log(`100 half-moves: clock=${state.internal.halfmoveClock}, status=${getGameStatus(state)}`);

const base = createGame();
const pawnState = { ...base, internal: { ...base.internal, halfmoveClock: 99 } };
const pawnMove = getLegalMoves(pawnState).find((move) => move.from[0] === 6 && move.from[1] === 4 && move.to[0] === 5 && move.to[1] === 4);
if (!pawnMove || applyMove(pawnState, pawnMove).internal.halfmoveClock !== 0) {
  throw new Error('A pawn move failed to reset the half-move clock');
}

const captureState = {
  ...base,
  board: boardFromFen('n3k3/8/8/8/8/8/8/R3K3'),
  internal: { ...base.internal, halfmoveClock: 99 },
};
const captureMove = getLegalMoves(captureState).find((move) => move.from[0] === 7 && move.from[1] === 0 && move.to[0] === 0 && move.to[1] === 0);
if (!captureMove || applyMove(captureState, captureMove).internal.halfmoveClock !== 0) {
  throw new Error('A capture failed to reset the half-move clock');
}
console.log('Pawn and capture moves reset the clock to 0');
