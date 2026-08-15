import { Button } from "../components/ui/Button";



export function Home() {
	return (
		<div>
			{/* Banner HERO com Título */}
			<section className="relative overflow-hidden border-b border-border">
				
				{/* Plano de fundo decorativo de tabuleiro */}
				<div
					className="absolute inset-0 bg-board-pattern bg-board opacity-[0.06]"
					aria-hidden="true"
				/>
				
				<div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center sm:py-32">
				
					<h1 className="max-w-3xl font-display text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl md:text-7xl">
						Trinta e dois exércitos.
						<br />
						<span className="text-accent">Sessenta e quatro casas.</span>
					</h1>

					<p className="mt-6 max-w-xl font-body text-lg text-text-muted">
						Um jogo de xadrez construído do zero — sem bibliotecas de regras prontas,
						sem APIs externas. Só lógica, tipos e um tabuleiro esperando o primeiro lance.
					</p>

					<div className="mt-10 flex flex-col gap-4 sm:flex-row">
						<Button to="/jogo" variant="primary" className="sm:w-56">
							Jogar agora
						</Button>
						
						<Button to="/projeto" variant="secondary" className="sm:w-56">
							Ver o projeto
						</Button>
					</div>
				
				</div>
			
			</section>

			{/* GRID DE NAVEGAÇÃO */}
			<section className="mx-auto max-w-6xl px-6 py-20">
				
				<div className="mb-12 flex items-end justify-between">
					
					<h2 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
						Comece por aqui
					</h2>
					
					<span className="hidden font-mono text-xs text-text-muted sm:block">
						1 · 2 · 3 · 4
					</span>
				
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					
					<Button to="/jogo" variant="primary">
						♟ Jogar
					</Button>
					
					<Button variant="secondary" disabled disabledHint="Em breve">
						⚙ Opções
					</Button>
					
					<Button to="/projeto" variant="secondary">
						📘 Sobre o Projeto
					</Button>
					
					<Button to="/equipe" variant="secondary">
						♛ Equipe
					</Button>
				
				</div>
			
			</section>

		</div>
	);
}
