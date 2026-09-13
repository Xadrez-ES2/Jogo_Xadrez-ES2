import type { ReactNode } from "react";
import { Card } from "../components/ui/Card";
import { teamMembers } from "../data/team";

interface InfoItem {
	title: string;
	description: string;
}

const methodology: InfoItem[] = [
	{
		title: "Scrum",
		description:
		"Sprints semanais com planning, debates assíncronos e review ao final de cada ciclo.",
	},
	{
		title: "Kanban de apoio",
		description:
		"Quadro com colunas Backlog / A fazer / Em andamento / Em revisão / Concluído para visualizar o fluxo de trabalho.",
	},
	{
		title: "Roadmap para planejamento",
		description: "Gráfico de Gantt (Roadmap) para determinação e acompanhamento dos prazos do projeto.",
	},
];

const kanbanColumns: InfoItem[] = [
	{
		title: "Backlog",
		description: "Itens levantados mas ainda não priorizados para uma sprint.",
	},
	{
		title: "In progress",
		description: "Tarefas com desenvolvimento ativo.",
	},
	{
		title: "In review",
		description: "Pull Requests aguardando revisão de código ou validação.",
	},
	{
		title: "Done",
		description: "Itens revisados, validados e mergeados na Branch Main.",
	},
];

const technologies: InfoItem[] = [
	{ title: "React", description: "Biblioteca de UI baseada em componentes e estado declarativo." },
	{ title: "TypeScript", description: "Tipagem estática para reduzir bugs na lógica de regras do jogo." },
	{ title: "React Router DOM", description: "Roteamento client-side entre as páginas da aplicação." },
	{ title: "Tailwind CSS", description: "Estilização utilitária, reutilizável e escalável." },
	// { title: "Vitest / Jest", description: "Testes unitários da engine de xadrez, isolados da UI." },
	{ title: "Context API", description: "Compartilhamento de estado global (cores de tema)." },
];

const architecture: InfoItem[] = [
	{
		title: "Engine isolada da UI",
		description:
		"A lógica de movimentos, xeque e xeque-mate vive fora dos componentes React, em módulos TypeScript puros — testáveis sem renderizar nada.",
	},
	{
		title: "Tabuleiro como dado, não como HTML",
		description:
		"O estado do jogo é representado como estrutura de dados (matriz ou mapa de casas); a UI apenas reflete esse estado.",
	},
];

// Sub-Componente para Seções da página de Projeto, com título, descrição e conteúdo (children).
function Section({
	eyebrow,
	title,
	description,
	children,
}: {
	eyebrow: string;
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<section className="py-14">
			
			<span className="coord-rule text-xs">{eyebrow}</span>
			
			<h2 className="mt-2 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
				{title}
			</h2>
			
			{description && (
				<p className="mt-3  font-body text-sm text-text-muted">{description}</p>
			)}
			
			<div className="mt-8">
				{children}
			</div>
		
		</section>
	);
}

function CardGrid({ items, highlighted = false }: { items: InfoItem[]; highlighted?: boolean }) {
	
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{items.map((item) => (
				<Card key={item.title} highlighted={highlighted}>
					<h3 className="font-display text-lg font-semibold text-text-primary">{item.title}</h3>
					<p className="mt-2 font-body text-sm text-text-muted">{item.description}</p>
				</Card>
			))}
		</div>
	);
}

export function Project() {
	return (
		<div className="mx-auto max-w-6xl divide-y divide-border px-6">
			
			<div className="py-14">
				
				<span className="coord-rule text-xs">projeto & equipe</span>
				
				<h1 className="mt-2 font-display text-4xl font-semibold text-text-primary sm:text-5xl">
					Sobre o projeto
				</h1>
				
				<p className="mt-4 font-body text-text-muted">
					Um jogo de xadrez implementado do zero como projeto acadêmico em grupo para a disciplina de Engenharia de Software II, na Universidade Federal Fluminense (UFF). O objetivo foi aplicar boas técnicas de desenvolvimento e gerência de software, como controle de versão, gerência de riscos, testes unitários, integração contínua, dentre outras. Esta página detalha como algumas dessas técnicas foram aplicadas, documentando metodologia, gestão, tecnologia, arquitetura e as pessoas por trás do projeto.
				</p>
			
			</div>

			{/* METODOLOGIA */}
			<Section eyebrow="processo" title="Metodologia e gerência de projeto">
				<CardGrid items={methodology} />
			</Section>

			{/* GITHUB PROJECTS — KANBAN & ROADMAP */}
			<Section
				eyebrow="monitoramento"
				title="GitHub Projects — Kanban & Roadmap"
				description="O fluxo de trabalho do time é monitorado em um quadro Kanban no GitHub Projects e em um gráfico de Gantt, que permite divisão e filtragem das tarefas para melhorar a visualização, colaborando para acompanhamento dos prazos e do desenvolvimento do projeto."
			>
				
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
					{kanbanColumns.map((column) => (
						<div
							key={column.title}
							className="rounded-lg border border-border bg-surface-alt p-4"
						>
							<h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
								{column.title}
							</h3>
							<p className="mt-2 font-body text-xs text-text-muted">{column.description}</p>
						
						</div>
					))}
				</div>
			
			</Section>

			{/* STACK */}
			<Section eyebrow="stack" title="Tecnologias utilizadas">
				<CardGrid items={technologies} />
			</Section>

			{/* ARQUITETURA */}
			<Section eyebrow="decisões" title="Arquitetura e decisões técnicas">
				<CardGrid items={architecture} highlighted />
			</Section>

			{/* EQUIPE */}
			<Section
				eyebrow="time"
				title="Equipe"
				description={`${teamMembers.length} desenvolvedores dividindo peões, torres e responsabilidades.`}
			>
				<div className="mt-10 flex flex-wrap justify-center gap-12">
					
					{teamMembers.map((member) => (
						<Card key={member.id} className="flex flex-col items-center text-center">
							<img
								src={member.avatarUrl}
								alt={`Avatar de ${member.name}`}
								className="h-20 w-20 rounded-full border-2 border-border object-cover"
								loading="lazy"
							/>
							
							<h3 className="mt-4 font-display text-base font-semibold text-text-primary">
								{member.name}
							</h3>
							
							<span className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
								{member.role}
							</span>
							
							{member.bio && (
								<p className="mt-3 font-body text-sm text-text-muted">{member.bio}</p>
							)}
							
							<a
								href={member.githubUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-4 rounded-md border border-border px-3 py-1.5 font-body text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
								aria-label={`GitHub de ${member.name}`}
							>
								GitHub ↗
							</a>
						
						</Card>
					))}
				
				</div>
			
			</Section>
		
		</div>
	);
}