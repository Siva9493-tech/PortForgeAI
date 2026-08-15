import type {
	PortfolioOutput,
	PortfolioResume,
	PortfolioSocial,
} from '../ai';
import { portfolioManagerStore } from '../portfolio-manager';

/**
 * PortForge Portfolio Completion Score.
 *
 * A deterministic, explainable completeness metric derived from the existing
 * normalized `PortfolioOutput` — never from the wizard, form fields, DOM, or
 * portfolio-manager internals. It measures whether meaningful sections exist,
 * not writing quality; a portfolio can be 100% complete and still need better
 * prose.
 *
 * Every category is validated against the real schema fields. Core categories
 * are always eligible; optional categories are eligible only when the
 * portfolio actually contains data for them, so an absent — genuinely optional —
 * section (e.g. a fresh grad with no work experience) never unfairly breaks
 * the score. Anything present but blank/whitespace/empty is marked incomplete.
 */

/** Stable category keys, mirroring the sections present in `PortfolioOutput`. */
export type CompletionCategoryKey =
	| 'profile'
	| 'about'
	| 'projects'
	| 'skills'
	| 'experience'
	| 'education'
	| 'resume'
	| 'social'
	| 'certifications'
	| 'achievements';

/** How much a category influences the score. Core is always eligible. */
export type CompletionTier = 'core' | 'optional';

/** Per-category outcome. `not-applicable` only for absent optional sections. */
export type CompletionStatus = 'complete' | 'incomplete' | 'not-applicable';

/** One scored section within the portfolio. */
export interface CompletionCategoryDetail {
	/** Stable, schema-derived key. */
	key: CompletionCategoryKey;
	/** Human-readable label for reporting. */
	label: string;
	/** `core` categories are always eligible; `optional` only when present. */
	tier: CompletionTier;
	/** Contribution toward `totalWeight` when eligible. */
	weight: number;
	/** Whether this category is counted in the denominator. */
	eligible: boolean;
	/** `complete`, `incomplete`, or `not-applicable`. */
	status: CompletionStatus;
	/** Short, human reason for the status (drives explainability). */
	reason: string;
}

/** The full, reusable completion result for one portfolio. */
export interface PortfolioCompletion {
	/** 0-100. `completedWeight / totalWeight`, rounded. */
	score: number;
	/** Number of eligible categories that are complete. */
	completedSections: number;
	/** Number of eligible categories that are missing/incomplete. */
	missingSections: number;
	/** Number of categories counted in the denominator. */
	totalSections: number;
	/** Sum of weights actually earned. */
	completedWeight: number;
	/** Sum of weights of all eligible categories. */
	totalWeight: number;
	/** Per-category breakdown, in a stable order. */
	details: CompletionCategoryDetail[];
}

/* -------------------------------------------------------------------------- */
/* Validation helpers — empty/blank/null values are never meaningful.          */
/* -------------------------------------------------------------------------- */

function hasText(value: unknown): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

function hasMeaningfulItems(values: readonly unknown[], pick: (item: Record<string, unknown>) => unknown): boolean {
	return values.some((item) => {
		if (typeof item !== 'object' || item === null) {
			return false;
		}
		return hasText(pick(item as Record<string, unknown>));
	});
}

function socialHasLink(social: PortfolioSocial | null): boolean {
	if (!social || typeof social !== 'object') {
		return false;
	}
	return hasText(social.linkedin) ||
		hasText(social.github) ||
		hasText(social.website) ||
		hasText(social.twitter) ||
		hasText(social.instagram) ||
		hasText(social.youtube) ||
		hasText(social.other);
}

function resumeIsPresent(resume: PortfolioResume | null): boolean {
	if (!resume || typeof resume !== 'object') {
		return false;
	}
	return hasText(resume.fileName) || hasText(resume.fileUrl) || hasText(resume.fileType);
}

/* -------------------------------------------------------------------------- */
/* Category weights                                                            */
/* -------------------------------------------------------------------------- */

/** Core categories (always in the denominator). */
const CORE_WEIGHT = 20;
/** Optional categories (in the denominator only when the data is present). */
const OPTIONAL_WEIGHT = 10;

/* -------------------------------------------------------------------------- */
/* Scoring engine                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Analyzes one normalized `PortfolioOutput` into a completion score.
 *
 * Core categories (profile, about, projects, skills) are always eligible with
 * weight 20 each (total 80). Optional categories (experience, education,
 * resume, social, certifications, achievements) become eligible — with weight
 * 10 each — only when the output contains data for them. Score is
 * `completedWeight / totalWeight × 100`. The function is pure and read-only.
 */
export function analyzePortfolioCompletion(output: PortfolioOutput): PortfolioCompletion {
	const details: CompletionCategoryDetail[] = [];

	const addCategory = (
		key: CompletionCategoryKey,
		label: string,
		tier: CompletionTier,
		weight: number,
		eligible: boolean,
		complete: boolean,
		completeReason: string,
		absentReason: string
	): void => {
		const status: CompletionStatus = !eligible ? 'not-applicable' : complete ? 'complete' : 'incomplete';
		details.push({
			key,
			label,
			tier,
			weight,
			eligible,
			status,
			reason: status === 'complete' ? completeReason : status === 'not-applicable' ? absentReason : `${label} is present but incomplete.`,
		});
	};

	const profileComplete = hasText(output.seo?.title);
	addCategory('profile', 'Profile / Headline', 'core', CORE_WEIGHT, true, profileComplete,
		'Headline is populated.', 'Headline is missing.');

	const aboutComplete = hasText(output.seo?.description);
	addCategory('about', 'Bio / About', 'core', CORE_WEIGHT, true, aboutComplete,
		'Bio is populated.', 'Bio is missing.');

	const projectsComplete = hasMeaningfulItems(output.projects, (item) => item.name);
	addCategory('projects', 'Projects', 'core', CORE_WEIGHT, true, projectsComplete,
		'Projects contain meaningful entries.', 'Projects are missing.');

	const skillsComplete = hasMeaningfulItems(output.skills, (item) => item.value);
	addCategory('skills', 'Skills', 'core', CORE_WEIGHT, true, skillsComplete,
		'Skills are populated.', 'Skills are missing.');

	const experienceEligible = Array.isArray(output.experience) && output.experience.length > 0;
	const experienceComplete = hasMeaningfulItems(output.experience, (item) => item.role ?? item.company);
	addCategory('experience', 'Experience', 'optional', OPTIONAL_WEIGHT, experienceEligible, experienceComplete,
		'Experience is populated.', 'No experience has been added.');

	const educationEligible = Array.isArray(output.education) && output.education.length > 0;
	const educationComplete = hasMeaningfulItems(output.education, (item) => item.degree ?? item.institution);
	addCategory('education', 'Education', 'optional', OPTIONAL_WEIGHT, educationEligible, educationComplete,
		'Education is populated.', 'No education has been added.');

	const resumeEligible = resumeIsPresent(output.resume);
	addCategory('resume', 'Resume', 'optional', OPTIONAL_WEIGHT, resumeEligible, resumeEligible,
		'Resume is attached.', 'No resume has been attached.');

	const socialEligible = socialHasLink(output.social);
	addCategory('social', 'Social Links', 'optional', OPTIONAL_WEIGHT, socialEligible, socialEligible,
		'Social links are populated.', 'No social links have been added.');

	const certificationsEligible = Array.isArray(output.certifications) && output.certifications.length > 0;
	const certificationsComplete = hasMeaningfulItems(output.certifications, (item) => item.name);
	addCategory('certifications', 'Certifications', 'optional', OPTIONAL_WEIGHT, certificationsEligible, certificationsComplete,
		'Certifications are populated.', 'No certifications have been added.');

	const achievementsEligible = Array.isArray(output.achievements) && output.achievements.length > 0;
	const achievementsComplete = hasMeaningfulItems(output.achievements, (item) => item.title);
	addCategory('achievements', 'Achievements', 'optional', OPTIONAL_WEIGHT, achievementsEligible, achievementsComplete,
		'Achievements are populated.', 'No achievements have been added.');

	const completedWeight = details
		.filter((detail) => detail.status === 'complete')
		.reduce((sum, detail) => sum + detail.weight, 0);
	const totalWeight = details
		.filter((detail) => detail.eligible)
		.reduce((sum, detail) => sum + detail.weight, 0);
	const totalSections = details.filter((detail) => detail.eligible).length;
	const completedSections = details.filter((detail) => detail.status === 'complete').length;

	const score =
		totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);

	return {
		score,
		completedSections,
		missingSections: totalSections - completedSections,
		totalSections,
		completedWeight,
		totalWeight,
		details,
	};
}

/** Convenience: score-only accessor for a normalized output. */
export function getCompletionScore(output: PortfolioOutput): number {
	return analyzePortfolioCompletion(output).score;
}

/**
 * Completion score for a single managed portfolio by stable id. Resolves the
 * existing `PortfolioOutput` through the portfolio manager's read-only lookup,
 * then runs the identical analyzer — the id is never used as weight or score,
 * and scores are never shared across portfolios. Returns null when the
 * portfolio does not exist.
 */
export function getPortfolioCompletionScore(portfolioId: string): PortfolioCompletion | null {
	const record = portfolioManagerStore.getPortfolio(portfolioId);
	if (!record) {
		return null;
	}
	return analyzePortfolioCompletion(record.data);
}