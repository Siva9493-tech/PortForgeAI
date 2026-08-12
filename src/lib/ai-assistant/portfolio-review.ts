import type { AssistantEngine } from './assistant';
import type { AssistantResultMetadata, PortfolioContext } from './types';

/**
 * Maximum number of review items produced in one run. Covers the full review
 * area set (10 content areas + completeness + consistency).
 */
export const PORTFOLIO_REVIEW_LIMIT = 12;

type ReviewStatus = 'Strong' | 'Good' | 'Needs Improvement' | 'Missing';

interface ReviewItem {
	area: string;
	status: ReviewStatus;
	observation: string;
	recommendation: string;
	priority: string;
}

/** Trims whitespace and returns '' for empty input. */
function clean(value: string | undefined): string {
	return (value ?? '').trim();
}

/** Number of skill tokens in the skills section (comma-separated values). */
function skillTokenCount(context: PortfolioContext): number {
	let count = 0;
	for (const skill of context.skills) {
		for (const token of skill.value.split(',')) {
			if (clean(token)) {
				count += 1;
			}
		}
	}
	return count;
}

/** Number of non-empty social link fields, or -1 when social is absent. */
function socialFieldCount(context: PortfolioContext): number {
	if (!context.social) {
		return -1;
	}
	const social = context.social;
	return [social.linkedin, social.github, social.website, social.twitter, social.instagram, social.youtube, social.other].filter((value) =>
		Boolean(clean(value))
	).length;
}

/** Formats a review item as a copyable text block. */
function formatItem(item: ReviewItem): string {
	return [
		`Area: ${item.area}`,
		`Status: ${item.status}`,
		`Observation: ${item.observation}`,
		`Recommendation: ${item.recommendation}`,
		`Priority: ${item.priority}`,
	].join('\n');
}

/**
 * Residual check for empty fields used to compose grounded observations.
 */
const hasProjects = (context: PortfolioContext): boolean => context.projects.length > 0;
const hasExperience = (context: PortfolioContext): boolean => context.experience.length > 0;

/** Builds the deterministic set of review items from the actual context. */
function buildReviewItems(context: PortfolioContext): ReviewItem[] {
	const items: ReviewItem[] = [];
	const name = clean(context.name);
	const headline = clean(context.headline);
	const summary = clean(context.summary);
	const skillTokens = skillTokenCount(context);

	// 1. Profile / Introduction.
	if (name && headline && summary) {
		items.push({
			area: 'Profile / Introduction',
			status: 'Good',
			observation: 'Your name, headline and summary are all present.',
			recommendation: 'No change needed.',
			priority: 'Low',
		});
	} else if (name && !headline && !summary) {
		items.push({
			area: 'Profile / Introduction',
			status: 'Needs Improvement',
			observation: 'Your name is present, but the introduction has no headline or summary.',
			recommendation: 'Add a short professional headline and a 2–3 sentence summary.',
			priority: 'High',
		});
	} else if (name || headline || summary) {
		items.push({
			area: 'Profile / Introduction',
			status: 'Needs Improvement',
			observation: 'The introduction is partially complete.',
			recommendation: 'Fill in the missing name, headline, or summary fields.',
			priority: 'High',
		});
	} else {
		items.push({
			area: 'Profile / Introduction',
			status: 'Missing',
			observation: 'No name, headline, or summary was found.',
			recommendation: 'Add your name, a professional headline, and a short summary.',
			priority: 'High',
		});
	}

	// 2. Headline / Positioning.
	if (headline) {
		items.push({
			area: 'Headline / Positioning',
			status: headline.length >= 10 ? 'Good' : 'Needs Improvement',
			observation: headline.length >= 10
				? 'A professional headline is set.'
				: 'The current headline is very short and may not position you clearly.',
			recommendation: headline.length >= 10
				? 'No change needed.'
				: 'Expand the headline so it communicates your focus at a glance.',
			priority: headline.length >= 10 ? 'Low' : 'High',
		});
	} else {
		items.push({
			area: 'Headline / Positioning',
			status: 'Missing',
			observation: 'No professional headline was found.',
			recommendation: 'Draft a headline using the Headline Generator in this assistant.',
			priority: 'High',
		});
	}

	// 3. About / Bio.
	if (summary) {
		items.push({
			area: 'About / Bio',
			status: summary.length >= 80 ? 'Good' : 'Needs Improvement',
			observation: summary.length >= 80
				? 'A substantive about summary is present.'
				: 'The summary is brief; it could say more about your experience.',
			recommendation: summary.length >= 80
				? 'No change needed.'
				: 'Expand it to 2–3 sentences using the Bio Generator in this assistant.',
			priority: summary.length >= 80 ? 'Low' : 'Medium',
		});
	} else {
		items.push({
			area: 'About / Bio',
			status: 'Missing',
			observation: 'No about / bio content was found.',
			recommendation: 'Draft a bio using the Bio Generator in this assistant.',
			priority: 'High',
		});
	}

	// 4. Skills.
	if (skillTokens === 0) {
		items.push({
			area: 'Skills',
			status: 'Missing',
			observation: 'No skills are listed.',
			recommendation: 'Add your technologies, tools, and strengths to the skills section.',
			priority: 'High',
		});
	} else {
		items.push({
			area: 'Skills',
			status: skillTokens >= 3 ? 'Good' : 'Needs Improvement',
			observation: skillTokens >= 3
				? `${skillTokens} skills are listed.`
				: `Only ${skillTokens} skill${skillTokens === 1 ? ' is' : 's are'} listed.`,
			recommendation: skillTokens >= 3
				? 'No change needed.'
				: 'List more granular skills so recruiters can see your full range.',
			priority: skillTokens >= 3 ? 'Low' : 'Medium',
		});
	}

	// 5. Projects.
	if (context.projects.length === 0) {
		items.push({
			area: 'Projects',
			status: 'Missing',
			observation: 'No projects were found.',
			recommendation: 'Add your projects to show hands-on work and outcomes.',
			priority: 'High',
		});
	} else if (context.projects.length === 1) {
		items.push({
			area: 'Projects',
			status: 'Needs Improvement',
			observation: 'Only one project is listed.',
			recommendation: 'Consider adding more projects so recruiters get a fuller picture of your work.',
			priority: 'Medium',
		});
	} else {
		const withoutDescription = context.projects.filter((project) => !clean(project.description)).length;
		items.push({
			area: 'Projects',
			status: withoutDescription > 0 ? 'Needs Improvement' : 'Good',
			observation: withoutDescription > 0
				? `${context.projects.length} projects are listed, but ${withoutDescription} lack${withoutDescription === 1 ? 's' : ''} a description.`
				: `${context.projects.length} projects are listed with descriptions.`,
			recommendation: withoutDescription > 0
				? 'Add a clear description (and any genuine outcomes) to each project using the Project Description Generator in this assistant.'
				: 'No change needed.',
			priority: withoutDescription > 0 ? 'High' : 'Low',
		});
	}

	// 6. Experience.
	if (context.experience.length === 0) {
		items.push({
			area: 'Experience',
			status: 'Missing',
			observation: 'No work experience entries were found.',
			recommendation: 'Add your roles, companies, and responsibilities if applicable.',
			priority: 'Medium',
		});
	} else {
		const withoutDescription = context.experience.filter((entry) => !clean(entry.description)).length;
		items.push({
			area: 'Experience',
			status: withoutDescription > 0 ? 'Needs Improvement' : 'Good',
			observation: withoutDescription > 0
				? `${context.experience.length} experience entries are listed, but ${withoutDescription} lack${withoutDescription === 1 ? 's' : ''} a description.`
				: `${context.experience.length} experience entr${context.experience.length === 1 ? 'y is' : 'ies are'} listed.`,
			recommendation: withoutDescription > 0
				? 'Add a short description of responsibilities or outcomes for each entry.'
				: 'No change needed.',
			priority: withoutDescription > 0 ? 'Medium' : 'Low',
		});
	}

	// 7. Education.
	items.push(
		context.education.length > 0
			? {
					area: 'Education',
					status: 'Good' as const,
					observation: `${context.education.length} education entr${context.education.length === 1 ? 'y is' : 'ies are'} listed.`,
					recommendation: 'No change needed.',
					priority: 'Low',
				}
			: {
					area: 'Education',
					status: 'Missing' as const,
					observation: 'No education entries were found.',
					recommendation: 'Add your degrees and institutions if applicable.',
					priority: 'Medium',
				}
	);

	// 8. Certifications.
	items.push(
		context.certifications.length > 0
			? {
					area: 'Certifications',
					status: 'Good' as const,
					observation: `${context.certifications.length} certification${context.certifications.length === 1 ? '' : 's'} ${context.certifications.length === 1 ? 'is' : 'are'} listed.`,
					recommendation: 'No change needed.',
					priority: 'Low',
				}
			: {
					area: 'Certifications',
					status: 'Missing' as const,
					observation: 'No certifications were found.',
					recommendation: 'Add any relevant certifications you hold.',
					priority: 'Low',
				}
	);

	// 9. Achievements.
	items.push(
		context.achievements.length > 0
			? {
					area: 'Achievements',
					status: 'Good' as const,
					observation: `${context.achievements.length} achievement${context.achievements.length === 1 ? '' : 's'} ${context.achievements.length === 1 ? 'is' : 'are'} listed.`,
					recommendation: 'No change needed.',
					priority: 'Low',
				}
			: {
					area: 'Achievements',
					status: 'Missing' as const,
					observation: 'No achievements were found.',
					recommendation: 'Add any genuine awards or notable outcomes you have.',
					priority: 'Low',
				}
	);

	// 10. Contact / Social Links.
	const socialFields = socialFieldCount(context);
	if (socialFields === -1 || socialFields === 0) {
		items.push({
			area: 'Contact / Social Links',
			status: 'Missing',
			observation: 'No social or contact links were found.',
			recommendation: 'Add at least a LinkedIn and GitHub or website link.',
			priority: 'Medium',
		});
	} else {
		items.push({
			area: 'Contact / Social Links',
			status: socialFields >= 2 ? 'Good' : 'Needs Improvement',
			observation: socialFields >= 2
				? `${socialFields} social or contact links are present.`
				: 'Only one social or contact link is present.',
			recommendation: socialFields >= 2
				? 'No change needed.'
				: 'Add one or two more channels (LinkedIn, GitHub, or a personal site).',
			priority: socialFields >= 2 ? 'Low' : 'Medium',
		});
	}

	// 11. Portfolio completeness (internal quality indicator, content only).
	const indicators: Array<[string, boolean]> = [
		['Name', Boolean(name)],
		['Headline', Boolean(headline)],
		['About / Bio', Boolean(summary)],
		['Skills', skillTokens > 0],
		['Projects', hasProjects(context)],
		['Experience', hasExperience(context)],
		['Education', context.education.length > 0],
		['Certifications', context.certifications.length > 0],
		['Achievements', context.achievements.length > 0],
		['Contact / Social Links', socialFields > 0],
	];
	const present = indicators.filter(([, isPresent]) => isPresent).length;
	const missingNames = indicators
		.filter(([, isPresent]) => !isPresent)
		.map(([label]) => label);
	items.push({
		area: 'Portfolio completeness',
		status: present >= 8 ? 'Strong' : present >= 5 ? 'Good' : present >= 2 ? 'Needs Improvement' : 'Missing',
		observation: `${present} of ${indicators.length} major sections are present.`,
		recommendation:
			missingNames.length > 0
				? `Missing: ${missingNames.join(', ')}.`
				: 'All major sections are present.',
		priority: 'Medium',
	});

	// 12. Content consistency.
	const issues: string[] = [];
	if (hasProjects(context) && skillTokens === 0) {
		issues.push('Projects are listed, but the skills section is empty — your project stack is not communicated.');
	}
	if (!hasProjects(context) && !hasExperience(context) && skillTokens > 0) {
		issues.push('Skills are listed, but there are no projects or experience to demonstrate them.');
	}
	if (headline && !summary) {
		issues.push('A headline is set, but no summary is present, leaving the introduction incomplete.');
	}
	if (!headline && summary) {
		issues.push('A summary is present, but no headline is set to position you quickly.');
	}
	items.push(
		issues.length > 0
			? {
					area: 'Content consistency',
					status: 'Needs Improvement',
					observation: issues.join(' '),
					recommendation: 'Add the missing counterpart content so the portfolio tells one coherent story.',
					priority: 'Medium',
				}
			: {
					area: 'Content consistency',
					status: 'Strong',
					observation: 'Content across sections is broadly consistent.',
					recommendation: 'No adjustment needed.',
					priority: 'Low',
				}
	);

	return items.slice(0, PORTFOLIO_REVIEW_LIMIT);
}

/**
 * Builds the markdown prompt that a real portfolio-review provider would
 * receive. Describes the portfolio's actual sections and instructs the
 * provider to return Area / Status / Observation / Recommendation / Priority
 * blocks grounded only in that context. Deterministic and pure; the mock
 * engine does not consume it.
 */
export function buildPortfolioReviewPrompt(context: PortfolioContext): string {
	const parts: string[] = [
		'# Portfolio Review',
		'Review the supplied portfolio and return a structured review.',
		'For each review item return exactly five lines: Area, Status, Observation, Recommendation, Priority (High/Medium/Low).',
		"Use only the supplied portfolio information. Identify strengths AND gaps. Prioritize the most impactful improvements.",
		'Distinguish missing information from weak information. Do not fabricate any facts, metrics, or claims.',
		'Do not present hiring or job-market guarantees, ATS scores, or external statistics.',
		'Use these statuses only: Strong, Good, Needs Improvement, Missing.',
	];
	const pushSection = (title: string, lines: string[]): void => {
		const present = lines.filter(Boolean);
		if (present.length > 0) {
			parts.push(`- ${title}: ${present.join('; ')}`);
		} else {
			parts.push(`- ${title}: none`);
		}
	};
	pushSection('Profile', [context.name, context.headline, context.summary]);
	pushSection(
		'Skills',
		context.skills.map((skill) => `${skill.category}: ${skill.value}`)
	);
	pushSection(
		'Projects',
		context.projects.map(
			(project) =>
				`${project.name} (${project.role || 'role not set'}) — technologies: ${project.technologies.join(', ') || 'none'}; description: ${project.description || 'none'}`
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
	parts.push(`- Return up to ${PORTFOLIO_REVIEW_LIMIT} review items, separated by a blank line.`);

	return parts.join('\n');
}

function metadataFor(): AssistantResultMetadata {
	return {
		feature: 'portfolio-review',
		generatedAt: new Date().toISOString(),
		source: 'mock',
	};
}

/**
 * The Portfolio Review engine. Produces structured, advisory feedback (Area /
 * Status / Observation / Recommendation / Priority blocks separated by blank
 * lines) from the portfolio context. Read-only — it never changes anything.
 */
export const portfolioReviewAssistantEngine: AssistantEngine = (request, context) => {
	if (!context) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a portfolio to review.',
		};
	}

	const items = buildReviewItems(context);
	const content = items.map(formatItem).join('\n\n');

	return {
		ok: true,
		feature: request.feature,
		content,
		metadata: metadataFor(),
		error: null,
	};
};