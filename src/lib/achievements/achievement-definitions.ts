import type { AchievementCategory, AchievementDefinition } from './achievement-types';

/**
 * Initial achievement set for Day-11 Task 12.
 *
 * Every achievement below is backed by REAL, existing application data:
 *   - portfolio records (existence, creation time)
 *   - the existing completion score (already computed, not recalculated here)
 *   - the existing AI quality score (already computed, not recalculated here)
 *   - existing analytics events (views, unique visitors, clicks, exports)
 *
 * No hardcoded users, sample data, randomness, UI actions, or page refreshes
 * are used. A portfolio must genuinely satisfy the condition to unlock.
 */

/** Human-readable labels for the supported achievement categories. */
export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
	creation: 'Portfolio Creation',
	completion: 'Portfolio Completion',
	quality: 'Portfolio Quality',
	engagement: 'Portfolio Engagement',
	sharing: 'Portfolio Sharing',
	growth: 'Portfolio Growth',
};

/** Completion-score threshold treated as "portfolio is complete". */
export const COMPLETE_SCORE_THRESHOLD = 100;

/** AI-quality-score threshold treated as "high quality builder". */
export const QUALITY_SCORE_THRESHOLD = 80;

/** Unique-visitor count treated as a meaningful audience milestone. */
export const AUDIENCE_MILESTONE_VISITORS = 10;

/** Portfolio-view count treated as a "widely viewed" milestone. */
export const VIEWS_MILESTONE = 50;

/**
 * The complete initial achievement set, in a stable display order. Adding a
 * future achievement requires appending a definition here AND a matching rule
 * in `achievement-rules` — the evaluator itself never changes.
 */
export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
	{
		id: 'portfolio-created',
		name: 'Portfolio Created',
		description: 'You created your first portfolio.',
		requirement: 'Create a portfolio to unlock this achievement.',
		icon: 'rocket',
		category: 'creation',
		binary: true,
		threshold: 1,
		unit: '',
	},
	{
		id: 'portfolio-complete',
		name: 'Portfolio Complete',
		description: 'Your portfolio reaches a 100% completion score.',
		requirement: 'Fill out every section to reach a 100% completion score.',
		icon: 'badge-check',
		category: 'completion',
		binary: false,
		threshold: COMPLETE_SCORE_THRESHOLD,
		unit: '',
	},
	{
		id: 'quality-builder',
		name: 'Quality Builder',
		description: 'Your portfolio content scores 80 or higher on AI Quality.',
		requirement: 'Strengthen your content to reach an AI Quality score of 80 or higher.',
		icon: 'sparkles',
		category: 'quality',
		binary: false,
		threshold: QUALITY_SCORE_THRESHOLD,
		unit: '',
	},
	{
		id: 'first-visitor',
		name: 'First Visitor',
		description: 'Your portfolio receives its first real visitor.',
		requirement: 'Share your portfolio and earn your first unique visitor.',
		icon: 'eye',
		category: 'engagement',
		binary: true,
		threshold: 1,
		unit: 'visitor',
	},
	{
		id: 'first-click',
		name: 'First Click',
		description: 'A visitor clicks a link on your portfolio.',
		requirement: 'Receive your first tracked click interaction.',
		icon: 'mouse-pointer-click',
		category: 'engagement',
		binary: true,
		threshold: 1,
		unit: 'click',
	},
	{
		id: 'portfolio-shared',
		name: 'Portfolio Shared',
		description: 'You export your portfolio for sharing.',
		requirement: 'Export your portfolio at least once to unlock this achievement.',
		icon: 'share',
		category: 'sharing',
		binary: true,
		threshold: 1,
		unit: 'export',
	},
	{
		id: 'growing-audience',
		name: 'Growing Audience',
		description: 'Your portfolio reaches 10 unique visitors.',
		requirement: 'Reach 10 unique visitors on your portfolio.',
		icon: 'users',
		category: 'growth',
		binary: false,
		threshold: AUDIENCE_MILESTONE_VISITORS,
		unit: 'visitor',
	},
	{
		id: 'widely-viewed',
		name: 'Widely Viewed',
		description: 'Your portfolio is viewed 50 times.',
		requirement: 'Reach 50 portfolio views.',
		icon: 'trending-up',
		category: 'growth',
		binary: false,
		threshold: VIEWS_MILESTONE,
		unit: 'view',
	},
];

/** Looks up a definition by its stable id. */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
	return ACHIEVEMENT_DEFINITIONS.find((definition) => definition.id === id);
}