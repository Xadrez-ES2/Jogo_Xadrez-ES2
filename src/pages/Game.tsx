import { Board } from "../components/Board";
import { botOpponent, currentUser } from "../types/player";


function MoveHistoryPanel() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Histórico de jogadas
      </h2>
      <div className="mt-4 max-h-64 space-y-1 overflow-y-auto font-mono text-sm text-text-muted">
        <p className="text-text-muted/50">Nenhuma jogada realizada ainda.</p>
      </div>
    </div>
  );
}

function TimerPanel() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-text-primary">Tempo</h2>
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-alt px-4 py-3">
          <span className="font-body text-sm text-text-muted">Brancas</span>
          <span className="font-mono text-lg text-text-primary">10:00</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface-alt px-4 py-3">
          <span className="font-body text-sm text-text-muted">Pretas</span>
          <span className="font-mono text-lg text-text-primary">10:00</span>
        </div>
      </div>
    </div>
  );
}

function StatusPanel() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-text-primary">Status</h2>
      <p className="mt-3 font-body text-sm text-text-muted">
        Vez das <span className="font-semibold text-accent">brancas</span>. Nenhum xeque no momento.
      </p>
    </div>
  );
}

export function Game() {
	return (
		<div className="flex flex-1 flex-col items-center px-6 py-6">
			{/* <div className="mb-8">
				<span className="coord-rule text-xs">partida</span>
				<h1 className="mt-2 font-display text-3xl font-semibold text-text-primary sm:text-4xl">
				Mesa de jogo
				</h1>
			</div> */}
																{/* [1fr_320px] */}
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
				<Board topPlayer={botOpponent} bottomPlayer={currentUser} />

				<aside className="flex flex-col gap-6">
					<StatusPanel />
					<TimerPanel />
					<MoveHistoryPanel />
				</aside>
			</div>
		</div>
	);
}