import { isMeaningful } from '../portfolio/completion';
import type { PortfolioData, StepId } from '../portfolio/types';

/**
 * Builder Contextual Smart Suggestions (Task 12).
 *
 * A small, deterministic, read-only rules layer. Every suggestion is grounded
 * only in information the user has already entered in the wizard store — no AI,
 * no external calls, no fabricated content, and never any writes to portfolio
 * data, versions, save state or recovery. The UI surfaces these per section;
 * the user stays in full control.
 */
export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface BuilderSuggestion {
	/** Stable id used for UI-only dismissal (e.g. `projects:description:1`). */
	id: string;
	/** The builder section this suggestion renders in. */
	section: StepId;
	/** Priority used to order suggestions within a section. */
	priority: SuggestionPriority;
	/** Human-readable, neutral guidance text. */
	message: string;
}

const PRIORITY_ORDER: Record<SuggestionPriority, number> = {
	high: 0,
	medium: 1,
	low: 2,
};

/** Cap on how many suggestions a single section shows at once. */
const MAX_SUGGESTIONS_PER_SECTION = 3;

function hasText(value: unknown): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

/** Splits a comma/newline separated list into lowercase, trimmed tokens. */
function tokenize(value: unknown): string[] {
	if (typeof value !== 'string') return [];
	return value
		.split(/[\n,]/)
		.map((token) => token.trim())
		.filter(Boolean);
}

/** Every technology token already listed across the Skills section. */
export function listedSkillTokens(data: PortfolioData): Set<string> {
	const skills = data.skills;
	const fields = [
		skills.programmingLanguages,
		skills.frameworks,
		skills.databases,
		skills.devTools,
		skills.cloudPlatforms,
		skills.softSkills,
		skills.additionalSkills,
	];
	return new Set(fields.flatMap(tokenize).map((token) => token.toLowerCase()));
}

/** Technology tokens (original casing) mentioned in projects or GitHub imports. */
export function portfolioTechTokens(data: PortfolioData): string[] {
	const tokens = new Set<string>();
	for (const project of data.projects) {
		for (const token of tokenize(project.technologies)) tokens.add(token);
	}
	for (const repo of data.githubImport.importedRepositories ?? []) {
		for (const tech of repo.technologies ?? []) {
			const trimmed = tech.trim();
			if (trimmed) tokens.add(trimmed);
		}
	}
	return Array.from(tokens);
}

/** Whether the portfolio already carries substantial content worth building on. */
export function hasSubstantialContent(data: PortfolioData): boolean {
	const core: StepId[] = ['personalInformation', 'education', 'experience', 'projects', 'skills'];
	return core.filter((section) => isMeaningful(data[section])).length >= 3;
}

function projectSuggestions(data: PortfolioData): BuilderSuggestion[] {
	const out: BuilderSuggestion[] = [];
	for (const [index, project] of data.projects.entries()) {
		if (!hasText(project.projectName)) continue;

		if (!hasText(project.description)) {
			const message = hasText(project.technologies)
				? `Project ${index + 1} — Explain how these technologies were used in the project.`
				: `Project ${index + 1} — Add a short description explaining what you built and what problem it solves.`;
			out.push({ id: `projects:description:${index}`, section: 'projects', priority: 'high', message });
		} else if (!hasText(project.githubUrl) && !hasText(project.demoUrl)) {
			out.push({
				id: `projects:link:${index}`,
				section: 'projects',
				priority: 'low',
				message: `Project ${index + 1} — Consider adding a GitHub repository or live demo if available.`,
			});
		}
	}
	return out;
}

function experienceSuggestions(data: PortfolioData): BuilderSuggestion[] {
	const out: BuilderSuggestion[] = [];
	for (const [index, entry] of data.experience.entries()) {
		if (!hasText(entry.jobTitle) && !hasText(entry.company)) continue;

		if (!hasText(entry.description)) {
			out.push({
				id: `experience:description:${index}`,
				section: 'experience',
				priority: 'high',
				message: `Role ${index + 1} — Add 2–4 concise responsibilities or outcomes.`,
			});
		} else if (!/\d/.test(entry.description)) {
			out.push({
				id: `experience:outcomes:${index}`,
				section: 'experience',
				priority: 'medium',
				message: `Role ${index + 1} — Consider mentioning a concrete result, improvement or contribution where applicable.`,
			});
		}
	}
	return out;
}

function educationSuggestions(data: PortfolioData): BuilderSuggestion[] {
	const out: BuilderSuggestion[] = [];
	for (const [index, entry] of data.education.entries()) {
		if (!hasText(entry.degree) && !hasText(entry.institution)) continue;

		if (!hasText(entry.fieldOfStudy)) {
			out.push({
				id: `education:fields:${index}`,
				section: 'education',
				priority: 'medium',
				message: `Education ${index + 1} — Add your field of study to complete this entry.`,
			});
		} else if (!hasText(entry.startYear) || !hasText(entry.endYear)) {
			out.push({
				id: `education:fields:${index}`,
				section: 'education',
				priority: 'medium',
				message: `Education ${index + 1} — Add the years you attended to complete this entry.`,
			});
		} else if (!hasText(entry.description)) {
			out.push({
				id: `education:fields:${index}`,
				section: 'education',
				priority: 'low',
				message: `Education ${index + 1} — Add coursework, achievements or academic highlights to complete this entry.`,
			});
		}
	}
	return out;
}

function skillsSuggestions(data: PortfolioData): BuilderSuggestion[] {
	const techTokens = portfolioTechTokens(data);
	if (techTokens.length === 0) return [];

	const listed = listedSkillTokens(data);
	const missing = techTokens.filter((token) => !listed.has(token.toLowerCase()));
	if (missing.length === 0) return [];

	const examples = missing.slice(0, 4).join(', ');
	const message =
		missing.length > 4
			? 'Some technologies appear in your portfolio but are not listed in Skills. Review them and add only the ones you genuinely know.'
			: `Some technologies appear in your portfolio but are not listed in Skills (${examples}). Review them and add only the ones you genuinely know.`;

	return [{ id: 'skills:consistency', section: 'skills', priority: 'medium', message }];
}

function certificationsSuggestions(data: PortfolioData): BuilderSuggestion[] {
	if (data.certifications.length > 0 || !hasSubstantialContent(data)) return [];
	return [
		{
			id: 'certifications:empty',
			section: 'certifications',
			priority: 'low',
			message: 'Add relevant certifications if they strengthen your professional profile.',
		},
	];
}

function achievementsSuggestions(data: PortfolioData): BuilderSuggestion[] {
	if (data.achievements.length > 0 || !hasSubstantialContent(data)) return [];
	return [
		{
			id: 'achievements:empty',
			section: 'achievements',
			priority: 'medium',
			message:
				'Consider adding achievements that demonstrate results, recognition or meaningful contributions.',
		},
	];
}

function personalInformationSuggestions(data: PortfolioData): BuilderSuggestion[] {
	const profile = data.personalInformation;
	if (
		!hasText(profile.about) &&
		(hasText(profile.fullName) || hasText(profile.professionalTitle) || hasText(profile.email))
	) {
		return [
			{
				id: 'personalInformation:about',
				section: 'personalInformation',
				priority: 'high',
				message:
					'Add a concise introduction describing your role, strengths and professional direction.',
			},
		];
	}
	return [];
}

const SECTION_SUGGESTIONS: Record<StepId, (data: PortfolioData) => BuilderSuggestion[]> = {
	personalInformation: personalInformationSuggestions,
	education: educationSuggestions,
	experience: experienceSuggestions,
	projects: projectSuggestions,
	skills: skillsSuggestions,
	certifications: certificationsSuggestions,
	achievements: achievementsSuggestions,
	socialLinks: () => [],
	resume: () => [],
	githubImport: () => [],
	linkedinImport: () => [],
};

/**
 * Returns the suggestions for a single builder section, ordered by priority
 * (high → medium → low, entries in order for equal priority) and capped so a
 * section never floods the user with more than a small number at once.
 */
export function getSuggestionsForSection(
	data: PortfolioData,
	section: StepId
): BuilderSuggestion[] {
	const rules = SECTION_SUGGESTIONS[section];
	const suggestions = rules ? rules(data) : [];
	return [...suggestions]
		.sort(
			(a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
		)
		.slice(0, MAX_SUGGESTIONS_PER_SECTION);
}