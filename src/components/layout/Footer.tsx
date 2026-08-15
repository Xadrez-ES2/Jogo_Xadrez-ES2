
// A mudar
export function Footer() {
	
	return (
		
		<footer className="border-t border-border bg-background">
			
			<div className="mx-auto max-w-6xl px-6 py-10">
				
				<div className="mt-6 flex flex-col items-center justify-between gap-4 pt-6 sm:flex-row">
					
					<p className="font-body text-sm text-text-muted">
						Projeto acadêmico de Xadrez — construído com React, TypeScript e Tailwind CSS.
					</p>
					
					<p className="font-mono text-xs text-text-muted">
						© {new Date().getFullYear()} · Equipe de Xadrez · Todos os direitos reservados. 
					</p>
				
				</div>
			
			</div>
		
		</footer>
	);
}
