# Xadrez — Começo do Projeto

Base do front-end (React + TypeScript + Tailwind CSS + React Router) para o projeto
de xadrez do grupo. Contém navegação, sistema de temas e as 4 páginas iniciais.
**Nenhuma regra de xadrez foi implementada ainda** — isso fica para a próxima etapa,
na `app/src/engine`.

## Como rodar

```bash
cd app
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

```text
Jogo_Xadrez-ES2/
    README.md
    LICENSE
    docs/                 Local reservado para os artefatos do projeto
        .gitkeep
    app/                  Aplicação Vite; antiga pasta front/
        package.json
        package-lock.json
        index.html
        public/
        firestore.rules
        src/
            main.tsx      Ponto de entrada da aplicação
            interface/
                App.tsx
                globals.css
                FEN.ts    Conversão usada pelo tabuleiro atual
                components/
                data/
                hooks/
                pages/
                routes/
                services/
                stores/
                types/
                utils/
            engine/
                .gitkeep
            ai/
                .gitkeep
```

Os arquivos de configuração existentes permanecem em `app/`.

A organização prepara a separação entre Interface, Máquina de Regras e IA.
As dependências planejadas seguem o sentido Interface -> IA/engine e
IA -> engine; a engine não depende dos outros subgrupos. Os contratos
públicos via `index.ts` serão implementados no trabalho posterior.

Neste PR, o FEN e os tipos existentes permanecem na interface para
preservar o tabuleiro atual. Os serviços de autenticação e histórico
também permanecem na interface até a definição da responsabilidade
pela persistência. Os componentes duplicados foram preservados.

A pasta `docs/` está preparada para receber os artefatos. Os links
externos acima permanecem disponíveis; seus documentos ainda precisam
ser incorporados ao repositório.

Após incorporar a reorganização, execute a instalação de dependências
dentro de `app/`. Eventuais arquivos locais remanescentes em `front/`
devem ser conferidos antes de qualquer remoção.
