import type {
	AnalyticsEvent,
	AnalyticsEventMetadata,
	AnalyticsEventType,
} from './analytics-types';
import { PROJECT_METADATA_KEY } from './analytics-types';
import { analyticsStore } from './analytics-store';
import { getEventsInWindow } from './analytics-queries';
import { getTimeWindow, type AnalyticsTimeRange } from './analytics-time';

/**
 * Analytics Activity — the read-only event-history presentation layer.
 *
 * Activity is always derived from the events already recorded by the shared
 * analytics store; it never records, synthesizes, or invents events. Each item
 * is a thin, human-friendly view of one event for one portfolio, keyed by the
 * stable portfolio id (never a title, index, or position).
 *
 * Privacy is structural: the visitor token attached to events is stripped from
 * activity metadata, and only an explicit allow-list of metadata keys that
 * carry safe, useful context (`project`, `format`) is ever surfaced.
 *
 * The ordering contract is deterministic: newest first by ISO-8601 timestamp,
 * with the unique event id as a stable tie-breaker so identical timestamps
 * never produce unstable output. Events are never mutated in place.
 */

/** Number of activity items rendered initially. */
export const ACTIVITY_INITIAL_LIMIT = 20;

/** Number of additional items revealed by one "show more" step. */
export const ACTIVITY_PAGE_SIZE = 20;

/** Human-readable labels for the existing analytics event types. */
export const ACTIVITY_LABELS: Record<AnalyticsEventType, string> = {
	portfolio_view: 'Portfolio viewed',
	github_click: 'GitHub clicked',
	linkedin_click: 'LinkedIn clicked',
	project_click: 'Project opened',
	contact_click: 'Contact interaction',
	resume_click: 'Resume accessed',
	export_click: 'Portfolio exported',
};

/**
 * Metadata keys that may surface in activity. Everything else — most notably
 * the anonymous visitor id — is deliberately excluded from the activity view.
 */
const SAFE_ACTIVITY_METADATA_KEYS = [PROJECT_METADATA_KEY, 'format'] as const;

/** One human-readable activity entry derived from a single analytics event. */
export interface PortfolioActivityItem {
	/** The underlying analytics event id. */
	id: string;
	/** The existing stable portfolio id the event belongs to. */
	portfolioId: string;
	/** The existing analytics event type (never shown raw to users). */
	eventType: AnalyticsEventType;
	/** ISO-8601 timestamp of the event. */
	timestamp: string;
	/** Human-readable event label, e.g. "Portfolio viewed". */
	label: string;
	/** Optional safe context, e.g. which project was opened. */
	detail?: string;
	/** Sanitized metadata — only safe, allow-listed keys are present. */
	metadata: AnalyticsEventMetadata | null;
}

/** Paging options for the activity query. */
export interface PortfolioActivityOptions {
	/** Number of items to return. Defaults to the full (sorted) event list. */
	limit?: number;
	/** Number of items to skip from the newest item. Defaults to 0. */
	offset?: number;
	/** Time range to narrow events to. Defaults to all time. */
	range?: AnalyticsTimeRange;
}

/** A page of activity plus the total count, so callers can paginate. */
export interface PortfolioActivityPage {
	items: PortfolioActivityItem[];
	total: number;
}

/** Human-readable label for one existing analytics event type. */
export function getActivityLabel(eventType: AnalyticsEventType): string {
	return ACTIVITY_LABELS[eventType];
}

/**
 * Sorts analytics events newest first. ISO-8601 UTC strings compare
 * lexicographically, so string comparison is safe for the timestamps this
 * store writes; equal timestamps are broken deterministically by the unique
 * event id (descending). Operates on a copy — the source array is untouched.
 */
export function sortAnalyticsEventsNewestFirst(
	events: readonly AnalyticsEvent[]
): AnalyticsEvent[] {
	return events
		.slice()
		.sort(
			(a, b) =>
				b.timestamp.localeCompare(a.timestamp) || b.id.localeCompare(a.id)
		);
}

/** Strips everything except the allow-listed, safe context keys. */
function toSafeMetadata(
	metadata: AnalyticsEventMetadata | null
): AnalyticsEventMetadata | null {
	if (!metadata) {
		return null;
	}
	const safe: AnalyticsEventMetadata = {};
	for (const key of SAFE_ACTIVITY_METADATA_KEYS) {
		const value = metadata[key];
		if (typeof value === 'string' && value.trim().length > 0) {
			safe[key] = value.trim();
		}
	}
	return Object.keys(safe).length > 0 ? safe : null;
}

/** Builds the optional human-readable detail from safe metadata only. */
function toActivityDetail(event: AnalyticsEvent): string | null {
	if (!event.metadata) {
		return null;
	}
	if (event.eventType === 'project_click') {
		const project = event.metadata[PROJECT_METADATA_KEY];
		if (typeof project === 'string' && project.trim().length > 0) {
			return project.trim();
		}
	}
	if (event.eventType === 'export_click') {
		const format = event.metadata.format;
		if (typeof format === 'string' && format.trim().length > 0) {
			return format.trim().toUpperCase();
		}
	}
	return null;
}

/** Maps one analytics event to its activity representation. Read-only. */
function toActivityItem(event: AnalyticsEvent): PortfolioActivityItem {
	const metadata = toSafeMetadata(event.metadata);
	const detail = toActivityDetail(event);
	return {
		id: event.id,
		portfolioId: event.portfolioId,
		eventType: event.eventType,
		timestamp: event.timestamp,
		label: getActivityLabel(event.eventType),
		...(detail ? { detail } : {}),
		metadata,
	};
}

/**
 * Reusable activity query for a single stable portfolio id.
 *
 * Flow: portfolio id → analytics events → activity query → activity list.
 * Events are narrowed to the requested portfolio at the store query layer, so
 * unrelated portfolios are never scanned. The result is ordered newest first
 * and sliced to the requested `limit`/`offset`, while `total` always reports
 * the full count so the UI can reveal more without deleting old events.
 * Returns an empty page (never throws) for a portfolio with no events.
 */
export function getPortfolioActivity(
	portfolioId: string,
	options: PortfolioActivityOptions = {}
): PortfolioActivityPage {
	const portfolioEvents = analyticsStore.getPortfolioEvents(portfolioId);
	const window = options.range ? getTimeWindow(options.range) : null;
	const rangedEvents = window ? getEventsInWindow(portfolioEvents, window) : portfolioEvents;
	const sorted = sortAnalyticsEventsNewestFirst(rangedEvents);
	const total = sorted.length;
	const offset = Math.max(0, options.offset ?? 0);
	const limit = options.limit ?? total;
	const items = sorted.slice(offset, offset + limit).map(toActivityItem);
	return { items, total };
}
