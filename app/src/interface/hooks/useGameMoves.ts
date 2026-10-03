import { useMemo, useReducer } from "react";
import { applyMove, createGame, getLegalMoves, getPiece, sameSquare } from "../../engine";
import type { GameState, Square } from "../../engine";
import type { PieceColor, PieceType } from "../types/pieces";
import type { BoardState, Move, SquareId } from "../types/square";

const files = "abcdefgh";
const pieceTypes: Record<string, PieceType> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };
export function toEngineSquare(square: SquareId): Square {
    return [8 - Number(square[1]), files.indexOf(square[0])];
}
export function toSquareId(square: Square): SquareId {
    return `${files[square[1]]}${8 - square[0]}` as SquareId;
}
export function toBoardState(game: GameState): BoardState {
    const board: BoardState = {};
    game.board.forEach((row, r) => row.forEach((piece, c) => {
        if (piece) board[toSquareId([r, c])] = {
            piece: { type: pieceTypes[piece.type] }, color: piece.color === "w" ? "white" : "black",
        };
    }));
    return board;
}
export interface PlayedMove extends Move {
    color: PieceColor;
    capture: boolean;
}
interface State {
    game: GameState;
    selected?: SquareId;
    history: PlayedMove[];
}
type Action = { type: "select"; square: SquareId } | { type: "clear" } | { type: "reset" };
export function createMoveState(): State {
    return { game: createGame(), history: [] };
}
export function gameMovesReducer(state: State, action: Action): State {
    if (action.type === "reset") return createMoveState();
    if (action.type === "clear") return { ...state, selected: undefined };
    const to = toEngineSquare(action.square);
    if (state.selected) {
        const from = toEngineSquare(state.selected);
        const move = getLegalMoves(state.game).find((candidate) => sameSquare(candidate.from, from) && sameSquare(candidate.to, to));
        if (move) return {
            game: applyMove(state.game, move), selected: undefined,
            history: [...state.history, {
                from: state.selected, to: action.square,
                color: state.game.turn === "w" ? "white" : "black",
                capture: getPiece(state.game.board, to) !== null,
            }],
        };
    }
    const piece = getPiece(state.game.board, to);
    if (piece?.color === state.game.turn) return {
        ...state, selected: state.selected === action.square ? undefined : action.square,
    };
    return state;
}
export function useGameMoves() {
    const [state, dispatch] = useReducer(gameMovesReducer, undefined, createMoveState);
    const pieces = useMemo(() => toBoardState(state.game), [state.game]);
    const legalMoves = useMemo(() => state.selected
        ? getLegalMoves(state.game).filter((move) => sameSquare(move.from, toEngineSquare(state.selected!))).map((move) => toSquareId(move.to))
        : [], [state.game, state.selected]);
    const clearSelection = useMemo(() => () => dispatch({ type: "clear" }), []);
    return {
        pieces, legalMoves, selectedSquare: state.selected, history: state.history,
        lastMove: state.history.at(-1), activeColor: (state.game.turn === "w" ? "white" : "black") as PieceColor,
        handleSquareSelect: (square: SquareId) => dispatch({ type: "select", square }),
        clearSelection, resetMoves: () => dispatch({ type: "reset" }),
    };
}
