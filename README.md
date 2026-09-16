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

## Documentação

- [APF + COCOMO](https://docs.google.com/document/d/1EVSMWwQf2x0DyggbttoriSL-Q8-bGc5_7kmCcwxzafc/edit)
- [Apresentação 1](https://docs.google.com/document/d/1DH66TKas2vvzte7xmB3b2CrciOC7Ddo6C2Cyp-zUslA/edit)
- [Burndown](https://docs.google.com/spreadsheets/d/1FBr8I2gCw6ORi3hM9aUdc5sDjHnZ36zCOSjkazYToZE/edit)
- [EAP - Xadrez](https://app.diagrams.net/#G1B58PN7OvdYRGNWsORiHTAopWIjEAja-P#%7B%22pageId%22%3A%229dhHK2oW_X2ZbE2gQlDt%22%7D)
- [Gerência de Risco](https://docs.google.com/spreadsheets/d/1y_qLLt5LY4RTBiFJWXxFm2HBn3au1TVUem9s0vEK1R4/edit)
- [Planning Poker](https://docs.google.com/spreadsheets/d/1Vak8HGxYzIsVRxqFFF3QkTJeKa8RFyCNuwGL_2GqDME/edit)
- [Valor Agragado](https://docs.google.com/spreadsheets/d/1_L8TMeiJFJgwcNXx_UKUSVYBgY-5s4N-KxEBbQkJgEs/edit)

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
