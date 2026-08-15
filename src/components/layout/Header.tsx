import { useState } from "react";
import { NavLink } from "react-router-dom";
import { navRoutes } from "../../routes/AppRoutes";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

/*
	Cabeçalho fixo, mobile-friendly e móvel:
	- (position: sticky)
	- Com o título da aplicação
	- Links de navegação
	- Seletor de tema.
*/
export function Header() {
	
	// Variável de Estado (useState) para controlar se o menu de navegação mobile está aberto ou fechado.
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	// Função para compactar as classes CSS dos Links de navegação, com estilização condicional se estiver ativo ou não.
	const linkClasses = ({ isActive }: { isActive: boolean }) =>
		`font-body text-sm font-medium tracking-wide transition-colors ${
		isActive ? "text-accent" : "text-text-muted hover:text-text-primary"
		}`;

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
				
				{/* Título da Aplicação, com "logo" e linkagem para a página inicial */}
				<NavLink to="/" className="flex items-center gap-2 font-display text-xl font-semibold text-text-primary">
					<span aria-hidden="true" className="text-2xl text-accent">
						♞
					</span>
					Xadrez
				</NavLink>

				{/* Navegação Principal, utilizando variável 'navRoutes' para dinamizar, definida */}
				<nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
					{navRoutes.map((route) =>
						route.disabled ? (
						<span
							key={route.path}
							className="cursor-not-allowed font-body text-sm font-medium text-text-muted/50"
							title={route.disabledHint}
						>
							{route.label}
						</span>
						) : (
						<NavLink key={route.path} to={route.path} className={linkClasses}>
							{route.label}
						</NavLink>
						)
					)}
				</nav>
				
				{/* Seletor de Tema de cor */}
				<div className="hidden items-center gap-4 md:flex">
					<ThemeSwitcher />
				</div>
				
				{/* Botão do Menu Hambúrguer para telas menores (mobile) */}
				<button
					className="flex items-center justify-center rounded-md border border-border p-2 text-text-primary md:hidden"
					onClick={() => setIsMenuOpen((open) => !open)}
					aria-expanded={isMenuOpen}
					aria-label="Abrir menu de navegação"
				>
					
					<span aria-hidden="true">{isMenuOpen ? "✕" : "☰"}</span>
				
				</button>
			
			</div>
			
			{/* Inclusão condicional do menu de navegação mobile, que só aparece quando 'isMenuOpen' é true. */}
			{isMenuOpen && (
				<nav
					className="flex flex-col gap-4 border-t border-border bg-background px-6 py-4 md:hidden"
					aria-label="Navegação principal (mobile)"
				>
					{navRoutes.map((route) =>
						route.disabled ? (
						<span key={route.path} className="font-body text-sm text-text-muted/50">
							{route.label} — {route.disabledHint}
						</span>
						) : (
						<NavLink
							key={route.path}
							to={route.path}
							className={linkClasses}
							onClick={() => setIsMenuOpen(false)}
						>
							{route.label}
						</NavLink>
						)
					)}
					
					<div className="pt-2">
						<ThemeSwitcher />
					</div>
				
				</nav>
			)}
		</header>
	);
}
