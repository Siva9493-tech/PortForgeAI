import type { AnalyticsCounts, AnalyticsEvent } from '../analytics';
import type { PortfolioRecord } from '../portfolio-manager';

/**
 * Achievement System data model for Day-11 Task 12.
 *
 * Achievements are DERIVED from the existing portfolio manager and analytics
 * data — they never mutate any store and never read wizard/DOM/UI state. Every
 * responsibility is separated: this module defines the model types only.
 * Definitions (`achievement-definitions`) declare WHAT achievements exist;
 * rules (`achievement-rules`) declare HOW each one is measured; the context
 * builder (`achievement-context`) prepares ONE read-only data snapshot; the
 * evaluator (`achievement-evaluator`) combines them deterministically.
 */

/** Stable achievement category, each backed by real application data. */
export type AchievementCategory =
	| 'creation' /* portfolio record exists */
	| 'completion' /* completion score (percent) */
	| 'quality' /* AI quality score (percent) */
	| 'engagement' /* views / visitors / clicks */
	| 'sharing' /* tracked export/share interaction */
	| 'growth'; /* audience/view milestones */

/**
 * Semantic icon key carried by a definition. The UI maps these keys to glyphs;
 * the model never references a specific icon library.
 */
export type AchievementIconKey =
	| 'rocket'
	| 'badge-check'
	| 'sparkles'
	| 'eye'
	| 'users'
	| 'mouse-pointer-click'
	| 'trending-up'
	| 'share';

/**
 * A reusable achievement definition. Pure data — evaluation logic lives in the
 * matching rule, so new achievements are added by adding one definition + one
 * rule without rewriting the evaluator.
 */
export interface AchievementDefinition {
	/** Stable identity. Never a title, index, or position. */
	id: string;
	/** Human-readable name, e.g. "Growing Audience". */
	name: string;
	/** Short description of what the achievement means when earned. */
	description: string;
	/** Short instruction shown while locked: what the user needs to do. */
	requirement: string;
	icon: AchievementIconKey;
	category: AchievementCategory;
	/**
	 * True for yes/no achievements (e.g. "Portfolio Created"). Binary
	 * achievements expose no numeric progress so misleading partial values are
	 * never shown.
	 */
	binary: boolean;
	/** Value required to unlock. Always 1 for binary achievements. */
	threshold: number;
	/**
	 * Optional display unit for readable progress (e.g. "visitors", "views").
	 * Empty string for score-style achievements where "x / 100" reads clearly.
	 */
	unit: string;
}

/**
 * One read-only, per-portfolio snapshot that every achievement is measured
 * against. Prepared ONCE by the context builder so the evaluator never issues a
 * per-achievement query. All values come from existing managers/analyzers.
 */
export interface AchievementContext {
	/** The stable portfolio id every value below is keyed to. */
	portfolioId: string;
	/** The live portfolio record (identity + lifecycle metadata). */
	record: PortfolioRecord;
	/** Analytics counts for THIS portfolio only, plus export interactions. */
	counts: AnalyticsCounts & { exportClicks: number };
	/** Existing completion score (0-100), reused from the completion analyzer. */
	completionScore: number;
	/** Existing AI quality score (0-100), reused from the quality analyzer. */
	qualityScore: number;
	/** Portfolio creation timestamp (ISO-8601) — real data, not fabricated. */
	createdAt: string;
	/**
	 * The portfolio-scoped analytics event log. Rules read it to derive an
	 * honest `unlockedAt` from the real event that completed the milestone.
	 */
	events: readonly AnalyticsEvent[];
}

/**
 * An evaluation rule for ONE achievement id. Kept separate from definitions so
 * the definition stays pure data and the measurement stays testable.
 */
export type AchievementRule = {
	/** Returns the current measured value for a context. */
	measure: (context: AchievementContext) => number;
	/**
	 * Derives the real ISO-8601 timestamp when the milestone was reached, from
	 * the underlying event data. Returns null when no honest timestamp exists
	 * (e.g. score milestones, which the app never records as events).
	 */
	unlockedAt?: (context: AchievementContext) => string | null;
};

/**
 * Normalized progress for threshold achievements. `normalized` and `label`
 * are clamped so the displayed value NEVER exceeds the threshold.
 */
export interface AchievementProgress {
	/** Real current value (may exceed the threshold). */
	current: number;
	/** The value required to unlock. Always > 0. */
	threshold: number;
	/** 0-1, clamped. `min(current / threshold, 1)`. */
	normalized: number;
	/** Amount still needed to unlock, floored at 0. */
	remaining: number;
	/** Human-readable progress text, e.g. "8 / 10 visitors". */
	label: string;
}

/** One evaluated achievement for a single portfolio. */
export interface AchievementResult {
	/** The definition that produced this result. */
	definition: AchievementDefinition;
	/** Whether the portfolio data currently satisfies the achievement. */
	unlocked: boolean;
	/** Real unlock timestamp when derivable; null otherwise. Never fabricated. */
	unlockedAt: string | null;
	/** Numeric progress, or null for binary achievements. */
	progress: AchievementProgress | null;
}

/** The full evaluation output for one portfolio. */
export interface AchievementEvaluation {
	/** The stable portfolio id the results belong to. */
	portfolioId: string;
	/** Every known achievement evaluated, in definition order. */
	results: AchievementResult[];
	/** Number of currently unlocked achievements. */
	unlockedCount: number;
	/** Total number of known achievements. */
	totalCount: number;
}