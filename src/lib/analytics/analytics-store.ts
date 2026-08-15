import type { AnalyticsEvent, AnalyticsEventMetadata, AnalyticsEventType } from './analytics-types';
import { isAnalyticsClickType, isAnalyticsEventType } from './analytics-types';
import {
	getClicksByType as countClicksByType,
	getPortfolioClicks as countPortfolioClicks,
	getPortfolioUniqueVisitors as countPortfolioUniqueVisitors,
	getPortfolioViews as countPortfolioViews,
	getProjectClicks as countProjectClicks,
} from './analytics-queries';
import { VISITOR_METADATA_KEY, getVisitorId } from './analytics-visitor';
import { generateAnalyticsEventId, nowIso, canUseStorage, toAnalyticsEventMetadata } from './analytics-utils';

export type AnalyticsListener = (events: ReadonlyArray<AnalyticsEvent>) => void;

export interface AnalyticsStoreOptions {
	persistKey?: string;
}

/** Input required to record one analytics event. */
export interface RecordAnalyticsEventInput {
	/** The existing stable portfolio id. Never a title, index, or position. */
	portfolioId: string;
	eventType: AnalyticsEventType;
	/** Optional ISO-8601 override (used for test/replay); defaults to now. */
	timestamp?: string;
	metadata?: AnalyticsEventMetadata;
}

interface PersistedState {
	events: AnalyticsEvent[];
}

/** Default storage key, consistent with the project's `portforge:*:v1` convention. */
const STORAGE_KEY = 'portforge:analytics:v1';

/** Validates an unknown persisted entry into a usable analytics event. */
function normalizePersistedEvent(value: unknown): AnalyticsEvent | null {
	if (typeof value !== 'object' || value === null) {
		return null;
	}
	const entry = value as Record<string, unknown>;
	if (
		typeof entry.id !== 'string' ||
		typeof entry.portfolioId !== 'string' ||
		typeof entry.timestamp !== 'string' ||
		!isAnalyticsEventType(entry.eventType)
	) {
		return null;
	}
	const metadata = toAnalyticsEventMetadata(entry.metadata);
	return {
		id: entry.id,
		portfolioId: entry.portfolioId,
		eventType: entry.eventType,
		timestamp: entry.timestamp,
		metadata,
	};
}

/**
 * The single source of truth for analytics events. Records and reads analytics
 * information only — it never touches portfolio content, lifecycle metadata, or
 * any other application store. Events are keyed by the existing stable
 * portfolio id, so multiple portfolios are isolated by construction.
 *
 * Follows the project's established store conventions: a class singleton with
 * `subscribe`/`notify`, guarded `localStorage` persistence, and safe
 * construction in any environment (empty at build/SSR time, restored in a
 * browser).
 */
export class AnalyticsStore {
	private readonly persistKey: string;
	private events: AnalyticsEvent[] = [];
	private readonly listeners = new Set<AnalyticsListener>();

	constructor(options: AnalyticsStoreOptions = {}) {
		this.persistKey = options.persistKey ?? STORAGE_KEY;
		this.restore();
	}

	/** All recorded events, oldest to newest. Read-only view. */
	getEvents(): ReadonlyArray<AnalyticsEvent> {
		return this.events;
	}

	/** Events for a single stable portfolio id only. Empty when none exist. */
	getPortfolioEvents(portfolioId: string): ReadonlyArray<AnalyticsEvent> {
		return this.events.filter((event) => event.portfolioId === portfolioId);
	}

	/** Total `portfolio_view` events recorded for a single portfolio id. */
	getPortfolioViews(portfolioId: string): number {
		return countPortfolioViews(this.events, portfolioId);
	}

	/**
	 * Number of distinct anonymous visitors for a single portfolio id. Reuses
	 * the `portfolio_view` event flow and stays isolated per portfolio.
	 */
	getUniqueVisitors(portfolioId: string): number {
		return countPortfolioUniqueVisitors(this.events, portfolioId);
	}

	/**
	 * Records a `portfolio_view` stamped with the visitor's anonymous id.
	 * Extends the existing portfolio-view flow in place — the recording path
	 * is unchanged, the visitor token rides along in event metadata.
	 */
	recordPortfolioView(portfolioId: string): AnalyticsEvent {
		return this.recordEvent({
			portfolioId,
			eventType: 'portfolio_view',
			metadata: { [VISITOR_METADATA_KEY]: getVisitorId() },
		});
	}

	/**
	 * Records a click interaction for a single stable portfolio id, stamped
	 * with the anonymous visitor id. Only click event types are accepted —
	 * anything else throws as a programmer-error guard so views/visitors are
	 * never mis-recorded as clicks.
	 */
	recordPortfolioClick(
		portfolioId: string,
		eventType: AnalyticsEventType,
		metadata?: AnalyticsEventMetadata
	): AnalyticsEvent {
		if (!isAnalyticsClickType(eventType)) {
			throw new Error(`Not a click event type: ${eventType}`);
		}
		return this.recordEvent({
			portfolioId,
			eventType,
			metadata: { [VISITOR_METADATA_KEY]: getVisitorId(), ...metadata },
		});
	}

	/** Total meaningful click interactions recorded for a portfolio id. */
	getPortfolioClicks(portfolioId: string): number {
		return countPortfolioClicks(this.events, portfolioId);
	}

	/** Clicks of a single (click) event type for a portfolio id. */
	getClicksByType(portfolioId: string, eventType: AnalyticsEventType): number {
		return countClicksByType(this.events, portfolioId, eventType);
	}

	/** Clicks on a single project's links for a portfolio id. */
	getProjectClicks(portfolioId: string, projectToken: string): number {
		return countProjectClicks(this.events, portfolioId, projectToken);
	}

	/**
	 * Records a single analytics event and returns it. The portfolio id must be
	 * non-empty so analytics never attach to an unnamed target; this is a
	 * programmer-error guard, not user-facing validation.
	 */
	recordEvent(input: RecordAnalyticsEventInput): AnalyticsEvent {
		const portfolioId = input.portfolioId.trim();
		if (!portfolioId) {
			throw new Error('Analytics requires a non-empty portfolioId.');
		}
		const event: AnalyticsEvent = {
			id: generateAnalyticsEventId(),
			portfolioId,
			eventType: input.eventType,
			timestamp: input.timestamp ?? nowIso(),
			metadata: input.metadata ?? null,
		};
		this.events.push(event);
		this.notify();
		return event;
	}

	/**
	 * Removes recorded events. With a `portfolioId`, only that portfolio's
	 * events are removed; without one, all events are removed. Returns the
	 * number of events removed.
	 */
	clearEvents(portfolioId?: string): number {
		const next = portfolioId
			? this.events.filter((event) => event.portfolioId !== portfolioId)
			: [];
		const removed = this.events.length - next.length;
		if (removed > 0) {
			this.events = next;
			this.notify();
		}
		return removed;
	}

	/** Resets analytics to the initial empty state. No-op when already empty. */
	reset(): void {
		if (this.events.length === 0) {
			return;
		}
		this.events = [];
		this.notify();
	}

	/** Registers a listener notified after any change. Returns an unsubscribe function. */
	subscribe(listener: AnalyticsListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/** Re-reads the persisted event log (no-op when storage is unavailable). */
	restore(): boolean {
		if (!canUseStorage()) {
			return false;
		}

		const raw = localStorage.getItem(this.persistKey);
		if (!raw) {
			return false;
		}

		try {
			const parsed = JSON.parse(raw) as Partial<PersistedState>;
			if (!Array.isArray(parsed.events)) {
				return false;
			}

			const restored = parsed.events
				.map(normalizePersistedEvent)
				.filter((event): event is AnalyticsEvent => event !== null);

			if (restored.length === 0) {
				return false;
			}

			this.events = restored;
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Persists the event log (no-op when storage is unavailable). Guarded so a
	 * storage failure is contained — it never throws out of record/clear and
	 * never leaves a partial log persisted.
	 */
	save(): boolean {
		if (!canUseStorage()) {
			return false;
		}
		try {
			const payload: PersistedState = { events: this.events };
			localStorage.setItem(this.persistKey, JSON.stringify(payload));
			return true;
		} catch {
			return false;
		}
	}

	private notify(): void {
		this.save();
		for (const listener of this.listeners) {
			listener(this.events);
		}
	}
}

/** The shared, application-wide analytics singleton. */
export const analyticsStore = new AnalyticsStore();