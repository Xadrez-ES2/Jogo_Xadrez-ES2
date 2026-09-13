
/*
    Tipagem para representar os jogadores da Partida de Xadrez

    Usado pelo Componente do Tabuleiro (<Board />) para renderizar a barra
    de identificação (avatar, nome, cor) acima e abaixo do tabuleiro.
*/

export type PlayerColor = "white" | "black";

export interface Player {

    id: string;
    name: string;
    
    /* URL do avatar */
    avatarUrl: string;
    
    color: PlayerColor;
    isBot: boolean;
    
    /* Rating opcional, exibido ao lado do nome quando presente. */
    rating?: number;
}

/*
    Jogadores mockados para testes e ajustes.
*/
export const currentUser: Player = {
    id: "player-user",
    name: "Você",
    avatarUrl: "",
    color: "white",
    isBot: false,
};
 
export const botOpponent: Player = {
    id: "player-bot",
    name: "Bot",
    avatarUrl: "",
    color: "black",
    isBot: true,
    rating: 800,
};