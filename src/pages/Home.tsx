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
				
					<h1 className=" font-display text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl md:text-7xl">
						
						Jogo de Xadrez Web
						
						<br />
						<span className="text-accent">Engenharia de Software II</span>
					
					</h1>

					<div className="mt-10 flex flex-col gap-4 sm:flex-row">
						<Button to="/game" variant="primary" className="sm:w-56">
							Jogar agora
						</Button>
						
						<Button to="/project" variant="secondary" className="sm:w-56">
							Ver o projeto
						</Button>
					</div>
				
				</div>
			
			</section>

			{/* Grid de Navegação */}
			<section className="mx-auto max-w-6xl px-6 py-20">

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					
					<Button to="/game" variant="primary">
						♟ Jogar
					</Button>
					
					<Button to="/register" variant="secondary">
						👤+ Criar Conta
					</Button>

					<Button to="/login" variant="secondary">
						🔑 Login
					</Button>

					<Button to="/project" variant="secondary">
						📘 Sobre o Projeto
					</Button>
				
				</div>
			
			</section>

		</div>
	);
}
