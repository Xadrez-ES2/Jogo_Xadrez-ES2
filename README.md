# ♞ Jogo de Xadrez Web: Engenharia de Software II

Jogo de xadrez para navegador **construído do zero**: as regras e a IA adversária foram escritas pelo grupo, sem bibliotecas de regras prontas e sem APIs externas na lógica do jogo.

Projeto acadêmico do **Grupo 1** da disciplina **Engenharia de Software II** da **Universidade Federal Fluminense (UFF)**. Além do jogo, o objetivo é aplicar boas práticas de desenvolvimento e gerência de software: controle de versão, estimativas (APF/COCOMO, Planning Poker), gerência de riscos, valor agregado, testes automatizados e integração contínua.

🔗 **Jogue online:** <https://claudio0101-bit.github.io/Jogo_Xadrez-ES2/> (publicado automaticamente a partir da `main`)

---

## Funcionalidades

**Partida**
- Três modos: **Pessoa vs. IA**, **Pessoa vs. Pessoa** (no mesmo dispositivo) e **IA vs. IA**.
- Contra a IA, o jogador escolhe a cor (brancas, pretas ou sorteio), e o tabuleiro gira conforme a escolha.
- Três dificuldades de IA: Fácil, Médio e Difícil.
- Relógio de xadrez: 10, 5, 2 ou 1 minuto por jogador, ou partida sem tempo.

**Regras implementadas pela engine própria**
- Movimentos legais de todas as peças, xeque e proteção do rei.
- Roque, *en passant* e promoção (com escolha da peça).
- Fim de jogo por xeque-mate, afogamento, regra dos 50 lances, material insuficiente, tripla repetição, tempo esgotado ou desistência.

**Experiência**
- Histórico de lances em notação com símbolos, navegável por botões ou pelas **setas do teclado**.
- Desfazer lance (contra a IA, desfaz o par humano/IA).
- Pausa da partida.
- Setas e destaques desenhados com o botão direito do mouse, como nos sites de xadrez.
- Animação das peças, peças capturadas ordenadas por valor e efeitos sonoros com botão de mudo.
- Cinco **temas de cores**, salvos no navegador.
- Layout responsivo, também para celular.

**Conta e histórico** (opcional)
- Login com **Google** (Firebase Authentication). Sem login, é possível jogar como visitante.
- Partidas contra a IA são salvas no **Cloud Firestore**, com perfil, estatísticas, filtros e paginação.

---

## Arquitetura

O código fica em `app/src`, dividido em três módulos com responsabilidades separadas:

```text
            ┌──────────────────────────────────────────────┐
            │  interface/  (React + Tailwind)              │
            │  páginas, componentes, hooks, rotas, temas,  │
            │  autenticação e histórico (Firebase)         │
            └──────────────┬──────────────────┬────────────┘
                           │ estado do jogo   │ pede um lance
                           ▼                  ▼
            ┌──────────────────────┐  ┌──────────────────────┐
            │  engine/             │◀─│  ai/                 │
            │  regras do xadrez    │  │  IA adversária       │
            │  (funções puras)     │  │  (usa a engine)      │
            └──────────────────────┘  └──────────────────────┘
```

| Módulo | Responsabilidade |
|---|---|
| **`engine/`** | Representação do tabuleiro, geração de lances legais, aplicação de lances, roque, *en passant*, promoção e status da partida (xeque, mate, empates). Escrita como funções puras sobre o estado do jogo. |
| **`ai/`** | IA adversária com **minimax e poda alfa-beta**, mais função de avaliação. A dificuldade define a profundidade da busca (1, 2 ou 3 meios-lances) e a chance de um lance aleatório (30%, 10% ou 0%). |
| **`interface/`** | Aplicação React: telas, tabuleiro, relógio, histórico, temas, sons, rotas, autenticação e persistência. Só conversa com a engine e com a IA pelas funções públicas de cada módulo. |

### Rotas

A navegação usa `HashRouter` (adequado ao GitHub Pages). A tabela de rotas fica em `app/src/interface/routes/AppRoutes.tsx` e alimenta tanto o roteador quanto os menus.

| Rota | Página | Layout |
|---|---|---|
| `/` | Início | Padrão (cabeçalho e rodapé) |
| `/game` | Partida | Foco (tela cheia) |
| `/project` | Sobre o projeto e a equipe | Padrão |
| `/login` · `/register` | Entrar · Criar conta (Google) | Foco |
| `/profile` | Perfil e histórico de partidas | Padrão |
| `*` | **Página não encontrada (404)**, para qualquer endereço inexistente | Padrão |

---

## Tecnologias

| Área | Ferramentas |
|---|---|
| Interface | React 19, TypeScript 6, React Router 7, Tailwind CSS 4 |
| Build | Vite 8 |
| Conta e dados | Firebase Authentication (Google) e Cloud Firestore |
| Testes | Vitest 5, jsdom, @vitest/coverage-v8, Playwright (Chromium) |
| Qualidade | oxlint, type-check do TypeScript |
| CI/CD | GitHub Actions + GitHub Pages |

---

## Como rodar

Pré-requisito: **Node.js 22** (a versão usada no CI). Todos os comandos `npm` rodam dentro de `app/`.

```bash
cd app
npm ci
npm run dev
```

Abra o endereço exibido no terminal (normalmente `http://localhost:5173`).

### Login e histórico (opcional)

Sem configuração, o jogo funciona inteiro no **modo visitante**. Para ativar login e histórico, copie `app/.env.example` para `app/.env.local` e preencha com os dados públicos do app Web do Firebase:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIRESTORE_ENABLED=true   # ative só depois de publicar as regras abaixo
```

As regras de segurança do Firestore estão em `app/firestore.rules`. Cada usuário só lê e cria as próprias partidas, e um resultado salvo não pode ser alterado nem apagado.

### Comandos úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Type-check + build de produção |
| `npm run preview` | Serve o build de produção localmente |
| `npm run lint` | Análise estática (oxlint) |
| `npm test` | Regressão completa (engine, IA e interface) |
| `npm run test:engine` | Testes da engine |
| `npm run coverage` | Cobertura da IA |
| `npm run test:interface:unit` · `:integration` · `:system` | Testes da interface por nível |
| `npm run coverage:interface:unit` | Cobertura da interface (unidade) |
| `npm run evidence:interface` | Roda todos os testes da interface e gera um relatório HTML de evidências |

Os testes de sistema precisam do navegador do Playwright: `npx playwright install chromium`.

Para conferir as dependências, use `npm audit`. Evite `npm audit fix --force` como rotina: ele pode atualizar versões principais sem adaptar a configuração.

---

## Testes

Os três módulos têm testes automatizados com Vitest, organizados em `app/src/tests/{engine,ai,interface}`.

| Módulo | O que é coberto |
|---|---|
| **Engine** | Regras de cada peça, segurança do rei, roque, *en passant*, promoção, empates e repetição (unidade e integração) |
| **IA** | Avaliação, minimax, dificuldades e comportamento em partidas reais (xeque, roque, promoção, empates) |
| **Interface** | Três níveis: **unidade** (264 testes, **100%** de cobertura do módulo), **integração** com engine e IA reais, e **sistema** com jornadas completas no Chromium |

Nenhum teste acessa o Firebase real: autenticação e histórico são substituídos por versões falsas, e as configurações de teste zeram as credenciais.

### Integração contínua

A cada push ou pull request para a `main`, o GitHub Actions (`.github/workflows/CI.yml`):

1. roda a regressão completa, o lint e o build;
2. mede a cobertura de unidade e integração da interface e guarda os relatórios;
3. executa os testes de sistema no Chromium;
4. **publica no GitHub Pages**, só se tudo passar.

---

## Estrutura de pastas

```text
Jogo_Xadrez-ES2/
├── README.md
├── LICENSE
├── .github/workflows/CI.yml   Pipeline de testes, build e deploy
├── docs/                      Artefatos do projeto e documentação
└── app/                       Aplicação Vite
    ├── package.json
    ├── index.html
    ├── firestore.rules        Regras de segurança do Firestore
    ├── public/sounds/         Efeitos sonoros
    ├── scripts/               Scripts auxiliares (verificações e evidências)
    ├── vitest.*.config.ts     Configurações de teste por módulo e nível
    └── src/
        ├── main.tsx           Ponto de entrada
        ├── engine/            Regras do xadrez
        │   ├── board/ game/ moves/ pieces/ status/
        │   └── index.ts       API pública da engine
        ├── ai/                IA adversária (minimax + alfa-beta)
        ├── interface/         Aplicação React
        │   ├── App.tsx
        │   ├── components/ data/ hooks/ pages/ routes/
        │   └── services/ stores/ types/ utils/
        └── tests/             Testes da engine, da IA e da interface
```

---

## Equipe

| Integrante | Equipe |
|---|---|
| Cláudio Pires | Interface Gráfica |
| Guilherme Fontoura | Interface Gráfica |
| Lais Nazareth | Máquina de Regras |
| Lucas Moraes | Máquina de Regras |
| Diogo Gouveia | Máquina de Regras |
| Amanda Lemos | I.A. Adversária |
| Maria Eduarda D'Angelo | I.A. Adversária |

---

## Documentação do projeto

- [APF + COCOMO](https://docs.google.com/document/d/1EVSMWwQf2x0DyggbttoriSL-Q8-bGc5_7kmCcwxzafc/edit)
- [Apresentação 1](https://docs.google.com/document/d/1DH66TKas2vvzte7xmB3b2CrciOC7Ddo6C2Cyp-zUslA/edit)
- [Burndown](https://docs.google.com/spreadsheets/d/1FBr8I2gCw6ORi3hM9aUdc5sDjHnZ36zCOSjkazYToZE/edit)
- [EAP - Xadrez](https://app.diagrams.net/#G1B58PN7OvdYRGNWsORiHTAopWIjEAja-P#%7B%22pageId%22%3A%229dhHK2oW_X2ZbE2gQlDt%22%7D)
- [Gerência de Risco](https://docs.google.com/spreadsheets/d/1y_qLLt5LY4RTBiFJWXxFm2HBn3au1TVUem9s0vEK1R4/edit)
- [Planning Poker](https://docs.google.com/spreadsheets/d/1Vak8HGxYzIsVRxqFFF3QkTJeKa8RFyCNuwGL_2GqDME/edit)
- [Valor Agregado](https://docs.google.com/spreadsheets/d/1_L8TMeiJFJgwcNXx_UKUSVYBgY-5s4N-KxEBbQkJgEs/edit)

---

## Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE).
