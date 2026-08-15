import { teamMembers } from "../data/team";
import type { TeamMember } from "../types/team";
import { Card } from "../components/ui/Card";

function TeamMemberCard({ member }: { member: TeamMember }) {
	return (
		<Card className="flex flex-col items-center text-center">
			<img
				src={member.avatarUrl}
				alt={`Avatar de ${member.name}`}
				className="h-24 w-24 rounded-full border-2 border-border object-cover"
				loading="lazy"
			/>
			
			<h3 className="mt-4 font-display text-lg font-semibold text-text-primary">
				{member.name}
			</h3>
			
			<span className="mt-1 font-mono text-xs uppercase tracking-widest text-accent">
				{member.role}
			</span>

			{member.bio && (
				<p className="mt-3 font-body text-sm text-text-muted">{member.bio}</p>
			)}

			<div className="mt-5 flex gap-3">
				
				<a
					href={member.githubUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="rounded-md border border-border px-3 py-1.5 font-body text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
					aria-label={`GitHub de ${member.name}`}
				>
					GitHub ↗
				</a>
				
				{member.linkedinUrl && (
					<a
						href={member.linkedinUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="rounded-md border border-border px-3 py-1.5 font-body text-xs font-medium text-text-primary transition-colors hover:border-accent hover:text-accent"
						aria-label={`LinkedIn de ${member.name}`}
					>
						LinkedIn ↗
					</a>
				)}
			
			</div>
		
		</Card>
	);
}

export function Team() {
	return (
		<div className="mx-auto max-w-6xl px-6 py-14">
			<span className="coord-rule text-xs">time</span>
			
			<h1 className="mt-2 font-display text-4xl font-semibold text-text-primary sm:text-5xl">
				Equipe
			</h1>
			
			<p className="mt-4 max-w-2xl font-body text-text-muted">
				{teamMembers.length} pessoas dividindo peões, torres e responsabilidades.
			</p>
			{/* mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 */}
			<div className="mt-10 flex flex-wrap justify-center gap-5">
				{teamMembers.map((member) => (
					<TeamMemberCard key={member.id} member={member} />
				))}
			</div>
		
		</div>
	);
}
