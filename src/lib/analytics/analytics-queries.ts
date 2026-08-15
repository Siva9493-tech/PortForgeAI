import type { AnalyticsEvent, AnalyticsEventType, AnalyticsTimeWindow } from './analytics-types';
import { ANALYTICS_EVENT_TYPES, isAnalyticsClickType, PROJECT_METADATA_KEY } from './analytics-types';
import { isVisitorId, VISITOR_METADATA_KEY } from './analytics-visitor';

/**
 * Pure analytics queries. These operate on immutable event arrays and never
 * touch the store or any other application state. Task 1 provides the
 * structural queries (per-portfolio, time-window, event-type counts); the
 * derived metrics (views, clicks, completion/quality scores) are computed by
 * later Day-11 tasks on top of these. Unique visitor counting lives here too
 * and reuses the prevailing `portfolio_view` event flow.
 */

/** Events belonging to a single stable portfolio id. */
export function getEventsForPortfolio(
	events: readonly AnalyticsEvent[],
	portfolioId: string
): readonly AnalyticsEvent[] {
	return events.filter((event) => event.portfolioId === portfolioId);
}

/**
 * Events inside an optional time window. ISO-8601 UTC strings compare
 * lexicographically, so string comparisons are safe for the timestamps this
 * store writes. Bounds are inclusive; missing bounds are unbounded.
 */
export function getEventsInWindow(
	events: readonly AnalyticsEvent[],
	window: AnalyticsTimeWindow
): readonly AnalyticsEvent[] {
	return events.filter((event) => {
		if (window.start !== undefined && event.timestamp < window.start) {
			return false;
		}
		if (window.end !== undefined && event.timestamp > window.end) {
			return false;
		}
		return true;
	});
}

/**
 * Counts events per type, always returning a zero-filled record for every
 * known type so consumers get a stable shape regardless of the current log.
 */
export function countEventsByType(
	events: readonly AnalyticsEvent[]
): Record<AnalyticsEventType, number> {
	const counts = Object.fromEntries(ANALYTICS_EVENT_TYPES.map((type) => [type, 0])) as Record<
		AnalyticsEventType,
		number
	>;
	for (const event of events) {
		counts[event.eventType] += 1;
	}
	return counts;
}

/** Total number of events in the provided set. */
export function eventCount(events: readonly AnalyticsEvent[]): number {
	return events.length;
}

/**
 * Total views recorded for a single stable portfolio id. Counts only
 * `portfolio_view` events and never crosses portfolio boundaries, so
 * multi-portfolio totals never combine incorrectly.
 */
export function getPortfolioViews(
	events: readonly AnalyticsEvent[],
	portfolioId: string
): number {
	return getEventsForPortfolio(events, portfolioId).filter(
		(event) => event.eventType === 'portfolio_view'
	).length;
}

/**
 * Unique visitors for a single stable portfolio id. Each distinct anonymous
 * visitor token on a `portfolio_view` event counts once, regardless of how
 * many times that visitor viewed the portfolio.
 *
 * Portfolio isolation is strict: events are narrowed to the requested
 * portfolio before deduplication, so the same visitor counting against two
 * different portfolios is counted once in each — never shared across them.
 *
 * A single pass with a `Set` keeps the calculation lightweight and avoids
 * scanning unrelated portfolios. An optional time window (inclusive ISO-8601
 * bounds) is applied inline so callers never need a second pass.
 */
export function getPortfolioUniqueVisitors(
	events: readonly AnalyticsEvent[],
	portfolioId: string,
	window?: AnalyticsTimeWindow
): number {
	const seen = new Set<string>();
	for (const event of getEventsForPortfolio(events, portfolioId)) {
		if (event.eventType !== 'portfolio_view') {
			continue;
		}
		if (window !== undefined) {
			if (window.start !== undefined && event.timestamp < window.start) {
				continue;
			}
			if (window.end !== undefined && event.timestamp > window.end) {
				continue;
			}
		}
		const visitorId = event.metadata?.[VISITOR_METADATA_KEY];
		if (isVisitorId(visitorId)) {
			seen.add(visitorId);
		}
	}
	return seen.size;
}

/**
 * Total meaningful click interactions recorded for a single portfolio id.
 * Counts only the click event types (GitHub, LinkedIn, project, contact,
 * resume, export). Page views and unique-visitor counts are deliberately never
 * included, so this metric stays independent of the other two.
 */
export function getPortfolioClicks(
	events: readonly AnalyticsEvent[],
	portfolioId: string
): number {
	return getEventsForPortfolio(events, portfolioId).filter((event) =>
		isAnalyticsClickType(event.eventType)
	).length;
}

/**
 * Clicks of a single event type for a portfolio id. Any non-click event type
 * returns 0 rather than mixing view/visitor metrics into click analytics.
 */
export function getClicksByType(
	events: readonly AnalyticsEvent[],
	portfolioId: string,
	eventType: string
): number {
	if (!isAnalyticsClickType(eventType)) {
		return 0;
	}
	return getEventsForPortfolio(events, portfolioId).filter(
		(event) => event.eventType === eventType
	).length;
}

/**
 * Clicks on a single project's links for a portfolio id. Uses the stable
 * project identity carried in event metadata (`PROJECT_METADATA_KEY`), which
 * distills to `project.id ?? project.name` at render time. Distinct projects
 * never combine, and multi-portfolio isolation is preserved by construction.
 */
export function getProjectClicks(
	events: readonly AnalyticsEvent[],
	portfolioId: string,
	projectToken: string
): number {
	return getEventsForPortfolio(events, portfolioId).filter(
		(event) =>
			event.eventType === 'project_click' &&
			event.metadata?.[PROJECT_METADATA_KEY] === projectToken
	).length;
}