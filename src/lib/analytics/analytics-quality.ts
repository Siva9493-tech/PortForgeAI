import type { PortfolioOutput } from '../ai';
import { portfolioManagerStore } from '../portfolio-manager';

/**
 * PortForge AI Quality Score.
 *
 * A deterministic, locally computed evaluation of how meaningful, useful and
 * reasonably strong the CONTENT of a portfolio is — deliberately distinct from
 * the Completion Score, which only asks whether information is present.
 *
 * There is currently NO real AI API connected. This module therefore evaluates
 * the normalized `PortfolioOutput` with transparent, measurable signals
 * (text depth, placeholder detection, skill diversity, description substance).
 * It never pretends an LLM ran, never calls an external API, and never reads an
 * API key. A clean provider boundary keeps it ready for a real AI evaluator to
 * be swapped in later without touching the analytics architecture.
 *
 * This is only a PortForge content-quality indicator. It is NOT an ATS score,
 * hiring/recruiter/employability score, job guarantee, salary prediction,
 * ranking, or acceptance probability.
 */

/** Stable quality dimension keys, each backed by real `PortfolioOutput` fields. */
export type QualityDimensionKey =
	| 'headline'
	| 'bio'
	| 'projects'
	| 'skills'
	| 'experience'
	| 'achievements'
	| 'social';

/** One measured signal that helps explain a dimension score. */
export interface QualitySignal {
	/** The dimension this signal describes. */
	dimension: QualityDimensionKey;
	/** Short title of the signal, e.g. "Bio length". */
	label: string;
	/** The measured value, e.g. "42 words". */
	value: string;
}

/** Score (0-100) for a single quality dimension and its weight in the total. */
export interface QualityDimensionScore {
	key: QualityDimensionKey;
	label: string;
	weight: number;
	/** 0-100 contribution, scaled by `weight` for the total. */
	score: number;
}

/** A human-readable strength or improvement derived from measured data. */
export type QualityFindingType = 'strength' | 'improvement';

export interface QualityFinding {
	type: QualityFindingType;
	dimension: QualityDimensionKey;
	message: string;
}

/** The full, reusable quality result for one portfolio. */
export interface PortfolioQualityResult {
	/** 0-100, normalized weighted average of dimension scores. */
	score: number;
	/** Score per dimension plus its weight. */
	dimensionScores: QualityDimensionScore[];
	/** Genuine strengths the data actually supports. */
	strengths: string[];
	/** Specific, data-backed improvements. */
	improvements: string[];
	/** Measured signals behind the scores. */
	qualitySignals: QualitySignal[];
	/** One-line explainable summary. */
	summary: string;
	/** Provider that produced this result ('deterministic' now, 'ai' later). */
	provider: 'deterministic' | 'ai';
}

/* -------------------------------------------------------------------------- */
/* Quality evaluation interface (future AI provider boundary)                  */
/* -------------------------------------------------------------------------- */

/**
 * Contract for any quality evaluator. The current deterministic evaluator
 * implements it today; a real AI provider can implement the same interface
 * later and be swapped in through `getPortfolioQualityEvaluator()` without
 * rewriting the analytics system.
 */
export interface PortfolioQualityEvaluator {
	/** Returns the provider key this evaluator represents. */
	readonly provider: 'deterministic' | 'ai';
	evaluate(output: PortfolioOutput): PortfolioQualityResult;
}

/* -------------------------------------------------------------------------- */
/* Deterministic signals helpers                                               */
/* -------------------------------------------------------------------------- */

function hasText(value: string | undefined | null): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

function wordCount(value: string | undefined | null): number {
	if (!hasText(value)) {
		return 0;
	}
	return value!.trim().split(/\s+/).length;
}

const PLACEHOLDER_PATTERN =
	/your name|your job|your title|your role|your company|insert|replace|lorem|placeholder|coming soon|example\.com|add your/i;

function isPlaceholder(value: string | undefined | null): boolean {
	return typeof value === 'string' && PLACEHOLDER_PATTERN.test(value);
}

function clamp(value: number, min = 0, max = 100): number {
	return Math.min(max, Math.max(min, value));
}

/** Distinct, normalized skill tokens across every skill category. */
function distinctSkillCount(skills: PortfolioOutput['skills']): number {
	const seen = new Set<string>();
	for (const skill of skills) {
		if (!hasText(skill.value)) {
			continue;
		}
		for (const token of skill.value.split(/[,;]/)) {
			const normalized = token.trim().toLowerCase();
			if (normalized) {
				seen.add(normalized);
			}
		}
	}
	return seen.size;
}

function distinctCategories(skills: PortfolioOutput['skills']): number {
	const seen = new Set<string>();
	for (const skill of skills) {
		if (hasText(skill.category)) {
			seen.add(skill.category.trim().toLowerCase());
		}
	}
	return seen.size;
}

function average(values: readonly number[]): number {
	if (values.length === 0) {
		return 0;
	}
	return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/* -------------------------------------------------------------------------- */
/* Deterministic evaluator                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The current, fully local quality evaluator. All signals are measurable and
 * deterministic: meaningful text depth, placeholder detection, skill
 * diversity, description substance. No randomness, no LLM, no hardcoded score.
 * Empty/optional content scores low but never invents problems for fields
 * that genuinely exist in the schema.
 */
export class DeterministicPortfolioQualityEvaluator implements PortfolioQualityEvaluator {
	readonly provider = 'deterministic' as const;

	evaluate(output: PortfolioOutput): PortfolioQualityResult {
		const dimensionScores = this.scoreDimensions(output);
		const signals = this.collectSignals(output);

		const totalWeight = dimensionScores.reduce((sum, d) => sum + d.weight, 0);
		const weighted = dimensionScores.reduce(
			(sum, d) => sum + d.score * d.weight,
			0
		);
		const score = totalWeight === 0 ? 0 : clamp(Math.round(weighted / totalWeight));

		const findings = this.collectFindings(output, dimensionScores);
		const strengths = findings
			.filter((finding) => finding.type === 'strength')
			.map((finding) => finding.message);
		const improvements = findings
			.filter((finding) => finding.type === 'improvement')
			.map((finding) => finding.message);

		return {
			score,
			dimensionScores,
			strengths,
			improvements,
			qualitySignals: signals,
			summary: this.summaryFor(score),
			provider: this.provider,
		};
	}

	/* ------------------------------ dimensions ------------------------------ */

	private scoreDimensions(output: PortfolioOutput): QualityDimensionScore[] {
		return [
			{ key: 'headline', label: 'Headline Quality', weight: 10, score: this.headlineScore(output) },
			{ key: 'bio', label: 'Bio Quality', weight: 20, score: this.bioScore(output) },
			{ key: 'projects', label: 'Project Quality', weight: 25, score: this.projectsScore(output) },
			{ key: 'skills', label: 'Skills Quality', weight: 15, score: this.skillsScore(output) },
			{ key: 'experience', label: 'Experience Quality', weight: 15, score: this.experienceScore(output) },
			{ key: 'achievements', label: 'Achievement Quality', weight: 10, score: this.achievementsScore(output) },
			{ key: 'social', label: 'Social & Profile Quality', weight: 5, score: this.socialScore(output) },
		];
	}

	private headlineScore(output: PortfolioOutput): number {
		const title = output.seo?.title;
		if (!hasText(title)) {
			return 0;
		}
		if (isPlaceholder(title)) {
			return 10;
		}
		const words = wordCount(title);
		if (words >= 5) {
			return 100;
		}
		if (words >= 3) {
			return 80;
		}
		return 50;
	}

	private bioScore(output: PortfolioOutput): number {
		const bio = output.seo?.description;
		if (!hasText(bio)) {
			return 0;
		}
		if (isPlaceholder(bio)) {
			return 10;
		}
		const words = wordCount(bio);
		if (words >= 20) {
			return 100;
		}
		if (words >= 12) {
			return 75;
		}
		if (words >= 6) {
			return 45;
		}
		return 25;
	}

	private projectsScore(output: PortfolioOutput): number {
		const projects = output.projects;
		if (!Array.isArray(projects) || projects.length === 0) {
			return 0;
		}
		const perProject = projects.map((project) => {
			let score = 0;
			score += hasText(project.name) ? 20 : 0;
			const descWords = wordCount(project.description);
			score += descWords >= 25 ? 40 : descWords >= 15 ? 30 : descWords >= 8 ? 20 : descWords > 0 ? 10 : 0;
			const techCount = project.technologies.filter(hasText).length;
			score += techCount >= 3 ? 25 : techCount >= 1 ? 15 : 0;
			const highlightCount = project.highlights.filter(hasText).length;
			score += highlightCount >= 2 ? 15 : 0;
			return clamp(score);
		});
		return Math.round(average(perProject));
	}

	private skillsScore(output: PortfolioOutput): number {
		const skills = output.skills;
		if (!Array.isArray(skills) || skills.length === 0) {
			return 0;
		}
		const distinct = distinctSkillCount(skills);
		const categories = distinctCategories(skills);
		let score = 0;
		if (distinct >= 16) {
			score = 100;
		} else if (distinct >= 12) {
			score = 85;
		} else if (distinct >= 8) {
			score = 70;
		} else if (distinct >= 5) {
			score = 55;
		} else if (distinct >= 2) {
			score = 40;
		} else if (distinct >= 1) {
			score = 25;
		}
		if (categories >= 2) {
			score += 10;
		}
		return clamp(score);
	}

	private experienceScore(output: PortfolioOutput): number {
		const experience = output.experience;
		if (!Array.isArray(experience) || experience.length === 0) {
			return 0;
		}
		const perEntry = experience.map((entry) => {
			let score = 0;
			score += hasText(entry.role) || hasText(entry.company) ? 20 : 0;
			const descWords = wordCount(entry.description);
			score += descWords >= 15 ? 60 : descWords >= 8 ? 40 : descWords > 0 ? 20 : 0;
			score += hasText(entry.employmentType) || hasText(entry.location) ? 10 : 0;
			score += hasText(entry.startDate) || entry.currentlyWorking ? 10 : 0;
			return clamp(score);
		});
		return Math.round(average(perEntry));
	}

	private achievementsScore(output: PortfolioOutput): number {
		const achievements = output.achievements;
		if (!Array.isArray(achievements) || achievements.length === 0) {
			return 0;
		}
		const perEntry = achievements.map((achievement) => {
			let score = 0;
			score += hasText(achievement.title) ? 40 : 0;
			score += hasText(achievement.organization) ? 20 : 0;
			score += hasText(achievement.description) ? 20 : 0;
			score += hasText(achievement.date) ? 20 : 0;
			return clamp(score);
		});
		return Math.round(average(perEntry));
	}

	private socialScore(output: PortfolioOutput): number {
		const social = output.social;
		let linkCount = 0;
		if (social && typeof social === 'object') {
			for (const key of [
				'linkedin',
				'github',
				'website',
				'twitter',
				'instagram',
				'youtube',
				'other',
			] as const) {
				if (hasText(social[key])) {
					linkCount += 1;
				}
			}
		}
		const hasResume = Boolean(output.resume && hasText(output.resume.fileName));
		let score = 0;
		score += linkCount >= 3 ? 60 : linkCount >= 2 ? 45 : linkCount >= 1 ? 30 : 0;
		if (hasResume) {
			score += 40;
		}
		return clamp(score);
	}

	/* ------------------------------ signals ------------------------------ */

	private collectSignals(output: PortfolioOutput): QualitySignal[] {
		const signals: QualitySignal[] = [];

		const titleWords = wordCount(output.seo?.title);
		signals.push({
			dimension: 'headline',
			label: 'Headline length',
			value: hasText(output.seo?.title) ? `${titleWords} words` : 'missing',
		});

		const bioWords = wordCount(output.seo?.description);
		signals.push({
			dimension: 'bio',
			label: 'Bio depth',
			value: hasText(output.seo?.description)
				? isPlaceholder(output.seo?.description)
					? `${bioWords} words · placeholder`
					: `${bioWords} words`
				: 'missing',
		});

		const projects = output.projects ?? [];
		const avgProjectDescription = average(projects.map((project) => wordCount(project.description)));
		signals.push({
			dimension: 'projects',
			label: 'Project descriptions',
			value: `${projects.length} projects · avg ${Math.round(avgProjectDescription)} words`,
		});

		const skills = output.skills ?? [];
		signals.push({
			dimension: 'skills',
			label: 'Skill diversity',
			value: `${distinctSkillCount(skills)} distinct skills across ${distinctCategories(skills)} categories`,
		});

		const experience = output.experience ?? [];
		const avgExperienceDescription = average(
			experience.map((entry) => wordCount(entry.description))
		);
		signals.push({
			dimension: 'experience',
			label: 'Experience substance',
			value: `${experience.length} entries · avg ${Math.round(avgExperienceDescription)} description words`,
		});

		signals.push({
			dimension: 'achievements',
			label: 'Achievements',
			value: `${(output.achievements ?? []).length} entries`,
		});

		signals.push({
			dimension: 'social',
			label: 'Profile links',
			value: `${this.socialLinkCount(output)} links${output.resume && hasText(output.resume.fileName) ? ' · resume attached' : ''}`,
		});

		return signals;
	}

	private socialLinkCount(output: PortfolioOutput): number {
		const social = output.social;
		if (!social || typeof social !== 'object') {
			return 0;
		}
		return (
			['linkedin', 'github', 'website', 'twitter', 'instagram', 'youtube', 'other'] as const
		).filter((key) => hasText(social[key])).length;
	}

	/* ------------------------------ findings ------------------------------ */

	private collectFindings(
		output: PortfolioOutput,
		dimensionScores: QualityDimensionScore[]
	): QualityFinding[] {
		const findings: QualityFinding[] = [];
		const byKey = new Map(dimensionScores.map((dimension) => [dimension.key, dimension.score]));

		/* Headline */
		const title = output.seo?.title;
		if (hasText(title) && !isPlaceholder(title) && wordCount(title) >= 5) {
			findings.push({
				type: 'strength',
				dimension: 'headline',
				message: 'Clear professional headline.',
			});
		} else if (byKey.get('headline')! < 80) {
			findings.push({
				type: 'improvement',
				dimension: 'headline',
				message: 'Headline is too short — expand beyond a bare job title.',
			});
		}

		/* Bio */
		const bioWords = wordCount(output.seo?.description);
		if (hasText(output.seo?.description) && !isPlaceholder(output.seo?.description) && bioWords >= 20) {
			findings.push({
				type: 'strength',
				dimension: 'bio',
				message: 'Detailed professional bio with substantial content.',
			});
		} else if (byKey.get('bio')! < 75) {
			findings.push({
				type: 'improvement',
				dimension: 'bio',
				message: 'Bio contains limited information — describe your role, skills and goals.',
			});
		}

		/* Projects */
		const projects = output.projects ?? [];
		const avgProjectDescription = average(projects.map((project) => wordCount(project.description)));
		const anyTech =
			projects.some((project) => (project.technologies ?? []).some(hasText));
		if (projects.length >= 2 && avgProjectDescription >= 20) {
			findings.push({
				type: 'strength',
				dimension: 'projects',
				message: 'Projects feature detailed descriptions.',
			});
		}
		if (anyTech) {
			findings.push({
				type: 'strength',
				dimension: 'projects',
				message: 'Projects include technology details.',
			});
		}
		if (projects.length > 0 && avgProjectDescription > 0 && avgProjectDescription < 12) {
			findings.push({
				type: 'improvement',
				dimension: 'projects',
				message: 'Project descriptions lack detail.',
			});
		}

		/* Skills */
		const distinct = distinctSkillCount(output.skills ?? []);
		if (distinct >= 8) {
			findings.push({
				type: 'strength',
				dimension: 'skills',
				message: 'Broad, diverse skill coverage.',
			});
		} else if (distinct > 0 && distinct < 6) {
			findings.push({
				type: 'improvement',
				dimension: 'skills',
				message: 'Skills list is too narrow — add more distinct skills.',
			});
		}

		/* Experience */
		const experience = output.experience ?? [];
		const avgExperienceDescription = average(
			experience.map((entry) => wordCount(entry.description))
		);
		if (experience.length > 0 && avgExperienceDescription >= 15) {
			findings.push({
				type: 'strength',
				dimension: 'experience',
				message: 'Experience descriptions are substantive.',
			});
		} else if (experience.length > 0 && avgExperienceDescription > 0 && avgExperienceDescription < 8) {
			findings.push({
				type: 'improvement',
				dimension: 'experience',
				message: 'Experience descriptions need more substance.',
			});
		}

		/* Achievements */
		const achievements = output.achievements ?? [];
		if (
			achievements.length > 0 &&
			achievements.some(
				(achievement) =>
					hasText(achievement.organization) &&
					hasText(achievement.description)
			)
		) {
			findings.push({
				type: 'strength',
				dimension: 'achievements',
				message: 'Achievements include meaningful supporting detail.',
			});
		}

		/* Social / profile */
		if (this.socialLinkCount(output) >= 2) {
			findings.push({
				type: 'strength',
				dimension: 'social',
				message: 'Profile includes multiple reachable social links.',
			});
		}

		return findings;
	}

	/* ------------------------------ summary ------------------------------ */

	private summaryFor(score: number): string {
		if (score >= 85) {
			return 'Strong, substantive portfolio content. (PortForge content-quality indicator.)';
		}
		if (score >= 70) {
			return 'Good content quality with some areas to strengthen. (PortForge content-quality indicator.)';
		}
		if (score >= 50) {
			return 'Moderate content quality — several sections need more substance. (PortForge content-quality indicator.)';
		}
		if (score >= 30) {
			return 'Early-stage content — focus on adding meaningful detail. (PortForge content-quality indicator.)';
		}
		return 'Portfolio content is largely missing or placeholder. (PortForge content-quality indicator.)';
	}
}

/**
 * Returns the active quality evaluator. Today it is always the deterministic
 * local one; a future real AI provider can implement `PortfolioQualityEvaluator`
 * and be returned here without rewriting the analytics system.
 */
export function getPortfolioQualityEvaluator(): PortfolioQualityEvaluator {
	return new DeterministicPortfolioQualityEvaluator();
}

/** Convenience: analyze one normalized `PortfolioOutput` with the current evaluator. */
export function evaluatePortfolioQuality(output: PortfolioOutput): PortfolioQualityResult {
	return getPortfolioQualityEvaluator().evaluate(output);
}

/** Convenience: score-only accessor for a normalized output. */
export function getQualityScore(output: PortfolioOutput): number {
	return evaluatePortfolioQuality(output).score;
}

/**
 * Quality score for a single managed portfolio by stable id. Resolves only that
 * portfolio's `PortfolioOutput` through the manager's read-only lookup, then
 * runs the identical evaluator. Scores are never shared across portfolios.
 * Returns null when the portfolio does not exist.
 */
export function getAIQualityScore(portfolioId: string): PortfolioQualityResult | null {
	const record = portfolioManagerStore.getPortfolio(portfolioId);
	if (!record) {
		return null;
	}
	return evaluatePortfolioQuality(record.data);
}