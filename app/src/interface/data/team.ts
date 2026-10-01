import type { TeamMember } from "../types/team";

/*
	Dados da equipe.

	Nome, cargo, avatar, links dos membros do grupo.
	Basta editar este array — os cards da página /equipe
	são gerados dinamicamente a partir dele.
*/
export const teamMembers: TeamMember[] = [
	{
		id: "member-01",
		name: "Cláudio Pires",
		role: "Interface Gráfica",
		avatarUrl: "https://avatars.githubusercontent.com/u/177589287?s=400&u=941e7e51a748d70a617fd6958adb19545c8c6979&v=4",
		githubUrl: "https://github.com/Claudio0101-bit",
	},
	{
		id: "member-02",
		name: "Lais Nazareth",
		role: "Máquina de Regras",
		avatarUrl: "https://avatars.githubusercontent.com/u/186738292?v=4",
		githubUrl: "https://github.com/lais-nazareth",
	},
	{
		id: "member-03",
		name: "Amanda Lemos",
		role: "I.A. Adversária",
		avatarUrl: "https://avatars.githubusercontent.com/u/169489638?v=4",
		githubUrl: "https://github.com/amandalribas",
	},
	{
		id: "member-04",
		name: "Maria Eduarda D'Angelo",
		role: "I.A. Adversária",
		avatarUrl: "https://avatars.githubusercontent.com/u/221703289?v=4",
		githubUrl: "https://github.com/maduVianna",
	},
	{
		id: "member-05",
		name: "Guilherme Fontoura",
		role: "Interface Gráfica",
		avatarUrl: "https://avatars.githubusercontent.com/u/187791780?v=4",
		githubUrl: "https://github.com/gdhfontoura",
	},
	{
		id: "member-06",
		name: "Lucas Moraes",
		role: "Máquina de Regras",
		avatarUrl: "https://avatars.githubusercontent.com/u/78197531?v=4",
		githubUrl: "https://github.com/luckssl",
	},
	{
		id: "member-07",
		name: "Diogo Gouveia",
		role: "Máquina de Regras",
		avatarUrl: "https://avatars.githubusercontent.com/u/110561023?v=4",
		githubUrl: "https://github.com/gouveiadiogo",
	},
];
