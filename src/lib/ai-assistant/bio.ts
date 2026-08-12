import type { AssistantEngine } from './assistant';
import type { AssistantResultMetadata, PortfolioContext } from './types';

/**
 * Maximum number of bio suggestions produced in one run. Kept small so the UI
 * can present each option without overwhelming the user.
 */
export const BIO_SUGGESTION_LIMIT = 5;

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

/** Names of the first `limit` non-empty projects. */
function projectNames(context: PortfolioContext, limit: number): string[] {
	return context.projects
		.map((project) => clean(project.name))
		.filter(Boolean)
		.slice(0, limit);
}

/** Degree and institution of the first education entry, e.g. "B.Sc. from MIT". */
function educationSummary(context: PortfolioContext): string {
	const entry = context.education[0];
	if (!entry) {
		return '';
	}
	const degree = clean(entry.degree);
	const institution = clean(entry.institution);
	if (degree && institution) {
		return `${degree} from ${institution}`;
	}
	return degree || institution;
}

/** Titles of the first `limit` non-empty achievements. */
function achievementTitles(context: PortfolioContext, limit: number): string[] {
	return context.achievements
		.map((achievement) => clean(achievement.title))
		.filter(Boolean)
		.slice(0, limit);
}

/** Names of the first `limit` non-empty certifications. */
function certificationNames(context: PortfolioContext, limit: number): string[] {
	return context.certifications
		.map((certification) => clean(certification.name))
		.filter(Boolean)
		.slice(0, limit);
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
 * Builds the markdown prompt that a real bio provider would receive.
 * Follows the conventions of `src/lib/ai/prompt-builder.ts` and the headline
 * prompt in `./headline.ts`: trimmed lines, `- label: value` fields, skipped
 * empty sections. Deterministic and pure; the mock engine does not consume it,
 * exactly like the existing `generatePortfolio` mock ignores the prepared
 * prompt (`void prompt`).
 */
export function buildBioPrompt(context: PortfolioContext): string {
	const skills = topSkills(context, 6);
	const experience = context.experience[0];
	const projects = context.projects.slice(0, 3);
	const education = context.education[0];
	const achievements = context.achievements.slice(0, 3);
	const certifications = context.certifications.slice(0, 3);

	const parts: string[] = [
		'# Bio Generation',
		'Write a professional portfolio bio / about-section summary of 2–4 sentences.',
		'The bio must be professional, concise, recruiter-friendly, and suitable for a portfolio about section.',
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
	if (education) {
		const degree = clean(education.degree);
		const institution = clean(education.institution);
		if (degree || institution) {
			parts.push(`- Education: ${[degree, institution].filter(Boolean).join(' from ')}`);
		}
	}
	if (achievements.length > 0) {
		parts.push(`- Achievements: ${achievements.map((achievement) => clean(achievement.title)).filter(Boolean).join(', ')}`);
	}
	if (certifications.length > 0) {
		parts.push(`- Certifications: ${certificationNames(context, 3).join(', ')}`);
	}
	parts.push(`- Return up to ${BIO_SUGGESTION_LIMIT} distinct bio options, each as a plain paragraph.`);
	parts.push('- Do not invent any information that is not present in the context.');
	parts.push('- Do not invent jobs, companies, degrees, certifications, achievements, skills, metrics, awards, projects, or experience.');
	parts.push('- Keep every option professional, concise, and grounded in the facts actually listed.');

	return parts.join('\n');
}

/**
 * Deterministic bio candidates derived from the portfolio context, covering
 * professional, concise, technical, recruiter-friendly and personal styles.
 * The mock engine uses these directly; a future real provider replaces this
 * with an AI call that receives `buildBioPrompt(context)`.
 */
function buildBioCandidates(context: PortfolioContext): string[] {
	const name = clean(context.name);
	const headline = clean(context.headline);
	const summarySentence = firstSentence(context.summary);
	const experience = context.experience[0];
	const role = experience ? clean(experience.role) : '';
	const company = experience ? clean(experience.company) : '';
	const skills = topSkills(context, 4);
	const projects = projectNames(context, 2);
	const education = educationSummary(context);
	const achievements = achievementTitles(context, 2);

	const candidates = new Set<string>();

	// Professional: name + most recent role/company + first summary sentence.
	candidates.add(
		joinSentences(
			role ? `${name ? `${name} ` : ''}is a ${role}${company ? ` at ${company}` : ''}` : name,
			summarySentence
		)
	);

	// Concise: name + headline/role + primary skills.
	candidates.add(
		name && headline
			? joinSentences(`${name} — ${headline}`, skills.length > 0 ? `Specializes in ${skills.join(', ')}` : undefined)
			: joinSentences(name, role, skills.length > 0 ? `Specializes in ${skills.join(', ')}` : undefined)
	);

	// Technical: role + hands-on skills + notable projects.
	candidates.add(
		joinSentences(
			role ? `Works as a ${role}` : undefined,
			skills.length > 0 ? `Experienced with ${skills.join(', ')}` : undefined,
			projects.length > 0 ? `Notable projects include ${projects.join(', ')}` : undefined
		)
	);

	// Recruiter-friendly: crisp value prop with skills + summary.
	candidates.add(
		joinSentences(
			role ? (skills.length > 0 ? `${role} with expertise in ${skills.join(', ')}` : role) : undefined,
			summarySentence
		)
	);

	// Personal / authentic: name + headline + summary + education + a highlight.
	candidates.add(
		joinSentences(
			name,
			headline,
			summarySentence,
			education ? `Education: ${education}` : undefined,
			achievements.length > 0 ? `Highlight: ${achievements[0]}` : undefined
		)
	);

	return Array.from(candidates)
		.filter(Boolean)
		.slice(0, BIO_SUGGESTION_LIMIT);
}

function metadataFor(): AssistantResultMetadata {
	return {
		feature: 'bio',
		generatedAt: new Date().toISOString(),
		source: 'mock',
	};
}

/**
 * The Bio Generator engine. Produces user-safe bio/about-section options from
 * the portfolio context and returns them as a numbered list in `content`.
 */
export const bioAssistantEngine: AssistantEngine = (request, context) => {
	if (!context) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a portfolio to generate bios.',
		};
	}

	const candidates = buildBioCandidates(context);
	if (candidates.length === 0) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error:
				'Not enough portfolio content to generate a bio yet. Add your name, role, summary, or skills first.',
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
