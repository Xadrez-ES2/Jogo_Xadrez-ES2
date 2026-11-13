import { useCallback, useMemo, useReducer } from "react";
import { applyMove, createGame, getLegalMoves, getPiece, promotePawn, sameSquare } from "../../engine";
import type { GameState, Move as EngineMove, PromotionPieceType, Square } from "../../engine";
import type { PieceColor, PieceType, PlayablePiece } from "../types/pieces";
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
    piece: PieceType;
    capturedPiece?: PieceType;
    promotion?: PromotionPieceType;
    castle?: "kingSide" | "queenSide";
}

export interface AnimatingMove {
    id: string;
    from: SquareId;
    to: SquareId;
    piece: PlayablePiece;
}

interface State {
    game: GameState;
    selected?: SquareId;
    history: PlayedMove[];
    /* Snapshots do estado do jogo — snapshots[0] = início, snapshots[i] = estado após history[i-1]. */
    snapshots: GameState[];
    /* Lance que está em animação de deslocamento neste momento */
    animatingMove?: AnimatingMove | null;
}

type Action =
    | { type: "select"; square: SquareId }
    | { type: "clear" }
    | { type: "reset" }
    | { type: "promote"; piece: PromotionPieceType }
    | { type: "play"; move: EngineMove; promotion?: PromotionPieceType }
    | { type: "undo"; plies: number }
    | { type: "clearAnimation" };

export function createMoveState(): State {
    const initial = createGame();
    return { game: initial, history: [], snapshots: [initial], animatingMove: null };
}

function applyPlayedMove(state: State, move: EngineMove, promotion?: PromotionPieceType): State {
    const from = move.from;
    const to = move.to;
    const fromId = toSquareId(from);
    const toId = toSquareId(to);
    const movingPiece = getPiece(state.game.board, from);
    const capturedPiece = getPiece(state.game.board, to)
        ?? (movingPiece?.type === "p" && from[1] !== to[1]
            && state.game.internal.enPassant !== null
            && sameSquare(state.game.internal.enPassant, to)
            ? { type: "p" as const, color: state.game.turn === "w" ? "b" as const : "w" as const }
            : null);
    let game = applyMove(state.game, move);
    if (promotion) game = promotePawn(game, promotion);

    const playableMovingPiece: PlayablePiece = {
        piece: { type: pieceTypes[movingPiece!.type] },
        color: state.game.turn === "w" ? "white" : "black",
    };

    const moveIndex = state.history.length + 1;

    return {
        game,
        selected: undefined,
        history: [...state.history, {
            from: fromId,
            to: toId,
            color: state.game.turn === "w" ? "white" : "black",
            capture: capturedPiece !== null,
            piece: pieceTypes[movingPiece!.type],
            capturedPiece: capturedPiece ? pieceTypes[capturedPiece.type] : undefined,
            promotion,
            castle: movingPiece!.type === "k" && Math.abs(to[1] - from[1]) === 2
                ? (to[1] > from[1] ? "kingSide" : "queenSide")
                : undefined,
        }],
        snapshots: [...state.snapshots, game],
        animatingMove: {
            id: `${fromId}-${toId}-${moveIndex}`,
            from: fromId,
            to: toId,
            piece: playableMovingPiece,
        },
    };
}

export function gameMovesReducer(state: State, action: Action): State {
    if (action.type === "clearAnimation") return { ...state, animatingMove: null };
    if (action.type === "reset") return createMoveState();
    if (action.type === "clear") return { ...state, selected: undefined };
    if (action.type === "play") return applyPlayedMove(state, action.move, action.promotion);
    if (action.type === "promote") {
        if (!state.game.pendingPromotion) return state;
        const promotedGame = promotePawn(state.game, action.piece);
        return {
            ...state,
            game: promotedGame,
            history: state.history.map((move, index) => index === state.history.length - 1
                ? { ...move, promotion: action.piece }
                : move),
            snapshots: [...state.snapshots.slice(0, -1), promotedGame],
            animatingMove: null,
        };
    }
    if (action.type === "undo") {
        const plies = Math.max(1, action.plies);
        // snapshots[0] = estado inicial (antes do primeiro lance)
        // snapshots[i] = estado após history[i-1]
        // Para voltar `plies` lances: alvo = snapshots.length - 1 - plies
        const targetIdx = Math.max(0, state.snapshots.length - 1 - plies);
        return {
            game: state.snapshots[targetIdx],
            selected: undefined,
            history: state.history.slice(0, targetIdx),
            snapshots: state.snapshots.slice(0, targetIdx + 1),
            animatingMove: null,
        };
    }
    const to = toEngineSquare(action.square);
    if (state.selected) {
        const from = toEngineSquare(state.selected);
        const move = getLegalMoves(state.game).find((candidate) => sameSquare(candidate.from, from) && sameSquare(candidate.to, to));
        if (move) {
            return applyPlayedMove(state, move);
        }
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
    const playAIMove = useCallback((move: EngineMove, promotion?: PromotionPieceType) => {
        dispatch({ type: "play", move, promotion });
    }, []);
    const undo = useCallback((plies: number) => {
        dispatch({ type: "undo", plies });
    }, []);
    const clearAnimation = useCallback(() => {
        dispatch({ type: "clearAnimation" });
    }, []);

    return {
        game: state.game, pieces, legalMoves, selectedSquare: state.selected, history: state.history,
        snapshots: state.snapshots,
        animatingMove: state.animatingMove ?? undefined,
        clearAnimation,
        pendingPromotion: state.game.pendingPromotion ? toSquareId(state.game.pendingPromotion) : undefined,
        lastMove: state.history.at(-1), activeColor: (state.game.turn === "w" ? "white" : "black") as PieceColor,
        handleSquareSelect: (square: SquareId) => dispatch({ type: "select", square }),
        choosePromotion: (piece: PromotionPieceType) => dispatch({ type: "promote", piece }),
        clearSelection, playAIMove, resetMoves: () => dispatch({ type: "reset" }), undo,
    };
}
