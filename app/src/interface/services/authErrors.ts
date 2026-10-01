export function getAuthErrorMessage(error: unknown): string {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    switch (code) {
        case "auth/popup-closed-by-user":
        case "auth/cancelled-popup-request":
            return "O acesso foi cancelado. Quando quiser, tente novamente.";
        case "auth/popup-blocked":
            return "O navegador bloqueou a janela do Google. Permita pop-ups para este site e tente novamente.";
        case "auth/network-request-failed":
            return "Não foi possível conectar. Verifique sua conexão e tente novamente.";
        case "auth/account-exists-with-different-credential":
            return "Esta conta já utiliza outra forma de acesso. Entre em contato com a equipe do projeto.";
        case "auth/user-disabled":
            return "Esta conta está desativada. Entre em contato com a equipe do projeto.";
        case "auth/unauthorized-domain":
        case "auth/operation-not-allowed":
        case "auth/invalid-api-key":
        case "auth/configuration-not-found":
            return "O login está temporariamente indisponível. Você pode continuar jogando como visitante.";
        default:
            return "Não foi possível concluir a operação. Tente novamente.";
    }
}
