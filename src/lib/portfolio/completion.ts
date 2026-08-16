import { WIZARD_STEPS } from './steps';
import type { WizardStep } from './steps';
import type { PortfolioData, SocialLinksEntry, StepId } from './types';

export function isMeaningful(value: unknown): boolean {
	if (value == null) return false;
	if (typeof value === 'string') return value.trim().length > 0;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value > 0;
	if (Array.isArray(value)) return value.some(isMeaningful);
	if (typeof value === 'object') {
		return Object.values(value as Record<string, unknown>).some(isMeaningful);
	}
	return false;
}

interface FieldRule {
	/** Fields that must (all) or may (any) be meaningful for the section to count as complete. */
	fields: readonly string[];
	match: 'all' | 'any';
}

const OBJECT_RULES: Partial<Record<keyof PortfolioData, FieldRule>> = {
	personalInformation: { fields: ['fullName', 'email'], match: 'all' },
	skills: {
		fields: [
			'programmingLanguages',
			'frameworks',
			'databases',
			'devTools',
			'cloudPlatforms',
			'softSkills',
			'additionalSkills',
		],
		match: 'any',
	},
	resume: { fields: ['fileName'], match: 'all' },
	githubImport: { fields: ['githubUsername'], match: 'all' },
	linkedinImport: { fields: ['linkedinProfileUrl'], match: 'all' },
};

const LIST_RULES: Partial<Record<keyof PortfolioData, FieldRule>> = {
	education: { fields: ['degree', 'institution'], match: 'all' },
	experience: { fields: ['jobTitle', 'company'], match: 'all' },
	projects: { fields: ['projectName'], match: 'all' },
	certifications: { fields: ['certificationName'], match: 'all' },
	achievements: { fields: ['achievementTitle'], match: 'all' },
};

function toRecord(value: unknown): Record<string, unknown> {
	return (value ?? {}) as Record<string, unknown>;
}

function matchesRule(entry: Record<string, unknown>, rule: FieldRule): boolean {
	const values = rule.fields.map((field) => entry[field]);
	return rule.match === 'all' ? values.every(isMeaningful) : values.some(isMeaningful);
}

function socialLinksComplete(value: unknown): boolean {
	if (!Array.isArray(value)) return false;
	const entry = value[0];
	if (!entry || typeof entry !== 'object') return false;
	const links = entry as SocialLinksEntry;
	const presetFields: (keyof SocialLinksEntry)[] = [
		'linkedinProfile',
		'githubProfile',
		'portfolioWebsite',
		'twitterProfile',
		'instagram',
		'youtubeChannel',
		'otherWebsite',
	];
	if (presetFields.some((field) => isMeaningful(links[field]))) return true;
	return (
		Array.isArray(links.customLinks) &&
		links.customLinks.some((link) => isMeaningful(link.label) && isMeaningful(link.url))
	);
}

function importSectionComplete(value: unknown, sectionKey: keyof PortfolioData): boolean {
	const rule = OBJECT_RULES[sectionKey];
	if (rule && matchesRule(toRecord(value), rule)) return true;
	const connected = (value as { connected?: boolean } | null)?.connected;
	return Boolean(connected);
}

/**
 * Whether a portfolio section counts as complete based purely on the content
 * the user has actually entered. A section is complete when its meaningful
 * required content is present — not merely because it was visited.
 *
 * New sections should add an entry to OBJECT_RULES / LIST_RULES. Sections
 * without a rule fall back to "any meaningful content".
 */
export function isSectionCompleted(
	data: PortfolioData,
	sectionKey: keyof PortfolioData
): boolean {
	const value = data[sectionKey];

	if (sectionKey === 'socialLinks') return socialLinksComplete(value);

	const objectRule = OBJECT_RULES[sectionKey];
	if (objectRule) {
		if (sectionKey === 'githubImport' || sectionKey === 'linkedinImport') {
			return importSectionComplete(value, sectionKey);
		}
		return matchesRule(toRecord(value), objectRule);
	}

	const listRule = LIST_RULES[sectionKey];
	if (listRule) {
		return (
			Array.isArray(value) &&
			value.some((entry) => entry != null && matchesRule(toRecord(entry), listRule))
		);
	}

	return isMeaningful(value);
}

export interface BuilderProgress {
	completed: number;
	total: number;
	percent: number;
}

/**
 * Overall builder completion derived from the actual section data — never from
 * visit/navigation state. `total` follows the step list, so it stays accurate
 * if a section is ever added or removed.
 */
export function getBuilderProgress(data: PortfolioData): BuilderProgress {
	const total = WIZARD_STEPS.length;
	const completed = WIZARD_STEPS.reduce(
		(count, step) => (isSectionCompleted(data, step.id) ? count + 1 : count),
		0
	);
	return {
		completed,
		total,
		percent: total === 0 ? 0 : Math.round((completed / total) * 100),
	};
}

/**
 * The most useful section to work on next.
 *
 * - If the current section is itself incomplete, recommend it (finish what you
 *   are on) — this keeps a fresh portfolio pointing at "Personal Information".
 * - Otherwise recommend the first incomplete section in flow order, so the CTA
 *   is a real forward jump to the earliest missing content.
 * - Returns undefined when every section is complete.
 */
export function getNextIncompleteStep(
	data: PortfolioData,
	currentStep?: StepId
): WizardStep | undefined {
	if (currentStep && !isSectionCompleted(data, currentStep)) {
		const current = WIZARD_STEPS.find((step) => step.id === currentStep);
		if (current) return current;
	}
	return WIZARD_STEPS.find((step) => !isSectionCompleted(data, step.id));
}
