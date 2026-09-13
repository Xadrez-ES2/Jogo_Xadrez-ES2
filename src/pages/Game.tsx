import { Board } from "../components/Board";
import { MoveHistoryPanel } from "../components/MoveHistoryPanel";
import { StatusPanel } from "../components/StatusPanel";
import { botOpponent, currentUser } from "../types/player";



{/* <div className="mb-8">
				<span className="coord-rule text-xs">partida</span>
				<h1 className="mt-2 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
				Mesa de jogo
				</h1>
			</div> */}

export function Game() {
	return (
		
		<div className="flex h-full flex-1 flex-col items-center justify-center px-6 py-6">
			
			{/* "grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[4fr_1fr]" */}
			<div className="grid w-full max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-[2fr_1fr]">
				
				<Board topPlayer={botOpponent} bottomPlayer={currentUser} />
		
				<aside className="flex flex-col gap-6">
					<StatusPanel />
					<MoveHistoryPanel />
				</aside>
			
			</div>
		
		</div>
	);
}