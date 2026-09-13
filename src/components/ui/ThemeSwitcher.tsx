import { useTheme } from "../../stores/ThemeContext";
import type { ThemeId } from "../../types/theme";

/*
	Seletor de paleta de cores. 
	
	Lê a lista de temas disponíveis diretamente do ThemeContext — nenhum novo tema precisa de
	alteração neste componente para aparecer aqui.
*/
export function ThemeSwitcher() {
	
	// Hook do Tema: acessa o tema atual, a lista de temas disponíveis e a função para alterar o tema
	const { themeId, availableThemes, setThemeId } = useTheme();

	return (
		<label className="flex items-center gap-2 text-sm text-text-muted">
			
			<span className="hidden font-body sm:inline">Tema</span>
			
			<select
				value={themeId}
				onChange={(e) => setThemeId(e.target.value as ThemeId)}
				className="cursor-pointer rounded-md border border-border bg-surface-alt px-3 py-1.5 font-body text-sm text-text-primary outline-none transition-colors hover:border-accent"
				aria-label="Selecionar paleta de cores"
			>
				
				{availableThemes.map((t) => (
					<option key={t.id} value={t.id}>
						{t.label}
					</option>
				))}
			
			</select>
		
		</label>
	);
}
