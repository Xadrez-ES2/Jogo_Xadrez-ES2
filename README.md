# Xadrez — Começo do Projeto

Base do front-end (React + TypeScript + Tailwind CSS + React Router) para o projeto
de xadrez do grupo. Contém navegação, sistema de temas e as 4 páginas iniciais.
**Nenhuma regra de xadrez foi implementada ainda** — isso fica para a próxima etapa,
na `engine` (ver seção "Próximos passos").

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal (normalmente `http://localhost:5173`).

Outros comandos úteis:

```bash
npm run build      # build de produção (roda o type-check antes)
npm run preview    # serve o build de produção localmente
```

## Estrutura de pastas

```
src/
    types/            Interfaces TypeScript (Theme, TeamMember, RouteConfig)
    stores/           ThemeContext + ThemeProvider (Context API)
    data/             Dados da aplicação: themes.ts e team.ts
    routes/           AppRoutes.tsx — fonte única de verdade das rotas
    components/
      layout/         Header, Footer, Layout (casco visual das páginas)
      ui/             Button, Card, ThemeSwitcher (componentes reutilizáveis)
    pages/            Home, Game (Jogo), Project (Projeto), Team (Equipe)
    ChessEngine/      Pasta voltada para a implementação da Máquina de Regras do Xadrez
	AI/               Pasta voltada para a implementação do comportamento computadorizado do oponente 
    globals.css       Variáveis CSS padrão + estilos globais
```
