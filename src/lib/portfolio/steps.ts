import type { StepId } from './types';

export interface WizardStep {
	id: StepId;
	number: number;
	title: string;
}

export const WIZARD_STEPS: readonly WizardStep[] = [
	{ id: 'personalInformation', number: 1, title: 'Personal Information' },
	{ id: 'education', number: 2, title: 'Education' },
	{ id: 'experience', number: 3, title: 'Experience' },
	{ id: 'projects', number: 4, title: 'Projects' },
	{ id: 'skills', number: 5, title: 'Skills' },
	{ id: 'certifications', number: 6, title: 'Certifications' },
	{ id: 'achievements', number: 7, title: 'Achievements' },
	{ id: 'socialLinks', number: 8, title: 'Social Links' },
	{ id: 'resume', number: 9, title: 'Resume Upload' },
	{ id: 'githubImport', number: 10, title: 'GitHub Import' },
	{ id: 'linkedinImport', number: 11, title: 'LinkedIn Import' },
] as const satisfies readonly WizardStep[];

export const TOTAL_STEPS: number = WIZARD_STEPS.length;

export const FIRST_STEP_ID: StepId = WIZARD_STEPS[0].id;

export const LAST_STEP_ID: StepId = WIZARD_STEPS[TOTAL_STEPS - 1].id;

export function getStepById(stepId: StepId): WizardStep | undefined {
	return WIZARD_STEPS.find((step) => step.id === stepId);
}

export function getStepByNumber(number: number): WizardStep | undefined {
	return WIZARD_STEPS.find((step) => step.number === number);
}

export function getStepIndex(stepId: StepId): number {
	return WIZARD_STEPS.findIndex((step) => step.id === stepId);
}

export function isStepId(value: string): value is StepId {
	return WIZARD_STEPS.some((step) => step.id === value);
}
