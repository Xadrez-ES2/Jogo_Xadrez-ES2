
export interface TeamMember {

	/* Identificador único, usado como `key` nas listas */
	id: string;
	
	name: string;
	role: "Desenvolvedor(a) Full-Stack";
	
	/* URL do avatar/foto. (GitHub Avatar) */
	avatarUrl: string;
	
	/* Link do GitHub */
	githubUrl: string;
	
	/* Descrição/bio do integrante (opcional) */
	bio?: string;
}
