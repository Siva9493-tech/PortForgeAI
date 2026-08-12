import type { PortfolioProject } from '../ai';
import type { AssistantEngine } from './assistant';
import type { AssistantResultMetadata, PortfolioContext } from './types';

/**
 * Maximum number of project description suggestions produced in one run.
 */
export const PROJECT_DESCRIPTION_SUGGESTION_LIMIT = 4;

/** Trims whitespace and returns '' for empty input. */
function clean(value: string | undefined): string {
	return (value ?? '').trim();
}

/** First sentence of a text, or '' when empty. */
function firstSentence(value: string | undefined): string {
	const text = clean(value);
	return text.split(/[.!?\n]/, 1)[0]?.trim() ?? '';
}

/** Joins present sentences with '. ' and a trailing period. */
function joinSentences(...parts: Array<string | undefined>): string {
	const sentences = parts
		.map((part) => clean(part).replace(/[.!?]+$/, ''))
		.filter(Boolean);
	return sentences.length > 0 ? `${sentences.join('. ')}.` : '';
}

/**
 * Builds the markdown prompt that a real project-description provider would
 * receive. Follows the conventions of the headline and bio prompts: trimmed
 * lines, `- label: value` fields, skipped empty fields. Deterministic and
 * pure; the mock engine does not consume it — it is the future-provider seam.
 */
export function buildProjectDescriptionPrompt(
	context: PortfolioContext,
	project: PortfolioProject
): string {
	const name = clean(project.name);
	const role = clean(project.role);
	const description = clean(project.description);
	const technologies = project.technologies
		.map((technology) => clean(technology))
		.filter(Boolean);
	const highlights = project.highlights
		.map((highlight) => clean(highlight))
		.filter(Boolean);
	const repository = clean(project.repositoryUrl);
	const liveUrl = clean(project.liveUrl);

	const parts: string[] = [
		'# Project Description Generation',
		'Write a professional project description of 2–4 sentences for a portfolio.',
		'The description must be professional, concise, technically clear, recruiter-friendly, and portfolio appropriate.',
		'Use ONLY the supplied project and portfolio context below.',
	];
	if (name) {
		parts.push(`- Project name: ${name}`);
	}
	if (role) {
		parts.push(`- User's role in this project: ${role}`);
	}
	if (description) {
		parts.push(`- Existing description: ${description}`);
	}
	if (technologies.length > 0) {
		parts.push(`- Technologies: ${technologies.join(', ')}`);
	}
	if (highlights.length > 0) {
		parts.push(`- Highlights: ${highlights.join('; ')}`);
	}
	if (repository) {
		parts.push(`- Repository URL: ${repository}`);
	}
	if (liveUrl) {
		parts.push(`- Live demo URL: ${liveUrl}`);
	}
	if (context.name || context.headline || context.summary) {
		parts.push(`- Portfolio owner: ${[context.name, context.headline].filter(Boolean).join(' — ') || context.name}`);
	}
	parts.push(`- Return up to ${PROJECT_DESCRIPTION_SUGGESTION_LIMIT} distinct description options, each as a plain paragraph.`);
	parts.push('- Do not invent any information that is not present in the context.');
	parts.push('- Do not invent users, revenue, performance numbers, percentages, company usage, awards, deployments, responsibilities, technologies, or achievements.');
	parts.push('- Keep every option grounded in the project facts actually listed.');

	return parts.join('\n');
}

/**
 * Deterministic description candidates derived from a single project's actual
 * data. The mock engine uses these directly; a future real provider replaces
 * this with an AI call that receives `buildProjectDescriptionPrompt(...)`.
 */
function buildProjectCandidates(project: PortfolioProject): string[] {
	const name = clean(project.name);
	const role = clean(project.role);
	const descriptionSentence = firstSentence(project.description);
	const technologies = project.technologies
		.map((technology) => clean(technology))
		.filter(Boolean);
	const highlights = project.highlights
		.map((highlight) => clean(highlight))
		.filter(Boolean);

	const candidates = new Set<string>();

	// Concise professional: name + role + existing description + stack.
	candidates.add(
		joinSentences(
			role ? `${name} — ${role}` : name,
			descriptionSentence,
			technologies.length > 0 ? `Built with ${technologies.join(', ')}` : undefined
		)
	);

	// Technical: existing description + role + technologies + highlights.
	candidates.add(
		joinSentences(
			descriptionSentence,
			role ? `My role: ${role}` : undefined,
			technologies.length > 0 ? `Technologies: ${technologies.join(', ')}` : undefined,
			highlights.length > 0 ? `Highlights: ${highlights.join('; ')}` : undefined
		)
	);

	// Recruiter-friendly: role-driven opener + description + stack.
	candidates.add(
		joinSentences(
			role ? `${role} behind ${name}` : name,
			descriptionSentence,
			technologies.length > 0 ? `Built with ${technologies.join(', ')}` : undefined,
			highlights.length > 0 ? highlights[0] : undefined
		)
	);

	// Impact-focused: highlights first, then description + stack.
	candidates.add(
		joinSentences(
			highlights.length > 0 ? highlights.join('; ') : undefined,
			descriptionSentence,
			technologies.length > 0 ? `Tech stack: ${technologies.join(', ')}` : undefined
		)
	);

	return Array.from(candidates)
		.filter(Boolean)
		.slice(0, PROJECT_DESCRIPTION_SUGGESTION_LIMIT);
}

/** Resolves a project by stable id first, then by name. */
function resolveProject(
	context: PortfolioContext,
	target: string
): PortfolioProject | undefined {
	const key = clean(target);
	return (
		context.projects.find((project) => clean(project.id) === key) ??
		context.projects.find((project) => clean(project.name) === key)
	);
}

function metadataFor(): AssistantResultMetadata {
	return {
		feature: 'project-description',
		generatedAt: new Date().toISOString(),
		source: 'mock',
	};
}

/**
 * The Project Description engine. The selected project is carried in
 * `request.target` (its stable id when available, otherwise its name). It
 * produces user-safe description options from the project's actual data.
 */
export const projectDescriptionAssistantEngine: AssistantEngine = (
	request,
	context
) => {
	if (!context) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a portfolio to generate project descriptions.',
		};
	}
	if (!request.target) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a project to generate a description.',
		};
	}

	const project = resolveProject(context, request.target);
	if (!project) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'The selected project could not be found in this portfolio.',
		};
	}

	const candidates = buildProjectCandidates(project);
	if (candidates.length === 0) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'This project has no content yet. Add a name or description first.',
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
