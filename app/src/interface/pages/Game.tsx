import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chooseMove, type Difficulty } from "../../ai";
import { getGameStatus } from "../../engine";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { GameResultModal } from "../components/GameResultModal";
import { type GameResult, resultTitles } from "../types/gameResult";
import { Board } from "../components/Board_Components/Board";
import { MoveHistoryPanel } from "../components/Board_Components/MoveHistoryPanel";
import { StatusPanel } from "../components/Board_Components/StatusPanel";
import { useBoardArrows } from "../hooks/useBoardArrows";
import { useGameMoves } from "../hooks/useGameMoves";
import { botOpponent, currentUser } from "../types/player";
import { useChessClock } from "../hooks/useChessClock";
import type { PieceColor } from "../types/pieces";
import { useAuth } from "../stores/AuthContext";
import { useSaveMatch } from "../hooks/useSaveMatch";
import type { EndReason, MatchRecord } from "../types/matchHistory";
import { MatchSaveNotice } from "../components/MatchSaveNotice";
import { GameSetupForm } from "../components/GameSetupForm";
import { gameModeLabels, type GameSetup } from "../types/gameSetup";
import { difficultyLabels } from "../types/matchHistory";

const AI_RESPONSE_DELAY_MS: Record<Difficulty, number> = {
	easy: 1_500,
	medium: 2_500,
	hard: 3_500,
};


export function Game() {
    const [setup, setSetup] = useState<GameSetup | null>(null);
    return setup ? <GameSession setup={setup} onNewGame={() => setSetup(null)} /> : <GameSetupForm onStart={setSetup} />;
}

function GameSession({ setup, onNewGame }: { setup: GameSetup; onNewGame: () => void }) {
	const { user } = useAuth();
	const player = user ? { ...currentUser, id: user.uid, name: user.displayName, avatarUrl: user.photoURL ?? "" } : currentUser;
	
	const { game, pieces, legalMoves, lastMove, history, activeColor, selectedSquare, pendingPromotion, choosePromotion, handleSquareSelect, clearSelection, playAIMove } = useGameMoves();
	const gameStatus = useMemo(() => getGameStatus(game), [game]);
	const localGame = setup.mode === "human-human";
	const canPlay = localGame || (setup.mode === "human-ai" && activeColor === currentUser.color);
	const aiTurn = setup.mode === "ai-ai" || (setup.mode === "human-ai" && activeColor !== currentUser.color);
	const opponent = localGame ? { ...botOpponent, id: "local-black", name: "Pessoa 2 (pretas)", isBot: false, rating: undefined } : setup.mode === "ai-ai" ? { ...botOpponent, name: "IA (pretas)" } : botOpponent;
	const topCapturedPieces = history.filter((move) => move.color === opponent.color && move.capturedPiece).map((move) => move.capturedPiece!);
	const bottomColor = setup.mode === "ai-ai" ? "white" : player.color;
	const bottomCapturedPieces = history.filter((move) => move.color === bottomColor && move.capturedPiece).map((move) => move.capturedPiece!);
	const [confirmResignation, setConfirmResignation] = useState(false);
	const [result, setResult] = useState<GameResult | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const clockResetKey = 0;
	const [gameId] = useState(() => crypto.randomUUID());
	const [completedMatch, setCompletedMatch] = useState<MatchRecord | null>(null);
	const finished = useRef(false);
	const { status: saveStatus, retry: retrySave } = useSaveMatch(completedMatch);
	const saving = saveStatus === "saving";

	const {
		arrows,
		highlightedSquares,
		handleSquareContextMouseDown,
		handleSquareContextMouseUp,
		clearAnnotations,
	} = useBoardArrows();


	const running = (canPlay || aiTurn) && !isPaused && result === null;
	const finishGame = useCallback((nextResult: GameResult, reasonCode: EndReason) => {
		if (finished.current) return;
		finished.current = true;
		clearSelection();
		clearAnnotations();
		setConfirmResignation(false);
		setIsPaused(false);
		setResult(nextResult);
		setShowResult(true);
		if (user && setup.mode === "human-ai") setCompletedMatch({
			id: gameId, ownerUid: user.uid, endedAt: Date.now(), ...nextResult,
			reasonCode, difficulty: setup.difficulty, opponent: botOpponent.name,
		});
	}, [clearSelection, clearAnnotations, user, gameId, setup]);
	useEffect(() => {
		if (gameStatus === "checkmate") {
			const winner = activeColor === "white" ? "black" : "white";
			finishGame({
				outcome: winner === currentUser.color ? "victory" : "defeat",
				reason: `Xeque-mate. Vitória das ${winner === "white" ? "brancas" : "pretas"}.`,
			}, "checkmate");
		} else if (gameStatus === "fifty-moves") {
			finishGame({ outcome: "draw", reason: "Empate pela regra dos 50 lances." }, "draw");
		} else if (gameStatus === "stalemate") {
			finishGame({ outcome: "draw", reason: "Empate por afogamento." }, "draw");
		} else if (gameStatus === "insufficient-material") {
			finishGame({ outcome: "draw", reason: "Empate por falta de peças." }, "draw");
		}
	}, [gameStatus, activeColor, finishGame]);
	useEffect(() => {
		if (!aiTurn || isPaused || result || pendingPromotion || finished.current
			|| gameStatus === "checkmate" || gameStatus === "stalemate" || gameStatus === "fifty-moves"
			|| gameStatus === "insufficient-material") return;
		const timer = window.setTimeout(() => {
			const move = chooseMove(game, setup.difficulty);
			if (move) {
				const piece = game.board[move.from[0]][move.from[1]];
				const promotes = piece?.type === "p" && (move.to[0] === 0 || move.to[0] === 7);
				playAIMove(move, promotes ? "q" : undefined);
			}
		}, AI_RESPONSE_DELAY_MS[setup.difficulty]);
		return () => window.clearTimeout(timer);
	}, [aiTurn, game, gameStatus, isPaused, pendingPromotion, playAIMove, result, setup.difficulty]);
	const handleTimeout = useCallback((color: PieceColor) => {
		const winner = color === "white" ? "black" : "white";
		const outcome = winner === currentUser.color ? "victory" : "defeat";
		const winnerName = winner === "white" ? "brancas" : "pretas";
		const loserName = color === "white" ? "brancas" : "pretas";
		const reason = setup.mode === "human-human"
			? `O tempo das ${loserName} acabou. Vitória das ${winnerName}.`
			: setup.mode === "ai-ai"
				? `O tempo da IA das ${loserName} acabou. Vitória da IA das ${winnerName}.`
				: color === currentUser.color ? "Seu tempo acabou. Vitória do Bot." : "O tempo do Bot acabou. Você venceu.";
		finishGame({
			outcome,
			reason,
		}, "timeout");
	}, [finishGame, setup.mode]);
	const clockTimes = useChessClock({ activeColor, running, resetKey: clockResetKey, onTimeout: handleTimeout });

	// Clique esquerdo "de verdade" limpa as setas/destaques manuais —
	// mesma convenção do Lichess/chess.com, pra anotação antiga não
	// ficar acumulada por cima do próximo lance.
	function handleSquareLeftClick(square: Parameters<typeof handleSquareSelect>[0]) {
		if (finished.current || result || isPaused || !canPlay) return;
		clearAnnotations();
		handleSquareSelect(square);
	}

	function resign() {
		finishGame({ outcome: localGame && activeColor === "black" ? "victory" : "defeat", reason: localGame ? activeColor === "white" ? "As brancas desistiram. Vitória das pretas." : "As pretas desistiram. Vitória das brancas." : "Você desistiu da partida. Vitória do Bot." }, "resignation");
	}

	function restart() {
		if (!saving) onNewGame();
	}
	
	return (
		
		<div className="flex h-full flex-1 flex-col items-center justify-center px-6 py-6">
			
			{/* "grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[4fr_1fr]" */}
			<div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[2fr_1fr]">
				
				<Board 
					topPlayer={opponent}
					bottomPlayer={setup.mode === "ai-ai" ? { ...botOpponent, id: "white-ai", name: "IA (brancas)", color: "white" } : player}
					topCapturedPieces={topCapturedPieces}
					bottomCapturedPieces={bottomCapturedPieces}
					promotionSquare={pendingPromotion}
					onPromotionSelect={choosePromotion}
					pieces={pieces}
					legalMoves={legalMoves}
					lastMove={lastMove}
					disabled={result !== null || isPaused || !canPlay || pendingPromotion !== undefined}
					clockTimes={clockTimes}
					activeClock={running ? activeColor : undefined}
					selectedSquare={selectedSquare}
					onSquareSelect={handleSquareLeftClick}
					arrows={arrows}
					highlightedSquares={highlightedSquares}
					onSquareContextMouseDown={handleSquareContextMouseDown}
					onSquareContextMouseUp={handleSquareContextMouseUp}
				/>
		
				<aside className="flex flex-col gap-6">
					<p className="text-sm text-text-muted">{gameModeLabels[setup.mode]}{setup.mode !== "human-human" && ` · Dificuldade: ${difficultyLabels[setup.difficulty]}`}</p>
					{result ? (
						<section aria-live="polite" className="rounded-xl border border-border bg-surface p-5">
							<h2 className="font-display text-lg font-semibold">Partida encerrada · {resultTitles[result.outcome]}</h2>
							<p className="mt-3 text-sm text-text-muted">{result.reason}</p>
							{setup.mode !== "human-ai" ? <p className="mt-3 text-sm text-text-muted">Partida local. O resultado não será salvo no perfil.</p> : <MatchSaveNotice status={saveStatus} onRetry={retrySave} />}
							<Button to="/profile" variant="ghost" className="mt-3">Ver meu perfil</Button>
							<Button variant="ghost" className="mt-4" onClick={() => setShowResult(true)}>Ver resultado</Button>
						</section>
					) : isPaused ? (
						<section role="status" className="rounded-xl border border-accent bg-surface p-5">
							<h2 className="font-display text-lg font-semibold text-accent">Partida pausada</h2>
							<p className="mt-3 text-sm text-text-muted">Retome a partida para interagir com o tabuleiro.</p>
						</section>
					) : <StatusPanel activeColor={activeColor} mode={setup.mode} />}
					<MoveHistoryPanel moves={history} />
					{!result && setup.mode !== "ai-ai" && (
						<Button variant="secondary" aria-pressed={isPaused} onClick={() => setIsPaused((paused) => !paused)}>
							{isPaused ? "Retomar partida" : "Pausar partida"}
						</Button>
					)}
					{result ? <Button onClick={restart} disabled={saving}>Nova partida</Button> : setup.mode !== "ai-ai" && (
						<Button variant="secondary" onClick={() => setConfirmResignation(true)}>Desistir da partida</Button>
					)}
				<Button variant="ghost" onClick={restart} disabled={saving}>Configurar nova partida</Button>
				</aside>
			
			</div>
			{confirmResignation && (
				<Modal title="Desistir da partida?" onClose={() => setConfirmResignation(false)}>
					<p className="mt-3 text-text-muted">{localGame ? activeColor === "white" ? "Ao confirmar, as brancas desistem e as pretas vencem." : "Ao confirmar, as pretas desistem e as brancas vencem." : "Ao desistir, você perde a partida. Deseja continuar?"}</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Button variant="secondary" onClick={() => setConfirmResignation(false)} autoFocus>Continuar jogando</Button>
						<Button variant="secondary" className="text-danger" onClick={resign}>Confirmar desistência</Button>
					</div>
				</Modal>
			)}
			{result && showResult && (
				<GameResultModal result={result} onClose={() => setShowResult(false)} onRestart={restart} restartingDisabled={saving}>
					{setup.mode !== "human-ai" ? <p className="mt-3 text-sm text-text-muted">Partida local. O resultado não será salvo no perfil.</p> : <MatchSaveNotice status={saveStatus} onRetry={retrySave} />}
				</GameResultModal>
			)}
		
		</div>
	);
}
