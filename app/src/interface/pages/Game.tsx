import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chooseMove } from "../../ai";
import { getGameStatus, getLegalMoves } from "../../engine";
import { aiThinkTime } from "../utils/aiDelay";
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
import { INITIAL_TIME_MS, useChessClock } from "../hooks/useChessClock";
import type { PieceColor } from "../types/pieces";
import { useAuth } from "../stores/AuthContext";
import { useSaveMatch } from "../hooks/useSaveMatch";
import type { EndReason, MatchRecord } from "../types/matchHistory";
import { MatchSaveNotice } from "../components/MatchSaveNotice";
import { GameSetupForm } from "../components/GameSetupForm";
import { gameModeLabels, type GameSetup } from "../types/gameSetup";
import { difficultyLabels } from "../types/matchHistory";
import { useSoundEffects } from "../hooks/useSoundEffects";
import { useHistoryNavigation } from "../hooks/useHistoryNavigation";
import { SoundToggleButton } from "../components/ui/SoundToggleButton";

// Componente principal da página de jogo. Gerencia o estado da partida.
export function Game() {
    const [setup, setSetup] = useState<GameSetup | null>(null);
    return setup ? <GameSession setup={setup} onNewGame={() => setSetup(null)} /> : <GameSetupForm onStart={setSetup} />;
}

// Componente que gerencia a sessão de jogo em andamento, incluindo lógica do jogo, animações, histórico e interface do usuário.
function GameSession({ setup, onNewGame }: { setup: GameSetup; onNewGame: () => void }) {
	// ── Autenticação ──
	const { user } = useAuth();
	const player = user ? { ...currentUser, id: user.uid, name: user.displayName, avatarUrl: user.photoURL ?? "" } : currentUser;

	// ── Lógica do Jogo ──
	const {
		game,
		pieces,
		legalMoves,
		lastMove,
		history,
		snapshots,
		activeColor,
		selectedSquare,
		pendingPromotion,
		choosePromotion,
		handleSquareSelect,
		clearSelection,
		playAIMove,
		undo,
		animatingMove,
		clearAnimation,
	} = useGameMoves();

	const gameStatus = useMemo(() => getGameStatus(game), [game]);

	const localGame = setup.mode === "human-human";

	const canPlay = localGame || (setup.mode === "human-ai" && activeColor === currentUser.color);

	// ── Turno da I.A. ──
	const aiTurn = setup.mode === "ai-ai" || (setup.mode === "human-ai" && activeColor !== currentUser.color);

	// ── Definição do Oponente ──
	const opponent = localGame ? { ...botOpponent, id: "local-black", name: "Pessoa 2 (pretas)", isBot: false, rating: undefined } : setup.mode === "ai-ai" ? { ...botOpponent, name: "IA (pretas)" } : botOpponent;

	// ── Peças capturadas (Player de cima e de abaixo) ──
	const topCapturedPieces = history.filter((move) => move.color === opponent.color && move.capturedPiece).map((move) => move.capturedPiece!);

	const bottomColor = setup.mode === "ai-ai" ? "white" : player.color;

	const bottomCapturedPieces = history.filter((move) => move.color === bottomColor && move.capturedPiece).map((move) => move.capturedPiece!);

	// ── Variáveis de Estado ──
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

	// ── Efeitos Sonoros ──
	const { play: playSound, toggleMute, isMuted } = useSoundEffects();

	// Dispara o som do último lance sempre que o histórico cresce
	const prevHistoryLen = useRef(0);
	useEffect(() => {
		if (history.length <= prevHistoryLen.current) {
			prevHistoryLen.current = history.length;
			return;
		}
		prevHistoryLen.current = history.length;
		const move = history.at(-1);
		if (!move) return;

		if (gameStatus === "checkmate" || gameStatus === "stalemate" ||
		    gameStatus === "fifty-moves" || gameStatus === "insufficient-material") {
			playSound("gameOver");
		} else if (move.castle) {
			playSound("castle");
		} else if (move.capture) {
			playSound("capture");
		} else if (gameStatus === "check") {
			playSound("check");
		} else {
			playSound("move");
		}
	}, [history.length, gameStatus, history, playSound]);

	// ── Navegação pelo histórico ──
	const historyNav = useHistoryNavigation(snapshots, history);
	const { returnToLive } = historyNav;

	// Reseta a navegação quando o histórico muda (novo lance ou undo)
	const prevSnapshotsLen = useRef(snapshots.length);
	useEffect(() => {
		if (snapshots.length !== prevSnapshotsLen.current) {
			prevSnapshotsLen.current = snapshots.length;
			// Se estava visualizando o histórico e um novo lance foi feito (não undo),
			// retorna automaticamente ao modo ao vivo
			if (snapshots.length > prevSnapshotsLen.current) {
				returnToLive();
			}
		}
	}, [snapshots.length, returnToLive]);

	// Navegação por teclado (setas) pelo histórico de jogadas
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			// Não intercepta se o foco estiver em campos de entrada/formulário
			const target = event.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.tagName === "SELECT" ||
					target.isContentEditable)
			) {
				return;
			}

			// Não intercepta se modais estiverem abertos
			if (confirmResignation || showResult) {
				return;
			}

			// Não navega se ainda não houver lances jogados
			if (history.length === 0) return;

			if (event.key === "ArrowLeft") {
				event.preventDefault();
				historyNav.goBack();
			} else if (event.key === "ArrowRight") {
				event.preventDefault();
				historyNav.goForward();
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				historyNav.goToStart();
			} else if (event.key === "ArrowDown") {
				event.preventDefault();
				historyNav.goToEnd();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [confirmResignation, showResult, history.length, historyNav]);

	// Peças e lastMove efetivos (do ponto visualizado ou ao vivo)
	const effectivePieces = historyNav.isViewingHistory && historyNav.viewPieces
		? historyNav.viewPieces
		: pieces;
	const effectiveLastMove = historyNav.isViewingHistory
		? historyNav.viewLastMove
		: lastMove;

	// ── Versão de undo (para evitar que a IA jogue no estado revertido) ───────
	const undoVersion = useRef(0);

	function handleUndo() {
		if (historyNav.isViewingHistory) {
			historyNav.returnToLive();
		}
		undoVersion.current += 1;
		// Contra IA: volta 2 meio-lances (lance da IA + do jogador)
		// Exceto se a partida acabou no lance do humano (última cor = currentUser.color)
		if (setup.mode === "human-ai") {
			const lastPlayedColor = history.at(-1)?.color;
			const plies = lastPlayedColor !== currentUser.color ? 2 : 1;
			undo(plies);
		} else {
			undo(1);
		}
		clearAnimation();
	}

	const canUndo = history.length > 0 && result === null && !isPaused;

	const {
		arrows,
		highlightedSquares,
		handleSquareContextMouseDown,
		handleSquareContextMouseUp,
		clearAnnotations,
	} = useBoardArrows();

	const hasClock = setup.timeLimitMs !== null;
	const running = (canPlay || aiTurn) && !isPaused && result === null && hasClock;

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
		const thinkTime = aiThinkTime(setup.difficulty, history.length, getLegalMoves(game).length);
		let playTimer = 0;
		const capturedVersion = undoVersion.current;
		// Espera um pouco para a tela mostrar o ultimo lance, calcula o lance da IA
		// e so joga quando completar o tempo sorteado (o calculo conta como tempo pensando)
		const timer = window.setTimeout(() => {
			const start = performance.now();
			const move = chooseMove(game, setup.difficulty);
			if (!move) return;
			const piece = game.board[move.from[0]][move.from[1]];
			const promotes = piece?.type === "p" && (move.to[0] === 0 || move.to[0] === 7);
			const remaining = Math.max(0, thinkTime - (performance.now() - start));
			playTimer = window.setTimeout(() => {
				// Se houve undo desde que começamos a calcular, descarta o resultado
				if (undoVersion.current !== capturedVersion) return;
				playAIMove(move, promotes ? "q" : undefined);
			}, remaining);
		}, 50);
		return () => {
			window.clearTimeout(timer);
			window.clearTimeout(playTimer);
		};
	}, [aiTurn, game, gameStatus, history.length, isPaused, pendingPromotion, playAIMove, result, setup.difficulty]);

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

	const clockTimes = useChessClock({
		activeColor,
		running,
		resetKey: clockResetKey,
		onTimeout: handleTimeout,
		initialTimeMs: setup.timeLimitMs === null ? null : (setup.timeLimitMs ?? INITIAL_TIME_MS),
	});

	// Clique esquerdo "de verdade" limpa as setas/destaques manuais
	function handleSquareLeftClick(square: Parameters<typeof handleSquareSelect>[0]) {
		if (finished.current || result || isPaused) return;
		// Se está visualizando o histórico, bloqueia jogadas
		if (historyNav.isViewingHistory) return;
		if (!canPlay) return;
		clearAnnotations();
		handleSquareSelect(square);
	}

	function resign() {
		finishGame({
			outcome: localGame && activeColor === "black" ? "victory" : "defeat",
			reason: localGame
				? activeColor === "white"
					? "As brancas desistiram. Vitória das pretas."
					: "As pretas desistiram. Vitória das brancas."
				: "Você desistiu da partida. Vitória do Bot.",
		}, "resignation");
	}

	function restart() {
		if (!saving) onNewGame();
	}

	// Derivar o estado de xeque para o tabuleiro
	const isInCheck = gameStatus === "check";
	const checkSquare = (() => {
		if (!isInCheck || historyNav.isViewingHistory) return undefined;
		// Encontra o rei da cor em turno no BoardState atual
		for (const [sq, pp] of Object.entries(effectivePieces)) {
			if (pp && pp.piece.type === "king" && pp.color === activeColor) {
				return sq as import("../types/square").SquareId;
			}
		}
		return undefined;
	})();

	const timeLabel = setup.timeLimitMs === null
		? "Sem tempo"
		: `${Math.round((setup.timeLimitMs ?? INITIAL_TIME_MS) / 60000)} min`;

	return (
		<div className="flex min-h-0 flex-1 flex-col items-center justify-start px-6 py-6">
			<div className="grid w-full max-w-6xl grid-cols-1 items-start gap-8 lg:grid-cols-[2fr_1fr]">
				<Board
					topPlayer={opponent}
					bottomPlayer={setup.mode === "ai-ai" ? { ...botOpponent, id: "white-ai", name: "IA (brancas)", color: "white" } : player}
					topCapturedPieces={topCapturedPieces}
					bottomCapturedPieces={bottomCapturedPieces}
					promotionSquare={pendingPromotion}
					onPromotionSelect={choosePromotion}
					pieces={effectivePieces}
					legalMoves={historyNav.isViewingHistory ? [] : legalMoves}
					lastMove={effectiveLastMove}
					checkSquare={checkSquare}
					disabled={result !== null || isPaused || (!canPlay && !historyNav.isViewingHistory) || pendingPromotion !== undefined || historyNav.isViewingHistory}
					clockTimes={clockTimes}
					activeClock={running && hasClock ? activeColor : undefined}
					selectedSquare={historyNav.isViewingHistory ? undefined : selectedSquare}
					onSquareSelect={handleSquareLeftClick}
					arrows={arrows}
					highlightedSquares={highlightedSquares}
					onSquareContextMouseDown={handleSquareContextMouseDown}
					onSquareContextMouseUp={handleSquareContextMouseUp}
					animatingMove={historyNav.isViewingHistory ? undefined : animatingMove}
					onAnimationEnd={clearAnimation}
				/>

				<aside className="flex flex-col gap-5 lg:sticky lg:top-24">
					<div className="flex items-center justify-between shrink-0">
						<p className="text-sm text-text-muted">
							{gameModeLabels[setup.mode]}
							{setup.mode !== "human-human" && ` · Dificuldade: ${difficultyLabels[setup.difficulty]}`}
							{` · ${timeLabel}`}
						</p>
						<SoundToggleButton isMuted={isMuted} onToggle={toggleMute} />
					</div>

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

					<MoveHistoryPanel
						moves={history}
						focusedMoveIndex={historyNav.focusedMoveIndex}
						onMoveClick={(idx) => historyNav.navigateTo(idx + 1)}
						onGoToStart={historyNav.goToStart}
						onGoBack={historyNav.goBack}
						onGoForward={historyNav.goForward}
						onGoToEnd={historyNav.goToEnd}
						onUndo={canUndo ? handleUndo : undefined}
						canUndo={canUndo}
						isViewingHistory={historyNav.isViewingHistory}
						onReturnToLive={historyNav.returnToLive}
						onTogglePause={() => setIsPaused((paused) => !paused)}
						isPaused={isPaused}
						canPause={!result && setup.mode !== "ai-ai"}
						onResign={() => setConfirmResignation(true)}
						canResign={!result && setup.mode !== "ai-ai"}
					/>

					{result && (
						<Button onClick={restart} disabled={saving}>Nova partida</Button>
					)}
					<Button variant="ghost" onClick={restart} disabled={saving}>Configurar nova partida</Button>
				</aside>
			</div>

			{confirmResignation && (
				<Modal title="Desistir da partida?" onClose={() => setConfirmResignation(false)}>
					<p className="mt-3 text-text-muted">{localGame ? activeColor === "white" ? "Ao confirmar, as brancas desistem e as pretas vencem." : "Ao confirmar, as pretas desistem e as brancas vencem." : "Ao desistir, você perde a partida. Deseja continuar?"}</p>
					<div className="mt-6 flex flex-col gap-3 sm:flex-row">
						<Button variant="secondary" onClick={() => setConfirmResignation(false)} autoFocus>Continuar jogando</Button>
						<Button variant="bad" className="text-danger" onClick={resign}>Desistir</Button>
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
