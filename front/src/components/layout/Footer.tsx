import { NavLink } from "react-router-dom";
import { navRoutes } from "../../routes/AppRoutes";

/*
	URL do conteúdo embutido no rodapé (Link Google Maps da UFF).
*/
const EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d29402.562121747902!2d-43.1259648!3d-22.9015552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x99817dce2f93eb%3A0x9e97773b91b93bba!2sUniversidade%20Federal%20Fluminense%20-%20Campus%20Praia%20Vermelha!5e0!3m2!1spt-BR!2sbr!4v1789247212526!5m2!1spt-BR!2sbr";


export function Footer() {
	
	return (
		<footer className="border-t border-border bg-background">
			
			<div className="mx-auto max-w-6xl px-6 py-14">
				
				<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr]">
					
					{/* Coluna 1 — Marca e descrição curta */}
					<div className="max-w-xs">
						
						<div className="flex items-center gap-2 font-display text-lg font-semibold text-text-primary">
							<span aria-hidden="true" className="text-xl text-accent">
								♞
							</span>
							Xadrez
						</div>
						
						<p className="mt-3 font-body text-sm text-text-muted">
							Um jogo de xadrez construído do zero — sem bibliotecas de regras prontas
							e sem APIs externas na lógica do jogo. Projeto acadêmico desenvolvido em grupo.
						</p>
					
					</div>

					{/* Coluna 2 — Navegação */}
					<div>
						
						<h3 className="font-mono text-xs font-medium uppercase tracking-widest text-text-muted">
							Navegação
						</h3>
						
						<nav className="mt-4 flex flex-col gap-2.5" aria-label="Links do rodapé">
							{navRoutes.map((route) =>
								<NavLink
									key={route.path}
									to={route.path}
									className="font-body text-sm text-text-muted transition-colors hover:text-accent"
								>
									{route.label}
								</NavLink>
							)}
						</nav>
					
					</div>

					{/* Coluna 3 — Embed/iframe */}
					<div>
						
						<h3 className="font-mono text-xs font-medium uppercase tracking-widest text-text-muted">
							Vindo da Universidade Federal Fluminense (UFF)
						</h3>
						
						<div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface">
							{EMBED_URL ? (
								<iframe
									src={EMBED_URL}
									title="Conteúdo incorporado"
									loading="lazy"
									sandbox="allow-scripts allow-same-origin"
									className="h-40 w-full border-0"
								/>
							) : (
								<div className="flex h-40 w-full items-center justify-center px-4 text-center font-mono text-xs text-text-muted/60">
									embed pendente — defina EMBED_URL
								</div>
							)}
						</div>
					
					</div>
				
				</div>

				{/* Barra inferior */}
				<div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
					<p className="font-body text-sm text-text-muted">
						Projeto Acadêmico de Xadrez
					</p>
					
					<p className="font-mono text-xs text-text-muted">
						© {new Date().getFullYear()} · Grupo 1 — Engenharia de Software II · Universidade Federal Fluminense (UFF)
					</p>
				</div>
			</div>
		
		</footer>
	);
}