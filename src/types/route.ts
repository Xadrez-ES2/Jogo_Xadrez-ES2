import type { ComponentType } from "react";

/*
	Descreve uma rota de navegação da aplicação.
	Usado tanto pelo AppRoutes (React Router) quanto pelo
	Header/Home para gerar os links/botões de navegação
	a partir de uma única fonte de verdade.
 */
export interface RouteConfig {
	path: string;
	label: string;
	
	/* Componente de página renderizado pela rota */
	element: ComponentType;
	
	/* Se true, aparece no menu de navegação principal */
	showInNav: boolean;
	
	/* Se true, o item é exibido mas desabilitado (ex: "Opções") */
	disabled?: boolean;
	
	/* Texto auxiliar exibido quando disabled, ex: "Em breve" */
	disabledHint?: string;
}
