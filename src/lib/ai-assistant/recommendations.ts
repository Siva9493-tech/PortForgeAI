import type { AssistantEngine } from './assistant';
import type { AssistantResultMetadata, PortfolioContext } from './types';

/**
 * Maximum number of prioritized recommendations produced in one run. Kept
 * small so the engine only surface the most impactful improvements.
 */
export const RECOMMENDATION_LIMIT = 8;

/** Trims whitespace and returns '' for empty input. */
function clean(value: string | undefined): string {
	return (value ?? '').trim();
}

/** Every skill token from the skills section, comma-separated values split. */
function skillTokens(context: PortfolioContext): string[] {
	const tokens: string[] = [];
	for (const skill of context.skills) {
		for (const token of skill.value.split(',')) {
			const value = clean(token);
			if (value) {
				tokens.push(value);
			}
		}
	}
	return tokens;
}

/** Projects that have a live or repository link configured. */
function projectsWithLinks(context: PortfolioContext): number {
	let count = 0;
	for (const project of context.projects) {
		if (clean(project.liveUrl) || clean(project.repositoryUrl)) {
			count += 1;
		}
	}
	return count;
}

/** Number of non-empty social link fields; -1 when the social block is absent. */
function socialFieldCount(context: PortfolioContext): number {
	if (!context.social) {
		return -1;
	}
	const social = context.social;
	return [social.linkedin, social.github, social.website, social.twitter, social.instagram, social.youtube, social.other].filter((value) =>
		Boolean(clean(value))
	).length;
}

const hasProjects = (context: PortfolioContext): boolean => context.projects.length > 0;
const hasExperience = (context: PortfolioContext): boolean => context.experience.length > 0;

interface Recommendation {
	title: string;
	category: string;
	reason: string;
	action: string;
	priority: 'High' | 'Medium' | 'Low';
}

/**
 * Builds the deterministic, data-grounded recommendation set.
 *
 * Each rule fires only on an observed gap in the real context (empty field,
 * missing section, too-short content, untrusted count). No metrics, outcomes,
 * rank, or market claims are ever stated — every reason references the actual
 * portfolio data. If the portfolio is already strong in an area, no
 * recommendation is produced for it, so a healthy portfolio yields none.
 */
function buildRecommendations(context: PortfolioContext): Recommendation[] {
	const recommendations: Recommendation[] = [];
	const name = clean(context.name);
	const headline = clean(context.headline);
	const summary = clean(context.summary);
	const tinyDescriptionLength = 40;

	// 1. Missing professional identity.
	if (!name) {
		recommendations.push({
			title: 'Add your name to the portfolio',
			category: 'Profile',
			reason: 'The portfolio carries no visible name, so it is unclear who owns the work.',
			action: 'Set your name in the portfolio settings so the identity is obvious at a glance.',
			priority: 'High',
		});
	}

	// 2. Missing professional headline.
	if (name && !headline) {
		recommendations.push({
			title: 'Craft a professional headline',
			category: 'Headline',
			reason: `${name} has no professional headline, so viewers cannot see the role or focus at a glance.`,
			action: 'Use the Headline Generator in this assistant to draft a concise headline, then set it in the portfolio.',
			priority: 'High',
		});
	}

	// 3. Missing or very short about summary.
	if (!summary) {
		recommendations.push({
			title: 'Write an about summary',
			category: 'Bio / About',
			reason: 'No about summary is present, leaving the introduction thin.',
			action: 'Write 2–3 sentences covering your role and focus, or use the Bio Generator in this assistant.',
			priority: 'High',
		});
	}

	// 4. No projects yet.
	if (!hasProjects(context)) {
		recommendations.push({
			title: 'Show your work with projects',
			category: 'Projects',
			reason: 'No projects are listed, so there is nothing hands-on to evaluate.',
			action:
				'Add at least one project with your role, technologies, and a description. Add it directly to the portfolio.',
			priority: 'High',
		});
	}

	// 5. Projects lack links.
	if (hasProjects(context) && projectsWithLinks(context) === 0) {
		recommendations.push({
			title: 'Add links to your projects',
			category: 'Project links',
			reason: `None of the ${context.projects.length} project${context.projects.length === 1 ? '' : 's'} has a live site or repository link.`,
			action: 'Add a live URL and/or repository URL to each project so the work can be inspected.',
			priority: 'High',
		});
	}

	// 6. Projects with too-brief descriptions (name the specific project).
	if (hasProjects(context)) {
		const brief = context.projects.filter((project) => {
			const description = clean(project.description);
			return description.length > 0 && description.length < tinyDescriptionLength;
		});
		if (brief.length > 0) {
			const title = brief.length === 1 ? `Expand the description of "${clean(brief[0].name) || 'Untitled project'}"` : 'Expand thin project descriptions';
			const names = brief.slice(0, 2).map((project) => clean(project.name) || 'Untitled project').join('", "');
			recommendations.push({
				title,
				category: 'Projects',
				reason:
					brief.length === 1
						? `The description for "${names}" is very brief and says little about the work done.`
						: `The descriptions for "${names}"${brief.length > 2 ? ' and other projects' : ''} are very brief and say little about the work done.`,
				action: 'Rewrite each description to state what the project does and any genuine outcomes, if available.',
				priority: 'Medium',
			});
		}
	}

	// 7. Missing experience descriptions (name the specific role).
	if (hasExperience(context)) {
		const withoutDescription = context.experience.filter((entry) => !clean(entry.description));
		if (withoutDescription.length > 0) {
			const entry = withoutDescription[0];
			const label = [clean(entry.role), clean(entry.company)].filter(Boolean).join(' at ') || 'an experience entry';
			recommendations.push({
				title: withoutDescription.length === 1 ? `Describe your role${label === 'an experience entry' ? '' : ` at "${label}"`}` : 'Describe your experience entries',
				category: 'Experience',
				reason:
					withoutDescription.length === 1
						? `The entry${label === 'an experience entry' ? '' : ` for "${label}"`} has no description of responsibilities or outcomes.`
						: `${withoutDescription.length} experience entr${withoutDescription.length === 1 ? 'y has' : 'ies have'} no description of responsibilities or outcomes.`,
				action: 'Add a short description of the role and any real outcomes for each entry.',
				priority: 'Medium',
			});
		} else {
			const brief = context.experience.filter((entry) => {
				const description = clean(entry.description);
				return description.length > 0 && description.length < tinyDescriptionLength;
			});
			if (brief.length > 0) {
				const entry = brief[0];
				const label = [clean(entry.role), clean(entry.company)].filter(Boolean).join(' at ') || 'an experience entry';
				recommendations.push({
					title: 'Expand thin experience descriptions',
					category: 'Experience',
					reason: `The description for "${label}" is very brief and could say more about the responsibilities.`,
					action: 'Expand it with concrete responsibilities and any genuine outcomes.',
					priority: 'Low',
				});
			}
		}
	}

	// 8. No social / contact links.
	const socialFields = socialFieldCount(context);
	if (socialFields === -1 || socialFields === 0) {
		recommendations.push({
			title: 'Add contact and social links',
			category: 'Social links',
			reason: 'No social or contact links are present, so there is no way to reach you from the portfolio.',
			action: 'Add at least a LinkedIn and GitHub or website link to the social section.',
			priority: 'Medium',
		});
	}

	// 9. No SEO keywords.
	if (!context.keywords || context.keywords.length === 0) {
		recommendations.push({
			title: 'Add SEO keywords',
			category: 'SEO',
			reason: 'The portfolio has no keywords, leaving the SEO description untargeted.',
			action: 'Add a few accurate keywords that reflect your actual role and stack.',
			priority: 'Low',
		});
	}

	// 10. Skills are listed, but nothing demonstrates them.
	if (skillTokens(context).length > 0 && !hasProjects(context) && !hasExperience(context)) {
		recommendations.push({
			title: 'Demonstrate your skills with projects or experience',
			category: 'Skills',
			reason: 'Skills are listed, but there are no projects or experience to back them up.',
			action:
				'Add at least one project or experience entry so the listed skills point to concrete work.',
			priority: 'High',
		});
	}

	// 11. Projects exist but experience is absent.
	if (hasProjects(context) && !hasExperience(context)) {
		recommendations.push({
			title: 'Consider adding work experience',
			category: 'Experience',
			reason: 'Projects are listed, but no work experience entries are present.',
			action:
				'Add your roles and companies if applicable, with responsibilities and outcomes.',
			priority: 'Low',
		});
	}

	// Order by priority so the cap keeps the most impactful items.
	const rank = { High: 0, Medium: 1, Low: 2 } as const;
	return recommendations
		.sort((a, b) => rank[a.priority] - rank[b.priority])
		.slice(0, RECOMMENDATION_LIMIT);
}

/**
 * Builds the markdown prompt that a real recommendations provider would
 * receive. Describes the portfolio's actual sections and instructs the
 * provider to return Title / Category / Reason / Suggested action / Priority
 * blocks grounded only in that context, without fabricating metrics or
 * hiring outcomes. Deterministic and pure; the mock engine does not consume
 * it.
 */
export function buildRecommendationsPrompt(context: PortfolioContext): string {
	const parts: string[] = [
		'# AI Recommendations',
		'Recommend the highest-impact improvements for the supplied portfolio.',
		'For each recommendation return exactly five lines: Title, Category, Reason, Suggested action, Priority (High/Medium/Low).',
		'Use ONLY the supplied portfolio information. Recommend improvements only where a real gap exists.',
		'Do not invent facts, metrics, outcomes, or statistics the portfolio does not contain.',
		'Do not claim that following a recommendation guarantees employment, interviews, ATS success, recruiter attention, salary, or ranking.',
		'Prioritize the most impactful changes; do not pad with unnecessary tweaks.',
	];
	const pushSection = (title: string, lines: readonly (string | null | undefined)[]): void => {
		const present = lines.filter(Boolean);
		if (present.length > 0) {
			parts.push(`- ${title}: ${present.join('; ')}`);
		} else {
			parts.push(`- ${title}: none`);
		}
	};
	pushSection('Profile', [context.name, context.headline, context.summary]);
	if (context.keywords && context.keywords.length > 0) {
		parts.push(`- SEO keywords: ${context.keywords.join(', ')}`);
	} else {
		parts.push('- SEO keywords: none');
	}
	pushSection(
		'Skills',
		context.skills.map((skill) => `${skill.category}: ${skill.value}`)
	);
	pushSection(
		'Projects',
		context.projects.map(
			(project) =>
				`${project.name} (${project.role || 'role not set'}) — technologies: ${project.technologies.join(', ') || 'none'}; live URL: ${project.liveUrl || 'none'}; repository URL: ${project.repositoryUrl || 'none'}; description: ${project.description || 'none'}`
		)
	);
	pushSection(
		'Experience',
		context.experience.map(
			(entry) => `${entry.role} at ${entry.company} — description: ${entry.description || 'none'}`
		)
	);
	pushSection(
		'Education',
		context.education.map((entry) => `${entry.degree} from ${entry.institution}`)
	);
	pushSection(
		'Certifications',
		context.certifications.map((certification) => certification.name)
	);
	pushSection(
		'Achievements',
		context.achievements.map((achievement) => achievement.title)
	);
	pushSection('Social links', [
		context.social?.linkedin,
		context.social?.github,
		context.social?.website,
		context.social?.twitter,
		context.social?.instagram,
		context.social?.youtube,
		context.social?.other,
	]);
	parts.push(`- Return up to ${RECOMMENDATION_LIMIT} distinct recommendations, separated by a blank line.`);
	parts.push('- Phrase every recommendation as an action the user can take; never as a fact already in the portfolio.');

	return parts.join('\n');
}

function metadataFor(): AssistantResultMetadata {
	return {
		feature: 'recommendations',
		generatedAt: new Date().toISOString(),
		source: 'mock',
	};
}

/**
 * The AI Recommendations engine. Produces prioritized, actionable,
 * data-grounded recommendations (Title / Category / Reason / Suggested
 * action / Priority blocks separated by blank lines) from the portfolio
 * context. Read-only — it never modifies a portfolio.
 */
export const recommendationsAssistantEngine: AssistantEngine = (request, context) => {
	if (!context) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a portfolio to get recommendations.',
		};
	}

	const recommendations = buildRecommendations(context);
	if (recommendations.length === 0) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error:
				'No improvement recommendations found — the portfolio already covers the main areas we check.',
		};
	}

	const content = recommendations
		.map(
			(recommendation) =>
				`Title: ${recommendation.title}\nCategory: ${recommendation.category}\nReason: ${recommendation.reason}\nSuggested action: ${recommendation.action}\nPriority: ${recommendation.priority}`
		)
		.join('\n\n');

	return {
		ok: true,
		feature: request.feature,
		content,
		metadata: metadataFor(),
		error: null,
	};
};