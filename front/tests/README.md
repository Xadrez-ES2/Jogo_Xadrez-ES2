# Verificação de desistência e resultado

Execute `npm test`, `npm run build` e `npm run lint` na pasta `front`.

Os testes de componentes verificam cancelamento, evento de Escape, confirmação
de desistência, bloqueio das 64 casas, limpeza da seleção, reabertura do resultado
e reinício da interface. Também verificam a apresentação de vitória, derrota e
empate e as ações do pop-up.

Os testes usam JSDOM, com uma adaptação para abrir e fechar o elemento `dialog`.
Não verificam layout, foco ou a camada modal nativa de um navegador real.

Para verificar manualmente em `/game`:

1. Selecione uma casa, abra “Desistir da partida” e cancele com o botão ou Escape.
2. Confirme a desistência: deve abrir “Derrota”, com o motivo do encerramento.
3. Use “Ver tabuleiro”: as casas devem permanecer bloqueadas, inclusive para anotações.
4. Use “Ver resultado” para reabrir o pop-up.
5. Use “Jogar novamente” ou “Nova partida”: a interação deve voltar ao estado inicial.
6. Verifique “Voltar ao início”, navegação por teclado e apresentação em tela pequena.

## Limites da integração

Somente a desistência produz um resultado real na interface atual. O componente
`GameResultModal` aceita vitória, derrota e empate, mas a detecção automática de
xeque-mate e empate depende da futura integração com a máquina de regras.
O estado local não persiste após recarregar a página. O reinício restaura a
interface atual; não reinicia uma engine, IA, relógio ou histórico persistido.
Nenhum módulo da máquina de regras ou da IA foi alterado.
