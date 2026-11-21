import { useLocation } from "react-router-dom";
import { Button } from "../components/ui/Button";

/*
	Página exibida para qualquer rota inexistente (rota coringa "*").
	Mantém o cabeçalho e o rodapé do Layout e oferece caminhos de volta.
*/
export function NotFound() {
	const { pathname } = useLocation();

	return (
		<section className="relative overflow-hidden" aria-labelledby="not-found-title">
			{/* Plano de fundo decorativo de tabuleiro, como na página inicial */}
			<div className="absolute inset-0 bg-board-pattern bg-board opacity-[0.06]" aria-hidden="true" />

			<div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center sm:py-32">
				<span aria-hidden="true" className="text-7xl text-accent">♚</span>

				<p className="mt-6 font-mono text-sm uppercase tracking-widest text-text-muted">Erro 404</p>

				<h1 id="not-found-title" className="mt-2 font-display text-4xl font-semibold text-text-primary sm:text-5xl">
					Página não encontrada
				</h1>

				<p className="mt-4 font-body text-text-muted">
					Este lance não é válido: a página{" "}
					<code className="break-all rounded bg-surface-alt px-1.5 py-0.5 font-mono text-sm text-text-primary">{pathname}</code>{" "}
					não existe ou foi movida.
				</p>

				<div className="mt-10 flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
					<Button to="/" className="sm:w-56">Voltar ao início</Button>
					<Button to="/game" variant="secondary" className="sm:w-56">Jogar uma partida</Button>
				</div>
			</div>
		</section>
	);
}
