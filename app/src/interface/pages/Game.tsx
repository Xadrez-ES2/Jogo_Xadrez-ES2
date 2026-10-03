import { useCallback, useRef, useState } from "react";
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


export function Game() {
    const [setup, setSetup] = useState<GameSetup | null>(null);
    return setup ? <GameSession setup={setup} onNewGame={() => setSetup(null)} /> : <GameSetupForm onStart={setSetup} />;
}

function GameSession({ setup, onNewGame }: { setup: GameSetup; onNewGame: () => void }) {
	const { user } = useAuth();
	const player = user ? { ...currentUser, id: user.uid, name: user.displayName, avatarUrl: user.photoURL ?? "" } : currentUser;
	
	const { pieces, legalMoves, lastMove, history, activeColor, selectedSquare, handleSquareSelect, clearSelection } = useGameMoves();
	const localGame = setup.mode === "human-human";
	const canPlay = localGame || (setup.mode === "human-ai" && activeColor === currentUser.color);
	const opponent = localGame ? { ...botOpponent, id: "local-black", name: "Pessoa 2 (pretas)", isBot: false, rating: undefined } : setup.mode === "ai-ai" ? { ...botOpponent, name: "IA (pretas)" } : botOpponent;
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


	const running = canPlay && !isPaused && result === null;
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
	const handleTimeout = useCallback((color: PieceColor) => {
		finishGame({
			outcome: color === currentUser.color ? "defeat" : "victory",
			reason: color === currentUser.color ? localGame ? "O tempo das brancas acabou. Vitória das pretas." : "Seu tempo acabou. Vitória do Bot." : localGame ? "O tempo das pretas acabou. Vitória das brancas." : "O tempo do Bot acabou. Você venceu.",
		}, "timeout");
	}, [finishGame, localGame]);
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
					pieces={pieces}
					legalMoves={legalMoves}
					lastMove={lastMove}
					disabled={result !== null || isPaused || !canPlay}
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
					<p className="text-sm text-text-muted">{gameModeLabels[setup.mode]}{setup.mode !== "human-human" && ` · Dificuldade selecionada: ${difficultyLabels[setup.difficulty]} (ainda sem efeito)`}</p>
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
