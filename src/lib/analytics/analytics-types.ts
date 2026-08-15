/**
 * Core analytics data model for the Day-11 Analytics system.
 *
 * The model is deliberately small and extensible: a single reusable event
 * shape plus future metric models. Events use the existing stable portfolio id
 * (`PortfolioRecord.id`) and are never derived from titles, indexes, or
 * positions. No metric values are computed here — later Day-11 tasks populate
 * the metric models.
 */

/** Prepared analytics event types. Full tracking behavior ships in later tasks. */
export type AnalyticsEventType =
	| 'portfolio_view'
	| 'github_click'
	| 'linkedin_click'
	| 'project_click'
	| 'contact_click'
	| 'resume_click'
	| 'export_click';

/** The complete set of known analytics event types. */
export const ANALYTICS_EVENT_TYPES: readonly AnalyticsEventType[] = [
	'portfolio_view',
	'github_click',
	'linkedin_click',
	'project_click',
	'contact_click',
	'resume_click',
	'export_click',
];

/**
 * The subset of event types that represent visitor click interactions. Used to
 * distinguish meaningful clicks from page views and unique visitors so the
 * metrics never mix. Derived from `ANALYTICS_EVENT_TYPES` — no new events.
 */
export const ANALYTICS_CLICK_TYPES: readonly AnalyticsEventType[] = [
	'github_click',
	'linkedin_click',
	'project_click',
	'contact_click',
	'resume_click',
	'export_click',
];

/** The stable metadata key used to identify the project a `project_click` targets. */
export const PROJECT_METADATA_KEY = 'project';

/** True when a value is a known analytics event type. */
export function isAnalyticsEventType(value: unknown): value is AnalyticsEventType {
	return ANALYTICS_EVENT_TYPES.includes(value as AnalyticsEventType);
}

/** True when a value is a supported click interaction type. */
export function isAnalyticsClickType(value: unknown): value is AnalyticsEventType {
	return ANALYTICS_CLICK_TYPES.includes(value as AnalyticsEventType);
}

/**
 * Values allowed inside event metadata. Kept JSON-safe so events stay
 * serializable for the persistence layer.
 */
export type AnalyticsPrimitive = string | number | boolean | null | undefined;

/** Optional per-event structured data. Extensible for future event types. */
export type AnalyticsEventMetadata = Record<string, AnalyticsPrimitive>;

/**
 * A single recorded analytics event. `id` is unique per event, `portfolioId`
 * is the existing stable portfolio id, and `timestamp` is ISO-8601. Metadata
 * is optional and extensible — no unnecessary fields are predefined.
 */
export interface AnalyticsEvent {
	id: string;
	portfolioId: string;
	eventType: AnalyticsEventType;
	timestamp: string;
	metadata: AnalyticsEventMetadata | null;
}

/** Optional time bounds used by future time-filtering queries (ISO-8601). */
export interface AnalyticsTimeWindow {
	/** Inclusive lower bound. */
	start?: string;
	/** Inclusive upper bound. */
	end?: string;
}

/**
 * Count-based metrics a portfolio exposes once later Day-11 tasks compute
 * them. This is the model only — no values are calculated in Task 1.
 */
export interface AnalyticsCounts {
	views: number;
	uniqueVisitors: number;
	clicks: number;
}

/** Score-based metrics (0-100), also computed by later Day-11 tasks. */
export interface AnalyticsScores {
	completionScore: number;
	aiQualityScore: number;
}

/**
 * Aggregated analytics for a single portfolio. Keyed by the stable portfolio
 * id so multiple portfolios stay independent. Populated by future tasks.
 */
export interface PortfolioAnalyticsMetrics {
	portfolioId: string;
	counts: AnalyticsCounts;
	scores: AnalyticsScores;
}