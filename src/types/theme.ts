/*
	Sistema de temas do aplicativo.

	Cada tema é um objeto de cores que é injetado no DOM como
	CSS Custom Properties (variáveis CSS) pelo ThemeProvider.
	Isso permite trocar a paleta inteira em tempo de execução
	sem precisar recarregar a página ou duplicar classes Tailwind.
*/

export type ThemeId = "midnight" | "classicWood" | "light";

export interface ThemePalette {
	
	/* Cor de fundo principal da aplicação */
	background: string;
	
	/* Cor de fundo de superfícies elevadas (cards, painéis) */
	surface: string;
	
	/* Cor de fundo de superfícies "flutuantes" (modais, dropdowns) */
	surfaceAlt: string;
	
	/* Cor primária (marca, botões principais) */
	primary: string;
	
	/* Variante mais escura/clara da primária, usada em hover */
	primaryHover: string;
	
	/* Cor de destaque/acento (links, ícones ativos, foco) */
	accent: string;
	
	/* Cor de texto principal */
	textPrimary: string;
	
	/* Cor de texto secundário/esmaecido */
	textMuted: string;
	
	/* Cor de borda padrão */
	border: string;
	
	/* Casas claras do tabuleiro (usadas na textura decorativa) */
	boardLight: string;
	
	/* Casas escuras do tabuleiro (usadas na textura decorativa) */
	boardDark: string;
	
	/* Cor de sucesso/confirmação (ex: xeque-mate a favor) */
	success: string;
	
	/* Cor de alerta/perigo (ex: em xeque) */
	danger: string;
}

export interface Theme {
	
	/* String Identificador do tema */
	id: ThemeId;
	
	/* Nome amigável exibido no seletor de temas */
	label: string;
	
	/* Pequena descrição usada como tooltip/legenda */
	description: string;
	
	/* Paleta de cores do tema */
	palette: ThemePalette;
}

// Interface do Contexto do Tema, usada pelo ThemeProvider e pelo Hook useTheme.
export interface ThemeContextValue {
	theme: Theme;
	themeId: ThemeId;
	availableThemes: Theme[];
	setThemeId: (id: ThemeId) => void;
}
