import type { PieceColor, PieceType } from "../types/pieces";
import type { BoardState, Files, Ranks, SquareId } from "../types/square";

/*
	A notação FEN é uma linha única de texto que descreve o estado exato de um tabuleiro de xadrez.
	É dividida em 6 blocos de informação separados por espaços.
	
	Ex.: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

	1. Posição das peças: Descreve o tabuleiro da 8° linha até a 1° linha, da esquerda para a direita. 
		- As linhas são separadas por uma barra "/".
		- Letras maiúsculas: Peças brancas ('P'awn, 'K'night, 'B'ishop, 'R'ook, 'Q'ueen, 'K'ing).
		- Letras minúsculas: Peças pretas (p, n, b, r, q, k).
		- Números (1 a 8): Indicam a quantidade de casas vazias consecutivas naquela linha.
	
	2. Vez de jogar: Indica qual cor faz o próximo lance.
		- w: Brancas (White)
		- b: Pretas (Black)
	
	3. Direitos de Roque: Mostra quais roques ainda são permitidos no jogo.
		- K (roque na ala do rei das brancas); Q (ala da dama das brancas).
		- k (roque na ala do rei das pretas); q (ala da dama das pretas).
		- Usa-se "-" se nenhum dos lados puder rocar.
	
	4. Alvo de captura 'En Passant': 
		Se o último lance foi o avanço de um peão por duas casas, este bloco mostra a casa que ficou vulnerável à captura En Passant (ex: e3). 
		Se não houver alvo disponível, exibe apenas um hífen "-"".
	
	5. Relógio de meio-movimento: Número de lances desde a última captura ou movimento de peão.
		Serve para controlar a regra dos 50 lances (se chegar a 100 meios-lances sem capturas ou peões movidos, o jogo pode ser declarado empate).
	
	6. Número do lance completo: O contador geral da partida. 
		Ele começa em 1 e aumenta sempre após o movimento das pretas.
*/

// Letra FEN (sempre minúscula) -> tipo de peça.
const FEN_PIECE_TYPES: Record<string, PieceType> = {
    p: "pawn",
    n: "knight",
    b: "bishop",
    r: "rook",
    q: "queen",
    k: "king",
};

// Posição inicial padrão de uma partida, em FEN.
export const STARTING_POSITION_FEN =
	"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const FILES: Files[] = ["a", "b", "c", "d", "e", "f", "g", "h"];
 
/*
	Função de Conversão da Notação FEN para o estado visual do tabuleiro
	(`BoardState`) consumido pelo <Board />.

	Esta função Lê apenas o 1° campo da FEN — a disposição das peças
	(ex: "rnbqkbnr/pppppppp/8/.../RNBQKBNR"). 
	
	Os demais campos dizem respeito à REGRA do jogo, não ao desenho do tabuleiro.
	
	Sugestão: criar um `parseFenFields()` complementar para extrair os outros campos.
*/
export function parseFenBoard(fen: string): BoardState {
	
	// Pegando apenas o 1° campo da string FEN, da disposição das peças
	const piecePlacement = fen.trim().split(" ")[0];

	// Separando pelas linhas do tabuleiro, separadas por "/"
	const fenRanks = piecePlacement.split("/");
	
	// Tratamento de Erro para FEN inválida quanto às peças
	if (fenRanks.length !== 8) {
		throw new Error(
		`FEN inválida: esperado 8 linhas separadas por "/", recebido ${fenRanks.length}.`
		);
	}
	
	// Constante de Estado do Tabuleiro a ser retornada
	const board: BoardState = {};
	
	// Loop de leitura de cada linha do Tabuleiro
	fenRanks.forEach((fenRank, rankIndex) => {
		
		// A 1° linha("Rank") de uma FEN é sempre a linha 8 do tabuleiro (convenção do formato).
		const rank = (8 - rankIndex) as Ranks;
		
		// Índice da coluna("File")
		let fileIndex = 0;
		

		for (const char of fenRank) {

			// Tratamento pra manter 'fileIndex' em seu alcance de 0-7 (8 colunas)
			if (fileIndex > 7) {
				throw new Error(`FEN inválida: a linha "${fenRank}" ultrapassa 8 colunas.`);
			}
		
			// Leitura de Dígito = quantidade de casas vazias seguidas (ex: "8" = linha inteira vazia)
			if (/[1-8]/.test(char)) {
				fileIndex += Number(char);
				continue;
			}
			
			// Leitura de peça com dicionário 'FEN_PIECE_TYPES'
			const type = FEN_PIECE_TYPES[char.toLowerCase()];
			
			// Tratamento de nomes de peças inválidos
			if (!type) {
				throw new Error(`FEN inválida: caractere de peça desconhecido "${char}".`);
			}
		
			// Atribuição de cor
			// Letra Maiúscula = branca; Letra Minúscula = preta (convenção do formato).
			const color: PieceColor = char === char.toUpperCase() ? "white" : "black";
			const file = FILES[fileIndex];

			// Quadrado de localização de uma peça
			const squareId: SquareId = `${file}${rank}`;
			
			// Inclusão de uma peça em um quadrado no Estado do Tabuleiro
			board[squareId] = { piece: { type }, color };
			
			fileIndex += 1;
		}
	});
	
	return board;
}

export const initialBoard = parseFenBoard(STARTING_POSITION_FEN)