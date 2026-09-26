import { initialBoard } from "../ChessEngine/FEN";
import { Board } from "../components/Board_Components/Board";
import { MoveHistoryPanel } from "../components/Board_Components/MoveHistoryPanel";
import { StatusPanel } from "../components/Board_Components/StatusPanel";
import { useBoardArrows } from "../hooks/useBoardArrows";
import { useSquareSelection } from "../hooks/useSquareSelection";
import { botOpponent, currentUser } from "../types/player";


export function Game() {
	
	const { selectedSquare, handleSquareSelect } = useSquareSelection();

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
		clearAnnotations();
		handleSquareSelect(square);
	}
	
	return (
		
		<div className="flex h-full flex-1 flex-col items-center justify-center px-6 py-6">
			
			{/* "grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[4fr_1fr]" */}
			<div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[2fr_1fr]">
				
				<Board 
					topPlayer={botOpponent}
					bottomPlayer={currentUser} 
					pieces={initialBoard}
					selectedSquare={selectedSquare}
					onSquareSelect={handleSquareLeftClick}
					arrows={arrows}
					highlightedSquares={highlightedSquares}
					onSquareContextMouseDown={handleSquareContextMouseDown}
					onSquareContextMouseUp={handleSquareContextMouseUp}
				/>
		
				<aside className="flex flex-col gap-6">
					<StatusPanel />
					<MoveHistoryPanel />
				</aside>
			
			</div>
		
		</div>
	);
}