import type { AssistantEngine } from './assistant';
import type { AssistantResultMetadata, PortfolioContext } from './types';

/**
 * Maximum number of skill improvement suggestions produced in one run.
 */
export const SKILL_SUGGESTION_LIMIT = 6;

/** Normalizes a token to lowercase trimmed form for exact matching. */
function normalize(value: string): string {
	return value.toLowerCase().trim();
}

/** Trims whitespace and returns '' for empty input. */
function clean(value: string | undefined): string {
	return (value ?? '').trim();
}

/** Every skill token from the skills section, comma-separated values split. */
function skillsSectionTokens(context: PortfolioContext): string[] {
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

/** Every skill token from the skills section AND all project technologies. */
function existingSkillTokens(context: PortfolioContext): string[] {
	const tokens = skillsSectionTokens(context);
	for (const project of context.projects) {
		for (const technology of project.technologies) {
			const value = clean(technology);
			if (value) {
				tokens.push(value);
			}
		}
	}
	return tokens;
}

interface SkillsRule {
	skill: string;
	category: string;
	priority: 'High' | 'Medium' | 'Low';
	triggers: string[];
	blockers: string[];
	why: (matched: string) => string;
}

/**
 * Curated complementary / foundational gap rules. A rule fires when one of
 * its trigger skills is actually present in the portfolio and none of its
 * blockers are. Every `why` references the real matched skill, so reasons are
 * grounded in the user's actual data — no invented stats or market claims.
 */
const SKILLS_RULES: readonly SkillsRule[] = [
	{
		skill: 'TypeScript',
		category: 'Complementary',
		priority: 'Medium',
		triggers: ['javascript', 'js', 'react', 'vue', 'angular', 'node', 'node.js', 'nodejs'],
		blockers: ['typescript', 'ts'],
		why: (matched) => `TypeScript adds type safety alongside your ${matched} work.`,
	},
	{
		skill: 'Automated testing',
		category: 'Complementary',
		priority: 'Medium',
		triggers: [
			'react',
			'vue',
			'angular',
			'node',
			'node.js',
			'nodejs',
			'javascript',
			'js',
			'typescript',
			'python',
		],
		blockers: [
			'testing',
			'test',
			'jest',
			'vitest',
			'mocha',
			'cypress',
			'playwright',
			'jasmine',
			'junit',
			'pytest',
			'selenium',
		],
		why: (matched) => `Automated tests complement your ${matched} code and improve long-term maintainability.`,
	},
	{
		skill: 'SQL',
		category: 'Complementary',
		priority: 'Medium',
		triggers: [
			'python',
			'data science',
			'machine learning',
			'pandas',
			'numpy',
			'backend',
			'node',
			'node.js',
			'nodejs',
			'api',
			'rest api',
		],
		blockers: [
			'sql',
			'postgres',
			'postgresql',
			'mysql',
			'mongodb',
			'sqlite',
			'database',
			'databases',
			'sql server',
			'mariadb',
			'oracle',
		],
		why: (matched) => `SQL is useful for working with structured data alongside your ${matched} work.`,
	},
	{
		skill: 'Git & version control',
		category: 'Missing foundational skill',
		priority: 'High',
		triggers: [
			'javascript',
			'js',
			'typescript',
			'python',
			'java',
			'go',
			'golang',
			'c++',
			'c#',
			'ruby',
			'php',
			'swift',
			'kotlin',
			'rust',
			'react',
			'node',
			'node.js',
			'nodejs',
		],
		blockers: ['git', 'github', 'gitlab', 'bitbucket', 'version control', 'svn'],
		why: (matched) => `Version control is foundational for ${matched} development and most collaborative work.`,
	},
	{
		skill: 'JavaScript',
		category: 'Missing foundational skill',
		priority: 'High',
		triggers: ['html', 'css'],
		blockers: ['javascript', 'js', 'typescript', 'react', 'vue', 'angular', 'svelte'],
		why: (matched) => `JavaScript brings interactivity to your ${matched} work.`,
	},
	{
		skill: 'Docker',
		category: 'Complementary',
		priority: 'Medium',
		triggers: ['kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'google cloud', 'cloud', 'devops', 'microservices'],
		blockers: ['docker', 'container', 'containers', 'containerization'],
		why: (matched) => `Containerizing your ${matched} work with Docker improves portability and deployment.`,
	},
	{
		skill: 'CI/CD pipelines',
		category: 'Complementary',
		priority: 'Medium',
		triggers: ['docker', 'kubernetes', 'k8s', 'aws', 'azure', 'gcp', 'google cloud', 'cloud', 'devops'],
		blockers: [
			'ci',
			'cd',
			'ci/cd',
			'github actions',
			'gitlab ci',
			'jenkins',
			'circleci',
			'travis',
			'pipelines',
		],
		why: (matched) => `Automating build and deployment around your ${matched} setup reduces manual release work.`,
	},
	{
		skill: 'Kubernetes',
		category: 'Complementary',
		priority: 'Low',
		triggers: ['docker', 'container', 'containers'],
		blockers: ['kubernetes', 'k8s', 'helm'],
		why: (matched) => `Orchestration complements your ${matched} containerization at scale.`,
	},
	{
		skill: 'REST API design',
		category: 'Complementary',
		priority: 'Low',
		triggers: ['backend', 'node', 'node.js', 'nodejs', 'express', 'frontend', 'react', 'mobile', 'web'],
		blockers: ['rest api', 'restful', 'api design', 'openapi', 'swagger', 'graphql'],
		why: (matched) => `Clean REST API design supports reliable integration with your ${matched} work.`,
	},
	{
		skill: 'Cloud deployment',
		category: 'Complementary',
		priority: 'Low',
		triggers: ['backend', 'node', 'node.js', 'nodejs', 'docker', 'devops'],
		blockers: ['aws', 'azure', 'gcp', 'google cloud', 'cloud', 'heroku', 'vercel', 'netlify', 'firebase'],
		why: (matched) => `Deploying your ${matched} work on a cloud platform makes it easier to share and ship.`,
	},
];

interface Suggestion {
	skill: string;
	category: string;
	why: string;
	priority: string;
}

/** Builds the grounded, deduplicated, capped suggestion set. */
function buildSuggestions(context: PortfolioContext): Suggestion[] {
	const tokens = existingSkillTokens(context);
	const seen = new Set<string>();
	const suggestions: Suggestion[] = [];

	for (const rule of SKILLS_RULES) {
		const key = normalize(rule.skill);
		if (seen.has(key)) {
			continue;
		}
		const blocked = rule.blockers.some((blocker) =>
			tokens.some((token) => normalize(token) === normalize(blocker))
		);
		if (blocked) {
			continue;
		}
		const matched = rule.triggers.find((trigger) =>
			tokens.some((token) => normalize(token) === normalize(trigger))
		);
		if (!matched) {
			continue;
		}
		seen.add(key);
		suggestions.push({
			skill: rule.skill,
			category: rule.category,
			why: rule.why(matched),
			priority: rule.priority,
		});
		if (suggestions.length >= SKILL_SUGGESTION_LIMIT) {
			return suggestions;
		}
	}

	for (const project of context.projects) {
		for (const technology of project.technologies) {
			const value = clean(technology);
			const key = normalize(value);
			if (!value || seen.has(key)) {
				continue;
			}
			const listed = new Set(skillsSectionTokens(context).map(normalize));
			if (listed.has(key)) {
				continue;
			}
			seen.add(key);
			suggestions.push({
				skill: value,
				category: 'Skill related to existing projects',
				why: `Used in your project "${clean(project.name) || 'Untitled project'}"; add it to your skills section to reflect your hands-on experience.`,
				priority: 'Medium',
			});
			if (suggestions.length >= SKILL_SUGGESTION_LIMIT) {
				return suggestions;
			}
		}
	}

	return suggestions;
}

/**
 * Builds the markdown prompt that a real skills-analysis provider would
 * receive. Lists the existing skills and project context, then asks for
 * Skill / Category / Why / Priority blocks grounded only in that context.
 * Deterministic and pure; the mock engine does not consume it.
 */
export function buildSkillsPrompt(context: PortfolioContext): string {
	const tokens = existingSkillTokens(context);
	const education = context.education[0];
	const certifications = context.certifications.slice(0, 3);

	const parts: string[] = [
		'# Skills Improvement Suggestions',
		'Analyze the portfolio skills and suggest a small set of improvement areas.',
		'For each suggestion return exactly four lines: Skill, Category, Why, Priority (High/Medium/Low).',
		'Use ONLY the supplied portfolio context below.',
		'Never claim the user already knows a skill unless it is listed as an existing skill or project technology.',
		'Do not invent statistics or job-market claims. Ground every reason in the actual context.',
	];
	if (tokens.length > 0) {
		parts.push(`- Existing skills and project technologies: ${tokens.join(', ')}`);
	}
	if (context.projects.length > 0) {
		parts.push(`- Projects: ${context.projects.map((project) => clean(project.name)).filter(Boolean).join(', ')}`);
	}
	if (education) {
		parts.push(`- Education: ${[clean(education.degree), clean(education.institution)].filter(Boolean).join(' from ')}`);
	}
	if (certifications.length > 0) {
		parts.push(`- Certifications: ${certifications.map((certification) => clean(certification.name)).filter(Boolean).join(', ')}`);
	}
	parts.push(`- Return up to ${SKILL_SUGGESTION_LIMIT} distinct suggestions, separated by a blank line.`);
	parts.push('- Suggested skills must be phrased as recommendations, never as facts about the user.');

	return parts.join('\n');
}

function metadataFor(): AssistantResultMetadata {
	return {
		feature: 'skills',
		generatedAt: new Date().toISOString(),
		source: 'mock',
	};
}

/**
 * The Skills Improvement engine. Produces grounded, recommendation-only
 * suggestions (Skill / Category / Why / Priority blocks separated by blank
 * lines) from the portfolio context. Never mutates or claims existing skills.
 */
export const skillsAssistantEngine: AssistantEngine = (request, context) => {
	if (!context) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error: 'Select a portfolio to analyze skills.',
		};
	}

	const existing = existingSkillTokens(context);
	if (existing.length === 0) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error:
				'Not enough portfolio information to suggest improvements yet. Add your skills or projects first.',
		};
	}

	const suggestions = buildSuggestions(context);
	if (suggestions.length === 0) {
		return {
			ok: false,
			feature: request.feature,
			content: '',
			metadata: null,
			error:
				'No improvement suggestions found for this portfolio. Your skills already cover the common complementary areas, or more detail is needed.',
		};
	}

	const content = suggestions
		.map(
			(suggestion) =>
				`Skill: ${suggestion.skill}\nCategory: ${suggestion.category}\nWhy: ${suggestion.why}\nPriority: ${suggestion.priority}`
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
