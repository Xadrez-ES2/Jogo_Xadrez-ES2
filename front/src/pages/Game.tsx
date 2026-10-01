import { useState } from "react";
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


export function Game() {
	
	const { selectedSquare, handleSquareSelect, clearSelection } = useSquareSelection();
	const [confirmResignation, setConfirmResignation] = useState(false);
	const [result, setResult] = useState<GameResult | null>(null);
	const [showResult, setShowResult] = useState(false);
	const [isPaused, setIsPaused] = useState(false);

	const {
		arrows,
		highlightedSquares,
		handleSquareContextMouseDown,
		handleSquareContextMouseUp,
		clearAnnotations,
	} = useBoardArrows();

	// Clique esquerdo "de verdade" limpa as setas/destaques manuais —
	// mesma convenção do Lichess/chess.com, pra anotação antiga não
	// ficar acumulada por cima do próximo lance.
	function handleSquareLeftClick(square: Parameters<typeof handleSquareSelect>[0]) {
		if (result || isPaused) return;
		clearAnnotations();
		handleSquareSelect(square);
	}

	function resign() {
		clearSelection();
		clearAnnotations();
		setConfirmResignation(false);
		setIsPaused(false);
		setResult({ outcome: "defeat", reason: "Você desistiu da partida. Vitória do Bot." });
		setShowResult(true);
	}

	function restart() {
		clearSelection();
		clearAnnotations();
		setResult(null);
		setShowResult(false);
		setIsPaused(false);
	}
	
	return (
		
		<div className="flex h-full flex-1 flex-col items-center justify-center px-6 py-6">
			
			{/* "grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[4fr_1fr]" */}
			<div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[2fr_1fr]">
				
				<Board 
					topPlayer={botOpponent}
					bottomPlayer={currentUser} 
					pieces={initialBoard}
					disabled={result !== null || isPaused}
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
					{result ? <Button onClick={restart}>Nova partida</Button> : (
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
				<GameResultModal result={result} onClose={() => setShowResult(false)} onRestart={restart} />
			)}
		
		</div>
	);
}
