import type { AnalyticsTimeWindow } from './analytics-types';

/**
 * Analytics Time Filtering for the Day-11 Analytics system.
 *
 * A time range is a user-facing preset (Today, Last 7 Days, Last 30 Days,
 * All Time) that narrows the event-derived metrics and the activity list.
 * Everything is read-only: stored event timestamps are never modified, and the
 * range is resolved into a reusable `AnalyticsTimeWindow` consumed by the
 * existing query layer (`getEventsInWindow`).
 *
 * ── Date/time boundary convention ───────────────────────────────────────────
 * Events are recorded as ISO-8601 UTC strings via `nowIso()`. Ranges are
 * anchored to the user's LOCAL calendar day (the same convention the browser
 * uses to render the analytics page), converted to UTC instants so event
 * timestamps and boundaries are compared in one consistent frame:
 *
 *   today         start = local midnight of today (inclusive)
 *   last_7_days   start = local midnight 6 days before today (inclusive)
 *   last_30_days  start = local midnight 29 days before today (inclusive)
 *   all_time      no bound — every event for the portfolio
 *
 *   end (all bounded ranges) = local midnight of the NEXT day, minus 1 ms,
 *                              i.e. effectively exclusive of tomorrow's start.
 *
 * The minus-1 ms end keeps the inclusive `getEventsInWindow` comparison exact
 * for the millisecond-precision timestamps this store writes, so an event
 * recorded at 00:00:00.000 tomorrow is never miscounted into "today" and no
 * genuine boundary event is dropped. ISO-8601 UTC strings share one format,
 * so lexicographic comparison is safe — no formatted display strings are used
 * for filtering, and local timezone offsets cannot cause off-by-one errors.
 */

/** The four user-facing time ranges. */
export type AnalyticsTimeRange = 'today' | 'last_7_days' | 'last_30_days' | 'all_time';

/** All supported time ranges, in display order. */
export const ANALYTICS_TIME_RANGES: readonly AnalyticsTimeRange[] = [
	'today',
	'last_7_days',
	'last_30_days',
	'all_time',
];

/** Human-readable labels for the time-range control. */
export const ANALYTICS_TIME_RANGE_LABELS: Record<AnalyticsTimeRange, string> = {
	today: 'Today',
	last_7_days: '7 Days',
	last_30_days: '30 Days',
	all_time: 'All Time',
};

/** True when a value is a known analytics time range. */
export function isAnalyticsTimeRange(value: unknown): value is AnalyticsTimeRange {
	return ANALYTICS_TIME_RANGES.includes(value as AnalyticsTimeRange);
}

/** Local midnight for a given date (the browser's calendar-day boundary). */
function startOfLocalDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Resolves a time range into an inclusive `AnalyticsTimeWindow`, or null for
 * `all_time`. Boundaries are computed from the browser's local calendar day so
 * "Today" and the 7/30-day windows share one consistent convention.
 */
export function getTimeWindow(
	range: AnalyticsTimeRange,
	now: Date = new Date()
): AnalyticsTimeWindow | null {
	if (range === 'all_time') {
		return null;
	}
	const base = startOfLocalDay(now);
	const dayOffset = range === 'last_7_days' ? -6 : range === 'last_30_days' ? -29 : 0;
	const start = new Date(base.getFullYear(), base.getMonth(), base.getDate() + dayOffset);
	const end = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
	return {
		start: start.toISOString(),
		end: new Date(end.getTime() - 1).toISOString(),
	};
}
