import type { ReactNode } from "react";

interface CardProps {
	children: ReactNode;
	className?: string;
	
	/* Aplica um leve destaque de borda, usado para chamar atenção pontual */
	highlighted?: boolean;
}

// Componente Card reutilizável, com suporte a destaque de borda e classes adicionais por props
export function Card({ children, className = "", highlighted = false }: CardProps) {
	
	return (
		
		<div
			className={`rounded-xl border bg-surface p-6 transition-colors duration-200 ${
				highlighted ? "border-accent" : "border-border"
			} ${className}`}
		>
			
			{children}
		
		</div>
	);
}
