/*
	Tipagem dos membros da equipe, usada para renderizar
	os cards da página '/equipe' a partir de um array de dados.
*/

export type TeamRole =
    | "Product Owner"
    | "Scrum Master"
    | "Tech Lead"
    | "Desenvolvedor(a) Front-End"
    | "Desenvolvedor(a) Back-End"
    | "Desenvolvedor(a) Full-Stack"
    | "QA / Testes"
    | "UI/UX Designer";

export interface TeamMember {

	/* Identificador único, usado como `key` nas listas */
	id: string;
	
	name: string;
	role: TeamRole;
	
	/* URL do avatar/foto. (Ver GitHub avatar) */
	avatarUrl: string;
	
	/* Perfil do GitHub (obrigatório) */
	githubUrl: string;
	
	/* Perfil do LinkedIn (opcional) */
	linkedinUrl?: string;
	
	/* Curta descrição/bio do integrante (opcional) */
	bio?: string;
}
