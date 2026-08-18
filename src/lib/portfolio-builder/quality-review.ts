import { getBuilderProgress, isSectionCompleted } from '../portfolio/completion';
import { getSectionSummary, isPortfolioReadyForReview } from '../portfolio/section-guidance';
import { getStepById, getStepIndex } from '../portfolio/steps';
import type { PortfolioData, StepId } from '../portfolio/types';
import {
	hasSubstantialContent,
	listedSkillTokens,
	portfolioTechTokens,
} from './suggestions';

/**
 * Builder Final Quality Review (Task 14).
 *
 * A deterministic, read-only review of the portfolio content the user has
 * actually entered. It is NOT the AI Portfolio Review and never calls an AI
 * provider: every finding is derived only from the current Builder wizard
 * state, reusing the existing completion logic, section summaries, next-step
 * guidance and the Task-12 suggestion helpers. It never writes, saves, creates
 * versions, publishes, or touches recovery.
 */

export type ReviewCategory = 'ready' | 'attention' | 'optional';

export interface ReviewFinding {
	/** Stable id, e.g. `projects:descriptions`. */
	id: string;
	category: ReviewCategory;
	/** The Builder section this finding connects back to. */
	section: StepId;
	/** Short heading shown above the finding's explanation. */
	title: string;
	/** Concise, grounded explanation of the finding. */
	message: string;
	/** Label for the action that navigates to the section ('' when none). */
	action: string;
}

export interface QualityReviewResult {
	findings: ReviewFinding[];
	attentionCount: number;
	optionalCount: number;
	readyCount: number;
	/** Reuses the existing important-sections readiness check (Task 13). */
	readyForReview: boolean;
	/** Reuses the existing Builder completion system (single source of truth). */
	completion: ReturnType<typeof getBuilderProgress>;
}

const CATEGORY_ORDER: Record<ReviewCategory, number> = {
	attention: 0,
	optional: 1,
	ready: 2,
};

function hasText(value: unknown): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

function sectionTitle(section: StepId): string {
	return getStepById(section)?.title ?? section;
}

function completeAction(section: StepId): string {
	return `Complete ${sectionTitle(section)}`;
}

function reviewAction(section: StepId): string {
	return `Review ${sectionTitle(section)}`;
}

/** Gathers every finding for the current Builder data, ordered by importance. */
export function getQualityReview(data: PortfolioData): QualityReviewResult {
	const findings: ReviewFinding[] = [];
	const push = (
		category: ReviewCategory,
		section: StepId,
		id: string,
		title: string,
		message: string,
		action: string
	): void => {
		findings.push({ id, category, section, title, message, action });
	};

	const profile = data.personalInformation;
	const profileStarted =
		hasText(profile.fullName) || hasText(profile.email) || hasText(profile.professionalTitle);

	// --- Needs attention: important sections ---

	if (!isSectionCompleted(data, 'personalInformation')) {
		push(
			'attention',
			'personalInformation',
			'personalInformation:basics',
			'Basic profile information',
			!hasText(profile.fullName) && !hasText(profile.email)
				? 'Add your name and email so visitors know who you are.'
				: 'Your basic profile is missing your name or email.',
			completeAction('personalInformation')
		);
	}

	if (profileStarted && (!hasText(profile.professionalTitle) || !hasText(profile.about))) {
		push(
			'attention',
			'personalInformation',
			'personalInformation:headline',
			'Professional headline & introduction',
			'Add a professional headline and a short introduction describing your role and direction.',
			completeAction('personalInformation')
		);
	}

	if (!isSectionCompleted(data, 'experience')) {
		const hasEntries = data.experience.length > 0;
		push(
			'attention',
			'experience',
			'experience:missing',
			'Experience',
			hasEntries
				? 'Some positions are missing a job title or company.'
				: 'Add at least one position to show your professional background.',
			hasEntries ? completeAction('experience') : `Add ${sectionTitle('experience')}`
		);
	}

	if (!isSectionCompleted(data, 'projects')) {
		const hasEntries = data.projects.length > 0;
		push(
			'attention',
			'projects',
			'projects:missing',
			'Projects',
			hasEntries
				? 'Some projects are missing a project name.'
				: 'Add at least one project to demonstrate practical work.',
			hasEntries ? completeAction('projects') : `Add ${sectionTitle('projects')}`
		);
	} else if (
		data.projects.some(
			(project) => hasText(project.projectName) && !hasText(project.description)
		)
	) {
		push(
			'attention',
			'projects',
			'projects:descriptions',
			'Projects',
			'Some projects need descriptions — explain what you built and the problem it solves.',
			reviewAction('projects')
		);
	}

	if (!isSectionCompleted(data, 'skills')) {
		push(
			'attention',
			'skills',
			'skills:missing',
			'Skills',
			'Add your skills so visitors understand what you work with.',
			completeAction('skills')
		);
	}

	if (!isSectionCompleted(data, 'education')) {
		push(
			'attention',
			'education',
			'education:missing',
			'Education',
			'Add your education to complete the important sections.',
			completeAction('education')
		);
	}

	// --- Optional improvement: never an error, only offered when relevant ---

	if (data.certifications.length === 0 && hasSubstantialContent(data)) {
		push(
			'optional',
			'certifications',
			'certifications:optional',
			'Certifications',
			'Certifications are optional and can be added if relevant to your work.',
			reviewAction('certifications')
		);
	}

	if (data.achievements.length === 0 && hasSubstantialContent(data)) {
		push(
			'optional',
			'achievements',
			'achievements:optional',
			'Achievements',
			'Consider adding achievements that demonstrate results, recognition or contributions.',
			reviewAction('achievements')
		);
	}

	if (!isSectionCompleted(data, 'socialLinks') && hasSubstantialContent(data)) {
		push(
			'optional',
			'socialLinks',
			'socialLinks:optional',
			'Links & contact',
			'Add contact or social links if you have profiles to share.',
			reviewAction('socialLinks')
		);
	}

	if (!isSectionCompleted(data, 'resume') && hasSubstantialContent(data)) {
		push(
			'optional',
			'resume',
			'resume:optional',
			'Resume',
			'Uploading a resume is optional but can strengthen your portfolio.',
			reviewAction('resume')
		);
	}

	if (
		isSectionCompleted(data, 'projects') &&
		data.projects.some(
			(project) =>
				hasText(project.projectName) && !hasText(project.githubUrl) && !hasText(project.demoUrl)
		)
	) {
		push(
			'optional',
			'projects',
			'projects:links',
			'Projects',
			'Some projects could include a GitHub or live demo link.',
			reviewAction('projects')
		);
	}

	const techTokens = portfolioTechTokens(data);
	if (techTokens.length > 0) {
		const listed = listedSkillTokens(data);
		if (techTokens.some((token) => !listed.has(token.toLowerCase()))) {
			push(
				'optional',
				'skills',
				'skills:consistency',
				'Skills',
				'Some technologies in your projects are not listed in your Skills.',
				reviewAction('skills')
			);
		}
	}

	// --- Ready: grounded confirmations of what is actually present ---

	const core: StepId[] = ['personalInformation', 'education', 'experience', 'projects', 'skills'];
	for (const section of core) {
		if (!isSectionCompleted(data, section)) continue;
		push(
			'ready',
			section,
			`${section}:ready`,
			sectionTitle(section),
			getSectionSummary(data, section) ??
				(section === 'personalInformation' ? 'Basic profile added.' : 'Section added.'),
			''
		);
	}

	if (isSectionCompleted(data, 'resume')) {
		push(
			'ready',
			'resume',
			'resume:ready',
			'Resume',
			getSectionSummary(data, 'resume') ?? 'Resume uploaded.',
			''
		);
	}

	findings.sort(
		(a, b) =>
			CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category] ||
			getStepIndex(a.section) - getStepIndex(b.section)
	);

	return {
		findings,
		attentionCount: findings.filter((finding) => finding.category === 'attention').length,
		optionalCount: findings.filter((finding) => finding.category === 'optional').length,
		readyCount: findings.filter((finding) => finding.category === 'ready').length,
		readyForReview: isPortfolioReadyForReview(data),
		completion: getBuilderProgress(data),
	};
}