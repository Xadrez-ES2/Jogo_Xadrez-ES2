import type { ReactNode } from "react";
import { Card } from "../components/ui/Card";

interface InfoItem {
  title: string;
  description: string;
}

const methodology: InfoItem[] = [
	{
		title: "Scrum",
		description:
		"Sprints semanais com planning, daily assíncrona e review ao final de cada ciclo.",
	},
	{
		title: "Kanban de apoio",
		description:
		"Quadro com colunas Backlog / Em andamento / Revisão / Concluído para visualizar o fluxo.",
	},
	{
		title: "Revisão de código",
		description: "Todo PR passa por pelo menos um(a) revisor(a) antes do merge na main.",
	},
];

const technologies: InfoItem[] = [
	{ title: "React", description: "Biblioteca de UI baseada em componentes e estado declarativo." },
	{ title: "TypeScript", description: "Tipagem estática para reduzir bugs na lógica de regras do jogo." },
	{ title: "React Router DOM", description: "Roteamento client-side entre as páginas da aplicação." },
	{ title: "Tailwind CSS", description: "Estilização utilitária com um sistema de tema via CSS variables." },
	{ title: "Vitest / Jest", description: "Testes unitários da engine de xadrez, isolados da UI." },
	{ title: "Context API", description: "Compartilhamento de estado global (tema, sessão de jogo)." },
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
	{
		title: "Tema via CSS Custom Properties",
		description:
		"Paletas de cor são objetos TypeScript aplicados como variáveis CSS, permitindo trocar o tema em runtime sem recarregar a página.",
	},
];

function Section({
	eyebrow,
	title,
	children,
}: {
	eyebrow: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="py-14">
			<span className="coord-rule text-xs">{eyebrow}</span>
			<h2 className="mt-2 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
				{title}
			</h2>
			<div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{children}
			</div>
		
		</section>
	);
}

export function Project() {
  return (
    <div className="mx-auto max-w-6xl divide-y divide-border px-6">
      <div className="pt-14">
        <h1 className="font-display text-4xl font-semibold text-text-primary sm:text-5xl">
          Sobre o projeto
        </h1>
        <p className="mt-4 max-w-2xl font-body text-text-muted">
          Um jogo de xadrez implementado do zero como projeto acadêmico em grupo,
          documentando as decisões de processo, tecnologia e arquitetura tomadas pelo time.
        </p>
      </div>

      <Section eyebrow="processo" title="Metodologia e gerência de projeto">
        {methodology.map((item) => (
          <Card key={item.title}>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2 font-body text-sm text-text-muted">{item.description}</p>
          </Card>
        ))}
      </Section>

      <Section eyebrow="stack" title="Tecnologias utilizadas">
        {technologies.map((item) => (
          <Card key={item.title}>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2 font-body text-sm text-text-muted">{item.description}</p>
          </Card>
        ))}
      </Section>

      <Section eyebrow="decisões" title="Arquitetura e decisões técnicas">
        {architecture.map((item) => (
          <Card key={item.title} highlighted>
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2 font-body text-sm text-text-muted">{item.description}</p>
          </Card>
        ))}
      </Section>
    </div>
  );
}
