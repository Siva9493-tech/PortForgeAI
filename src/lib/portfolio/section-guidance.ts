import { isSectionCompleted, isMeaningful } from './completion';
import { WIZARD_STEPS, type WizardStep } from './steps';
import type { PortfolioData, StepId } from './types';

/**
 * Sections that make up a portfolio worth reviewing. Optional sections
 * (certifications, achievements, social links, resume, imports) are surfaced
 * when they have been started, but are never forced on the user.
 */
export const CORE_SECTION_IDS: readonly StepId[] = [
	'personalInformation',
	'education',
	'experience',
	'projects',
	'skills',
] as const;

export type SectionStatus = 'not-started' | 'in-progress' | 'complete';

export function isCoreSection(stepId: StepId): boolean {
	return CORE_SECTION_IDS.includes(stepId);
}

/**
 * Whether a section has been engaged: the user either visited it or entered at
 * least one meaningful value. Visitation alone counts as "in progress" so a
 * freshly opened builder reads as an active workflow rather than a checklist.
 */
function hasEngagedWithSection(
	data: PortfolioData,
	visitedSteps: readonly StepId[],
	stepId: StepId
): boolean {
	return visitedSteps.includes(stepId) || isMeaningful(data[stepId]);
}

/**
 * Three-state section status used for the BuilderSection pill and the sidebar
 * step labels. Completion is content-based (reuses `isSectionCompleted`); a
 * section that has been engaged but is not complete is "in progress".
 */
export function getSectionStatus(
	data: PortfolioData,
	visitedSteps: readonly StepId[],
	stepId: StepId
): SectionStatus {
	if (isSectionCompleted(data, stepId)) return 'complete';
	return hasEngagedWithSection(data, visitedSteps, stepId) ? 'in-progress' : 'not-started';
}

function countTokens(value: string): number {
	return value
		.split(/[,;\n]/)
		.map((token) => token.trim())
		.filter(Boolean).length;
}

function countAddedEntries(entries: readonly object[]): number {
	return entries.filter((entry) => isMeaningful(entry)).length;
}

function pluralize(count: number, singular: string, plural: string): string {
	return `${count} ${count === 1 ? singular : plural}`;
}

/**
 * A compact summary of what a complete section holds ("3 projects added",
 * "12 skills added", "2 positions added"). Returns null for sections without a
 * natural count and for incomplete sections, so the chip only ever communicates
 * finished work. Reuses the completion logic — never reads navigation state.
 */
export function getSectionSummary(data: PortfolioData, stepId: StepId): string | null {
	if (!isSectionCompleted(data, stepId)) return null;

	switch (stepId) {
		case 'projects':
			return pluralize(countAddedEntries(data.projects), 'project added', 'projects added');
		case 'experience':
			return pluralize(countAddedEntries(data.experience), 'position added', 'positions added');
		case 'education':
			return pluralize(countAddedEntries(data.education), 'education entry added', 'education entries added');
		case 'skills':
			return pluralize(
				[
					data.skills.programmingLanguages,
					data.skills.frameworks,
					data.skills.databases,
					data.skills.devTools,
					data.skills.cloudPlatforms,
					data.skills.softSkills,
					data.skills.additionalSkills,
				].reduce((sum, value) => sum + countTokens(value), 0),
				'skill added',
				'skills added'
			);
		case 'certifications':
			return pluralize(
				countAddedEntries(data.certifications),
				'certification added',
				'certifications added'
			);
		case 'achievements':
			return pluralize(
				countAddedEntries(data.achievements),
				'achievement added',
				'achievements added'
			);
		case 'resume':
			return 'Resume uploaded';
		case 'githubImport': {
			const count = data.githubImport.importedRepositories.length;
			return pluralize(count, 'repository imported', 'repositories imported');
		}
		case 'linkedinImport':
			return 'LinkedIn connected';
		default:
			return null;
	}
}

/**
 * Whether the important sections are complete and the portfolio is worth
 * reviewing. Optional sections never block review.
 */
export function isPortfolioReadyForReview(data: PortfolioData): boolean {
	return CORE_SECTION_IDS.every((stepId) => isSectionCompleted(data, stepId));
}

/**
 * The most useful section to work on next, steering the user through the
 * important sections in existing flow order.
 *
 * - If the current section is an incomplete important section, recommend it
 *   (finish what you are on) — a fresh portfolio points at Personal Information.
 * - Otherwise recommend the first incomplete important section in flow order,
 *   so the CTA is a real forward jump to the earliest missing content.
 * - Optional sections are never pushed by the CTA: once every important section
 *   is complete this returns undefined and the flow becomes "Preview Portfolio".
 */
export function getNextGuidedStep(
	data: PortfolioData,
	currentStep?: StepId
): WizardStep | undefined {
	if (currentStep && isCoreSection(currentStep) && !isSectionCompleted(data, currentStep)) {
		const current = WIZARD_STEPS.find((step) => step.id === currentStep);
		if (current) return current;
	}
	return WIZARD_STEPS.find((step) => isCoreSection(step.id) && !isSectionCompleted(data, step.id));
}