import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Theme, ThemeContextValue, ThemeId } from "../types/theme";
import { defaultThemeId, themes } from "../data/themes";

const STORAGE_KEY = "xadrez:theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/** Converte "textPrimary" -> "--color-text-primary" para o CSS. */
function toCssVarName(key: string): string {
    return `--color-${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
}

// Aplica todas as cores do tema como CSS Custom Properties no <html>.
function applyThemeToDocument(theme: Theme) {
	
	const root = document.documentElement;
	
	Object.entries(theme.palette).forEach(([key, value]) => {
		root.style.setProperty(toCssVarName(key), value);
	});
	
	root.dataset.theme = theme.id;
}

// Retorna o tema inicial, baseado no localStorage ou no tema padrão.
function getInitialThemeId(): ThemeId {

	if (typeof window === "undefined") return defaultThemeId;
	const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
	const isValid = stored && themes.some((t) => t.id === stored);
	return isValid ? stored : defaultThemeId;
}

// Provider de contexto que mantém o tema atual e a lista de temas disponíveis.
export function ThemeProvider({ children }: { children: ReactNode }) {
	
	const [themeId, setThemeId] = useState<ThemeId>(getInitialThemeId);

	const theme = useMemo(
		() => themes.find((t) => t.id === themeId) ?? themes[0],
		[themeId]
	);

	useEffect(() => {
		applyThemeToDocument(theme);
		window.localStorage.setItem(STORAGE_KEY, theme.id);
	}, [theme]);

	const value: ThemeContextValue = {
		theme,
		themeId,
		availableThemes: themes,
		setThemeId,
	};

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Hook de acesso ao tema atual e ao seletor de temas. 
export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	
	if (!ctx) {
		throw new Error("useTheme deve ser usado dentro de um <ThemeProvider>");
	}
	
	return ctx;
}
