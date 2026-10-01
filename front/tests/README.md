# Verificação de desistência, resultado e pausa

Execute `npm test`, `npm run build` e `npm run lint` na pasta `front`.

Os testes de componentes verificam cancelamento, evento de Escape, confirmação
de desistência, bloqueio das 64 casas, limpeza da seleção, reabertura do resultado
e reinício da interface. Também verificam a apresentação de vitória, derrota e
empate e as ações do pop-up.
O teste de pausa verifica bloqueio de seleção e anotações, preservação do estado
ao retomar, desistência durante a pausa e reinício sem pausa residual.

Os testes usam JSDOM, com uma adaptação para abrir e fechar o elemento `dialog`.
Não verificam layout, foco ou a camada modal nativa de um navegador real.

Para verificar manualmente em `/game`:

1. Selecione uma casa, abra “Desistir da partida” e cancele com o botão ou Escape.
2. Confirme a desistência: deve abrir “Derrota”, com o motivo do encerramento.
3. Use “Ver tabuleiro”: as casas devem permanecer bloqueadas, inclusive para anotações.
4. Use “Ver resultado” para reabrir o pop-up.
5. Use “Jogar novamente” ou “Nova partida”: a interação deve voltar ao estado inicial.
6. Verifique “Voltar ao início”, navegação por teclado e apresentação em tela pequena.

Para verificar pausa e retomada em `/game`:

1. Selecione uma casa e use o botão direito em outra para criar uma anotação.
2. Clique em “Pausar partida”: deve aparecer “Partida pausada” e “Retomar partida”.
3. Tente selecionar casas ou criar/remover anotações: o tabuleiro deve permanecer bloqueado.
4. Clique em “Retomar partida”: seleção e anotações anteriores devem estar preservadas.
5. Confirme que é possível selecionar casas e desenhar anotações novamente.
6. Pause e abra a desistência: cancelar deve manter a pausa; confirmar deve encerrar a partida.
7. Clique em “Jogar novamente”: o tabuleiro deve voltar ativo, com “Pausar partida”.

## Limites da integração

Somente a desistência produz um resultado real na interface atual. O componente
`GameResultModal` aceita vitória, derrota e empate, mas a detecção automática de
xeque-mate e empate depende da futura integração com a máquina de regras.
O estado local não persiste após recarregar a página. O reinício restaura a
interface atual; não reinicia uma engine, IA, relógio ou histórico persistido.
Nenhum módulo da máquina de regras ou da IA foi alterado.
A pausa bloqueia somente a interação da interface atual. O relógio exibido ainda
é estático e não há processamento de jogadas ou IA para suspender. A sincronização
da pausa com esses módulos dependerá de sua implementação e integração futuras.
