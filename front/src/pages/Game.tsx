import { useCallback, useRef, useState } from "react";
import { initialBoard } from "../ChessEngine/FEN";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { GameResultModal } from "../components/GameResultModal";
import { type GameResult, resultTitles } from "../types/gameResult";
import { Board } from "../components/Board_Components/Board";
import { MoveHistoryPanel } from "../components/Board_Components/MoveHistoryPanel";
import { StatusPanel } from "../components/Board_Components/StatusPanel";
import { useBoardArrows } from "../hooks/useBoardArrows";
import { useSquareSelection } from "../hooks/useSquareSelection";
import { botOpponent, currentUser } from "../types/player";
import { useChessClock } from "../hooks/useChessClock";
import type { PieceColor } from "../types/pieces";
import { useAuth } from "../stores/AuthContext";
import { useSaveMatch } from "../hooks/useSaveMatch";
import type { EndReason, MatchRecord } from "../types/matchHistory";
import { MatchSaveNotice } from "../components/MatchSaveNotice";


export function Game() {
	const { user } = useAuth();
	const player = user ? { ...currentUser, id: user.uid, name: user.displayName, avatarUrl: user.photoURL ?? "" } : currentUser;
	
	const { selectedSquare, handleSquareSelect, clearSelection } = useSquareSelection();
	const [confirmResignation, setConfirmResignation] = useState(false);
	const [result, setResult] = useState<GameResult | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [isPaused, setIsPaused] = useState(false);
	const [clockResetKey, setClockResetKey] = useState(0);
	const [gameId, setGameId] = useState(() => crypto.randomUUID());
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

	// Até integrar o controle de turnos, somente as brancas têm o relógio ativo.
	const activeColor: PieceColor = "white";
	const running = !isPaused && result === null;
	const finishGame = useCallback((nextResult: GameResult, reasonCode: EndReason) => {
		if (finished.current) return;
		finished.current = true;
		clearSelection();
		clearAnnotations();
		setConfirmResignation(false);
		setIsPaused(false);
		setResult(nextResult);
		setShowResult(true);
		if (user) setCompletedMatch({
			id: gameId, ownerUid: user.uid, endedAt: Date.now(), ...nextResult,
			reasonCode, difficulty: "not-set", opponent: botOpponent.name,
		});
	}, [clearSelection, clearAnnotations, user, gameId]);
	const handleTimeout = useCallback((color: PieceColor) => {
		finishGame({
			outcome: color === currentUser.color ? "defeat" : "victory",
			reason: color === currentUser.color ? "Seu tempo acabou. Vitória do Bot." : "O tempo do Bot acabou. Você venceu.",
		}, "timeout");
	}, [finishGame]);
	const clockTimes = useChessClock({ activeColor, running, resetKey: clockResetKey, onTimeout: handleTimeout });

	// Clique esquerdo "de verdade" limpa as setas/destaques manuais —
	// mesma convenção do Lichess/chess.com, pra anotação antiga não
	// ficar acumulada por cima do próximo lance.
	function handleSquareLeftClick(square: Parameters<typeof handleSquareSelect>[0]) {
		if (result || isPaused) return;
		clearAnnotations();
		handleSquareSelect(square);
	}

	function resign() {
		finishGame({ outcome: "defeat", reason: "Você desistiu da partida. Vitória do Bot." }, "resignation");
	}

	function restart() {
		if (saving) return;
		finished.current = false;
		setCompletedMatch(null);
		setGameId(crypto.randomUUID());
		clearSelection();
		clearAnnotations();
		setResult(null);
		setShowResult(false);
		setIsPaused(false);
		setClockResetKey((key) => key + 1);
	}
	
	return (
		
		<div className="flex h-full flex-1 flex-col items-center justify-center px-6 py-6">
			
			{/* "grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[4fr_1fr]" */}
			<div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[2fr_1fr]">
				
				<Board 
					topPlayer={botOpponent}
					bottomPlayer={player}
					pieces={initialBoard}
					disabled={result !== null || isPaused}
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
					{result ? (
						<section aria-live="polite" className="rounded-xl border border-border bg-surface p-5">
							<h2 className="font-display text-lg font-semibold">Partida encerrada · {resultTitles[result.outcome]}</h2>
							<p className="mt-3 text-sm text-text-muted">{result.reason}</p>
							<MatchSaveNotice status={saveStatus} onRetry={retrySave} />
							<Button to="/profile" variant="ghost" className="mt-3">Ver meu perfil</Button>
							<Button variant="ghost" className="mt-4" onClick={() => setShowResult(true)}>Ver resultado</Button>
						</section>
					) : isPaused ? (
						<section role="status" className="rounded-xl border border-accent bg-surface p-5">
							<h2 className="font-display text-lg font-semibold text-accent">Partida pausada</h2>
							<p className="mt-3 text-sm text-text-muted">Retome a partida para interagir com o tabuleiro.</p>
						</section>
					) : <StatusPanel />}
					<MoveHistoryPanel />
					{!result && (
						<Button variant="secondary" aria-pressed={isPaused} onClick={() => setIsPaused((paused) => !paused)}>
							{isPaused ? "Retomar partida" : "Pausar partida"}
						</Button>
					)}
					{result ? <Button onClick={restart} disabled={saving}>Nova partida</Button> : (
						<Button variant="secondary" onClick={() => setConfirmResignation(true)}>Desistir da partida</Button>
					)}
				</aside>
			
			</div>
			{confirmResignation && (
				<Modal title="Desistir da partida?" onClose={() => setConfirmResignation(false)}>
					<p className="mt-3 text-text-muted">Ao desistir, você perde a partida. Deseja continuar?</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Button variant="secondary" onClick={() => setConfirmResignation(false)} autoFocus>Continuar jogando</Button>
						<Button variant="secondary" className="text-danger" onClick={resign}>Confirmar desistência</Button>
					</div>
				</Modal>
			)}
			{result && showResult && (
				<GameResultModal result={result} onClose={() => setShowResult(false)} onRestart={restart} restartingDisabled={saving}>
					<MatchSaveNotice status={saveStatus} onRetry={retrySave} />
				</GameResultModal>
			)}
		
		</div>
	);
}
