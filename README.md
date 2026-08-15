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

## Sistema de temas

O tema ativo é um objeto `Theme` (`src/types/theme.ts`) aplicado como
CSS Custom Properties no elemento `<html>` pelo `ThemeProvider`
(`src/context/ThemeContext.tsx`). O Tailwind lê essas variáveis
via `tailwind.config.js` (ex: `bg-primary`, `text-accent`), então
trocar de tema não exige recompilar CSS nem recarregar a página.
A escolha é persistida em `localStorage`.

Para adicionar uma nova paleta:

1. Acrescente o `id` ao union type `ThemeId` em `src/types/theme.ts`.
2. Adicione um novo objeto `Theme` em `src/data/themes.ts`.
3. Pronto — o `ThemeSwitcher` já lista o novo tema automaticamente.

Temas incluídos: **Midnight** (padrão, azul-marinho/azul-claro),
**Clássico** (verde/madeira, inspirado em tabuleiros de clube) e **Claro**.

## Equipe

Em `src/data/team.ts` há os seguintes dados: nome, cargo, avatar e links, de
cada integrante — os cards em `/equipe` são gerados automaticamente
a partir desse array (`TeamMember[]`).

## Próximos passos sugeridos

- Criar `src/engine/` com a lógica pura de xadrez (tabuleiro, geração
  de movimentos, xeque/xeque-mate, roque, en passant, promoção),
  **sem nenhuma dependência de React** — testável isoladamente.
- Substituir o `BoardPlaceholder` em `src/pages/Game.tsx` por um
  componente de tabuleiro real, ligado ao estado da engine.
- Adicionar testes unitários (Vitest) para a engine.
- Implementar a página `/opcoes` (hoje desabilitada de propósito).
