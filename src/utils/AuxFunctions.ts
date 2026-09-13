
/*
    Funções auxiliares para o projeto
*/

/*
    Iniciais usadas como fallback visual se o Jogador/Player não tem avatar
*/
export function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}