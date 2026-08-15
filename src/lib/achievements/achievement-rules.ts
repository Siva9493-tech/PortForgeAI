import type { AchievementRule, AchievementContext } from './achievement-types';
import { ANALYTICS_CLICK_TYPES, type AnalyticsEventType } from '../analytics/analytics-types';
import { isVisitorId, VISITOR_METADATA_KEY } from '../analytics/analytics-visitor';
import { AUDIENCE_MILESTONE_VISITORS, VIEWS_MILESTONE } from './achievement-definitions';

/**
 * Evaluation rules for the achievement system (Day-11 Task 12).
 *
 * Each rule knows how to MEASURE one achievement from a single prepared
 * `AchievementContext` and, where possible, derive a REAL unlock timestamp from
 * the underlying analytics events. Rules are kept separate from definitions so
 * the definitions remain pure data and new achievements slot in without
 * touching the evaluator.
 *
 * All measurements reuse existing data:
 *   - `context.completionScore` comes from the existing completion analyzer.
 *   - `context.qualityScore` comes from the existing AI quality analyzer.
 *   - `context.counts` comes from the existing analytics query layer.
 *   - `context.events` is the existing portfolio-scoped analytics event log.
 *
 * Nothing here modifies analytics events, portfolio content, or any store.
 */

/**
 * Real unlock timestamp for an event-based achievement: the timestamp of the
 * first matching analytics event. Returns null when the milestone was never
 * reached or no event can back the claim — the evaluator then reports an honest
 * `unlockedAt: null` instead of fabricating a timestamp.
 */
function firstEventTimestamp(
	context: AchievementContext,
	predicate: (type: AnalyticsEventType) => boolean
): string | null {
	for (const event of context.events) {
		if (predicate(event.eventType)) {
			return event.timestamp;
		}
	}
	return null;
}

/**
 * Real unlock timestamp for a count-based achievement: the timestamp of the
 * event that pushed the running count across the milestone. Returns null when
 * the count never reached the milestone.
 */
function milestoneEventTimestamp(
	context: AchievementContext,
	predicate: (type: AnalyticsEventType) => boolean,
	milestone: number
): string | null {
	let count = 0;
	for (const event of context.events) {
		if (predicate(event.eventType)) {
			count += 1;
			if (count >= milestone) {
				return event.timestamp;
			}
		}
	}
	return null;
}

/**
 * Real unlock timestamp for a UNIQUE-VISITOR milestone: the timestamp of the
 * view event that pushed the count of DISTINCT anonymous visitor tokens across
 * `portfolio_view` events across the milestone. Repeated views by the same
 * visitor never advance the distinct count, so the returned timestamp is the
 * honest moment the Nth distinct visitor arrived — never an earlier view by a
 * returning visitor. Returns null when the distinct count never reached the
 * milestone.
 */
function milestoneUniqueVisitorTimestamp(
	context: AchievementContext,
	milestone: number
): string | null {
	const seen = new Set<string>();
	for (const event of context.events) {
		if (event.eventType !== 'portfolio_view') {
			continue;
		}
		const visitorId = event.metadata?.[VISITOR_METADATA_KEY];
		if (!isVisitorId(visitorId) || seen.has(visitorId)) {
			continue;
		}
		seen.add(visitorId);
		if (seen.size >= milestone) {
			return event.timestamp;
		}
	}
	return null;
}

/**
 * The complete rule set, keyed by achievement id. Every definition in
 * `ACHIEVEMENT_DEFINITIONS` must have a rule here; the evaluator treats a
 * missing rule as an unreached (locked) achievement rather than throwing.
 */
export const ACHIEVEMENT_RULES: Record<string, AchievementRule> = {
	'portfolio-created': {
		measure: (context) => (context.record ? 1 : 0),
		unlockedAt: (context) => context.createdAt,
	},
	'portfolio-complete': {
		measure: (context) => context.completionScore,
		// No event records when the completion score crossed 100, so no honest
		// timestamp exists. `unlockedAt` is intentionally omitted (null).
	},
	'quality-builder': {
		measure: (context) => context.qualityScore,
		// Same as completion: score milestones have no event timestamp.
	},
	'first-visitor': {
		measure: (context) => context.counts.uniqueVisitors,
		unlockedAt: (context) => milestoneUniqueVisitorTimestamp(context, 1),
	},
	'first-click': {
		measure: (context) => context.counts.clicks,
		unlockedAt: (context) =>
			firstEventTimestamp(context, (type) => ANALYTICS_CLICK_TYPES.includes(type)),
	},
	'portfolio-shared': {
		measure: (context) => context.counts.exportClicks,
		unlockedAt: (context) =>
			firstEventTimestamp(context, (type) => type === 'export_click'),
	},
	'growing-audience': {
		measure: (context) => context.counts.uniqueVisitors,
		unlockedAt: (context) =>
			milestoneUniqueVisitorTimestamp(context, AUDIENCE_MILESTONE_VISITORS),
	},
	'widely-viewed': {
		measure: (context) => context.counts.views,
		unlockedAt: (context) =>
			milestoneEventTimestamp(
				context,
				(type) => type === 'portfolio_view',
				VIEWS_MILESTONE
			),
	},
};