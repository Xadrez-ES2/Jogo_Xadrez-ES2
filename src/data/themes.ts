import type { Theme } from "../types/theme";

/*
	Catálogo central de temas 
	
	Para adicionar uma nova paleta:
	- Acrescentar um novo objeto 'Theme' aqui
	- Incluir o 'id' no union type 'ThemeId' (src/types/theme.ts).

	O ThemeSwitcher e o ThemeProvider já leem esta lista dinamicamente.
*/
export const themes: Theme[] = [
	{
		id: "midnight",
		label: "Midnight (padrão)",
		description: "Azul-marinho profundo com destaques em azul-claro.",
		palette: {
			background: "#0f172a",
			surface: "#16213a",
			surfaceAlt: "#1c2b4a",
			primary: "#1d4ed8",
			primaryHover: "#2563eb",
			accent: "#38bdf8",
			textPrimary: "#f1f5f9",
			textMuted: "#94a3b8",
			border: "#27354f",
			boardLight: "#233252",
			boardDark: "#182238",
			success: "#34d399",
			danger: "#f87171",
		},
	},
	{
		id: "classicWood",
		label: "Clássico (Verde/Madeira)",
		description: "Inspirado nos tabuleiros de clube tradicionais.",
		palette: {
			background: "#1c1712",
			surface: "#2a2119",
			surfaceAlt: "#332821",
			primary: "#4d7c53",
			primaryHover: "#5c9165",
			accent: "#d9a441",
			textPrimary: "#f3ece1",
			textMuted: "#b9a98f",
			border: "#3d3126",
			boardLight: "#ebd3a0",
			boardDark: "#6b4a2f",
			success: "#7fb069",
			danger: "#c0524a",
		},
	},
	{
		id: "light",
		label: "Claro (Light)",
		description: "Fundo claro para ambientes com bastante luz.",
		palette: {
			background: "#f8fafc",
			surface: "#ffffff",
			surfaceAlt: "#eef2f7",
			primary: "#1d4ed8",
			primaryHover: "#1e40af",
			accent: "#0284c7",
			textPrimary: "#0f172a",
			textMuted: "#5b6b82",
			border: "#dbe3ee",
			boardLight: "#f0f4f9",
			boardDark: "#c9d4e3",
			success: "#059669",
			danger: "#dc2626",
		},
	},
];

// Tema padrão sendo o primeiro da lista (Midnight)
export const defaultThemeId = themes[0].id;
