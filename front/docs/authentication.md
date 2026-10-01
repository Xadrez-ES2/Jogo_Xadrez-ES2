# Cadastro e login com Google

## Requisitos e escopo

A [Apresentação 1](https://docs.google.com/document/d/1DH66TKas2vvzte7xmB3b2CrciOC7Ddo6C2Cyp-zUslA/edit)
define login Google (RF1), cadastro automático no primeiro acesso (RF2), logout
(RF3) e identificação do usuário (RF4). RNF15 exige autenticação oficial e proíbe
armazenar a senha Google; RNF18 exige encerrar a sessão ao sair.
O [APF + COCOMO](https://docs.google.com/document/d/1EVSMWwQf2x0DyggbttoriSL-Q8-bGc5_7kmCcwxzafc/edit)
também prevê Google/Firebase Authentication e dados de usuário (ID, nome e e-mail).

As rotas `/register` e `/login` usam o mesmo fluxo Google. No primeiro acesso,
Firebase Authentication cria a conta; nos seguintes, autentica a conta existente.
Não existe formulário de senha. A interface exibe nome, e-mail e foto, identifica
o jogador no tabuleiro e permite sair pelos cabeçalhos ou pela tela de conta.

O SDK usa persistência por sessão do navegador: a sessão sobrevive à atualização
da página na mesma aba, sem gravar manualmente tokens ou senhas no localStorage.
O Firebase é carregado separadamente do restante da aplicação.

## Configurar o projeto

1. No [Firebase Console](https://console.firebase.google.com/), crie ou selecione
   o projeto do jogo e registre um aplicativo **Web** nas configurações do projeto.
2. Abra **Authentication**, inicie a configuração e habilite o provedor **Google**
   em **Sign-in method**, preenchendo o e-mail de suporte solicitado.
3. Em **Authentication > Settings > Authorized domains**, adicione `localhost`.
   Adicione também o domínio de produção quando houver publicação. Use
   `http://localhost:5173` no teste local; se usar `127.0.0.1`, autorize esse host.
4. Copie `front/.env.example` para `front/.env.local` e preencha com os valores do
   objeto `firebaseConfig` do aplicativo Web:

   ```dotenv
   VITE_FIREBASE_API_KEY=valor_de_apiKey
   VITE_FIREBASE_AUTH_DOMAIN=valor_de_authDomain
   VITE_FIREBASE_PROJECT_ID=valor_de_projectId
   VITE_FIREBASE_APP_ID=valor_de_appId
   ```

5. Na pasta `front`, execute `npm install` e `npm run dev`. Reinicie o servidor
   depois de mudar `.env.local`. Em produção, configure as mesmas variáveis no
   ambiente de build e use HTTPS.

Esses valores são a configuração pública do cliente Web. Não use credenciais de
conta de serviço, chave privada ou client secret no frontend. `.env.local` já é
ignorado pelo Git. A configuração do Firebase Console não é feita por esta branch.

## Verificação manual

1. Sem `.env.local`, abra cadastro e login: deve aparecer indisponibilidade, sem
   autenticação simulada, e a opção de jogar como visitante deve funcionar.
2. Com a configuração, abra `/register` e clique em **Cadastrar com Google**.
   Use uma conta nova para esse projeto: confirme a criação automática e seus dados.
3. Confirme que a conta aparece em **Authentication > Users** no Firebase Console.
4. Clique em **Jogar agora**: seu nome e foto devem aparecer no tabuleiro.
5. Atualize a página: a conta deve continuar identificada na mesma aba.
6. Clique em **Sair**: sua identidade deve desaparecer e o visitante deve voltar.
7. Em `/login`, acesse novamente com a mesma conta: não deve criar outro usuário.
8. Cancele a janela Google e teste pop-up bloqueado: deve aparecer uma mensagem
   compreensível e permitir nova tentativa.
9. Verifique teclado, tela pequena, temas e que a pausa/relógio continuam funcionando.

Os testes locais em `front/tests` usam um serviço simulado
para verificar as transições da interface. Não substituem o teste com Google real.

## Integrações pendentes

Esta implementação cria a conta no **Firebase Authentication**, sem criar uma
coleção de perfis no Firestore. O perfil completo e o histórico de partidas
continuam pendentes. O `uid` fica disponível no contexto de autenticação para a
integração futura; autorização de acesso aos dados deverá ser garantida no serviço
de persistência, conforme RF44/RNF16. Não há mudanças na máquina de regras ou IA.

## Dependências

O pacote Firebase também instala módulos de Firestore que não são usados aqui.
O override de `@grpc/grpc-js` exige versão corrigida a partir de `1.13.6`, evitando
as vulnerabilidades reportadas na dependência transitiva pelo `npm audit`.

## Referências de implementação

- [Google Sign-In com Firebase](https://firebase.google.com/docs/auth/web/google-signin)
- [Persistência da sessão](https://firebase.google.com/docs/auth/web/auth-state-persistence)
- [Configuração pública e API keys](https://firebase.google.com/docs/projects/api-keys)
