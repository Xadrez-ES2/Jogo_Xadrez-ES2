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
						
						Jogo de Xadrez Web
						
						<br />
						<span className="text-accent">Com Gestão de Projeto aplicada</span>
					
					</h1>

					<p className="mt-6 max-w-xl font-body text-lg text-text-muted">
						Uma Aplicação Web de um Jogo de Xadrez sem bibliotecas de regras prontas,
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

			{/* Grid de Navegação */}
			<section className="mx-auto max-w-6xl px-6 py-20">
				
				<div className="mb-12 flex items-end justify-between">
					
					<h2 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
						⚙️ Opções da <span className="text-accent">Aplicação</span>
					</h2>
					
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					
					<Button to="/jogo" variant="primary">
						♟ Jogar
					</Button>
					
					<Button to="/equipe" variant="secondary">
						👤+ Criar Conta
					</Button>

					<Button to="/equipe" variant="secondary">
						🔑 Login
					</Button>

					<Button to="/projeto" variant="secondary">
						📘 Sobre o Projeto
					</Button>
				
				</div>
			
			</section>

		</div>
	);
}
