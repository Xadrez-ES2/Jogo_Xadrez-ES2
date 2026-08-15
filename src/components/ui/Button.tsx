import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface BaseProps {
	children: ReactNode;
	variant?: ButtonVariant;
	
	/* Texto exibido abaixo/ao lado quando o botão está desabilitado */
	disabledHint?: string;
	className?: string;
}

/* Quando `to` é passado, o botão navega via React Router. Caso contrário, é um <button> comum. */
type ButtonProps = BaseProps &
	ButtonHTMLAttributes<HTMLButtonElement> & {
		to?: string;
	};

// Classes de estilo para cada variante de botão
const variantClasses: Record<ButtonVariant, string> = {
	primary:
		"bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20",
	secondary:
		"bg-surface-alt text-text-primary border border-border hover:border-accent",
	ghost: "bg-transparent text-text-primary border border-border hover:bg-surface-alt",
};

// Componente de botão reutilizável, com diferentes variantes dinâmicas
export function Button({
    children,
    variant = "primary",
    disabledHint,
    className = "",
    to,
    disabled,
    ...rest
}: ButtonProps) {

	// Constante base de classes de estilo para o botão
	const base =
		"group relative inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-4 font-body text-base font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

	// Constante que combina as classes base, as específicas da variante e quaisquer adicionais via props
	const classes = `${base} ${variantClasses[variant]} ${className}`;

	if (disabled) {
		return (
			<div className="w-full">
				
				<button className={classes} disabled aria-disabled="true" {...rest}>
					{children}
				</button>
				
				{disabledHint && (
					<p className="mt-2 text-center font-mono text-xs uppercase tracking-widest text-text-muted">
						{disabledHint}
					</p>
				)}
			
			</div>
		);
	}

	if (to) {
		return (
			<Link to={to} className={classes}>
				{children}
			</Link>
		);
	}

	return (
		<button className={classes} {...rest}>
			{children}
		</button>
	);
}
