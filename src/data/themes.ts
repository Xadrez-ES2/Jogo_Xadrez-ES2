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
			background: "#eef1f6",
			surface: "#ffffff",
			surfaceAlt: "#dde4ee",
			primary: "#1d4ed8",
			primaryHover: "#1e40af",
			accent: "#0369a1",
			textPrimary: "#0f172a",
			textMuted: "#47566b",
			border: "#c3cede",
			boardLight: "#eef2f8",
			boardDark: "#90a4c2",
			success: "#047857",
			danger: "#b91c1c",
		},
	},
	{
		id: "ocean",
		label: "Ocean (Azul-petróleo)",
		description: "Tons profundos de teal com destaque em ciano vibrante.",
		palette: {
			background: "#0a1e23",
			surface: "#0f2b32",
			surfaceAlt: "#143641",
			primary: "#0e7490",
			primaryHover: "#155e75",
			accent: "#22d3ee",
			textPrimary: "#ecfeff",
			textMuted: "#8fb4b8",
			border: "#1c4550",
			boardLight: "#1a3d45",
			boardDark: "#0c2229",
			success: "#34d399",
			danger: "#f87171",
		},
	},
	{
		id: "highContrast",
		label: "Alto Contraste",
		description: "Preto e branco puros com acento em amarelo, para máxima legibilidade.",
		palette: {
			background: "#000000",
			surface: "#111111",
			surfaceAlt: "#1f1f1f",
			primary: "#facc15",
			primaryHover: "#eab308",
			accent: "#fde047",
			textPrimary: "#ffffff",
			textMuted: "#d4d4d4",
			border: "#525252",
			boardLight: "#e5e5e5",
			boardDark: "#262626",
			success: "#4ade80",
			danger: "#f87171",
		},
	},
];

// Tema padrão sendo o primeiro da lista (Midnight)
export const defaultThemeId = themes[0].id;