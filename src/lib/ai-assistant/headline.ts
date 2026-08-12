import type { AssistantEngine } from './assistant';
import type { AssistantResultMetadata, PortfolioContext } from './types';

/**
 * Maximum number of headline suggestions produced in one run. Kept small so
 * the UI can present each option without overwhelming the user.
 */
export const HEADLINE_SUGGESTION_LIMIT = 5;

/** Trims whitespace and returns '' for empty input. */
function clean(value: string | undefined): string {
	return (value ?? '').trim();
}

/** Collects the most common skill tokens across all skill entries. */
function topSkills(context: PortfolioContext, limit: number): string[] {
	const seen = new Set<string>();
	const tokens: string[] = [];
	for (const skill of context.skills) {
		for (const token of skill.value.split(',')) {
			const value = token.trim();
			if (value && !seen.has(value)) {
				seen.add(value);
				tokens.push(value);
			}
		}
	}
	return tokens.slice(0, limit);
}

/**
 * Builds the markdown prompt that a real headline provider would receive.
 * Follows the conventions of `src/lib/ai/prompt-builder.ts`: trimmed lines,
 * `- label: value` fields, skipped empty sections. Deterministic and pure;
 * the mock engine below does not consume it, exactly like the existing
 * `generatePortfolio` mock ignores the prepared prompt (`void prompt`).
 */
export function buildHeadlinePrompt(context: PortfolioContext): string {
	const skills = topSkills(context, 6);
	const experience = context.experience[0];
	const projects = context.projects.slice(0, 3);

	const parts: string[] = [
		'# Headline Generation',
		'Generate a short, professional headline — one line, under 70 characters.',
		'The headline must be specific rather than generic, recruiter-friendly, and suitable for a portfolio hero section.',
		'Use ONLY the supplied portfolio context below.',
	];
	if (context.name) {
		parts.push(`- Name: ${context.name}`);
	}
	if (context.headline) {
		parts.push(`- Current headline: ${context.headline}`);
	}
	if (context.summary) {
		parts.push(`- Summary: ${context.summary}`);
	}
	if (experience) {
		const role = clean(experience.role);
		const company = clean(experience.company);
		if (role) {
			parts.push(`- Most recent role: ${role}${company ? ` at ${company}` : ''}`);
		}
	}
	if (skills.length > 0) {
		parts.push(`- Skills: ${skills.join(', ')}`);
	}
	if (projects.length > 0) {
		parts.push(`- Notable projects: ${projects.map((project) => clean(project.name)).filter(Boolean).join(', ')}`);
	}
	parts.push(`- Return up to ${HEADLINE_SUGGESTION_LIMIT} distinct options, one per line.`);
	parts.push('- Do not invent any information that is not present in the context.');
	parts.push('- Do not invent job titles, companies, years of experience, degrees, certifications, achievements, technologies, awards, metrics, projects, or responsibilities.');
	parts.push('- Keep every option professional, concise, and grounded in the skills and content actually listed.');

	return parts.join('\n');
}

/**
 * Deterministic headline candidates derived from the portfolio context. The
 * mock engine uses these directly; a future real provider replaces this with
 * an AI call that receives `buildHeadlinePrompt(context)`.
 */
function buildCandidates(context: PortfolioContext): string[] {
	const name = clean(context.name);
	const current = clean(context.headline);
	const experience = context.experience[0];
	const role = experience ? clean(experience.role) : '';
	const company = experience ? clean(experience.company) : '';
	const skills = topSkills(context, 3);
	const projects = context.projects
		.map((project) => clean(project.name))
		.filter(Boolean);

	const candidates = new Set<string>();
	if (current) {
		candidates.add(current);
	}
	if (role) {
		candidates.add(company ? `${role} at ${company}` : role);
	}
	if (role && skills.length > 0) {
		candidates.add(`${role} · ${skills.join(', ')}`);
	}
	if (name && role) {
		candidates.add(`${name} — ${role}`);
	}
	if (skills.length >= 2) {
		candidates.add(`${skills.slice(0, 2).join(' & ')} specialist`);
	}
	if (projects.length > 0 && skills.length > 0) {
		candidates.add(
			`Building ${projects.slice(0, 2).join(' & ')} with ${skills.join(', ')}`
		);
	}
	if (current && skills.length > 0) {
		candidates.add(`${current} | ${skills.join(', ')}`);
	}

	return Array.from(candidates)
		.filter(Boolean)
		.slice(0, HEADLINE_SUGGESTION_LIMIT);
}

function metadataFor(): AssistantResultMetadata {
	return {
		feature: 'headline',
		generatedAt: new Date().toISOString(),
		source: 'mock',
	};
}

/**
 * The Headline Generator engine. Produces user-safe headline options from the
 * portfolio context and returns them as a numbered list in `content`. This is
 * Task 2's first wired assistant feature; other features still report
 * "not available yet" until their Day-10 tasks land.
 */
export const headlineAssistantEngine: AssistantEngine = (request, context) => {
	if (!context) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a portfolio to generate headlines.',
		};
	}

	const candidates = buildCandidates(context);
	if (candidates.length === 0) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error:
				'Not enough portfolio content to generate a headline yet. Add your name, role, or skills first.',
		};
	}

	const content = candidates
		.map((candidate, index) => `${index + 1}. ${candidate}`)
		.join('\n');

	return {
		ok: true,
		feature: request.feature,
		content,
		metadata: metadataFor(),
		error: null,
	};
};
