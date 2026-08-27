import type { PortfolioStatus } from './portfolio-manager-types';

/** Human-readable label for a portfolio status. Never color-only. */
export function portfolioStatusText(status: PortfolioStatus): string {
	return status === 'published' ? 'Published' : 'Draft';
}

/** Semantic tone tokens for a portfolio status (dot + label classes). */
export function portfolioStatusTone(status: PortfolioStatus): { dot: string; label: string } {
	return status === 'published'
		? { dot: 'bg-semantic-success', label: 'text-semantic-success' }
		: { dot: 'bg-ink-tertiary', label: 'text-ink-subtle' };
}

/** Consistent, locale-aware display formatting for ISO-8601 timestamps. */
export function formatPortfolioDate(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
}

/** Date + time rendering for version-history timestamps. Readable, locale-aware. */
export function formatPortfolioDateTime(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) {
		return iso;
	}
	return new Intl.DateTimeFormat(undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit',
	}).format(date);
}

/**
 * Selects the most-recently-updated portfolios for a compact "recent" view,
 * newest first. Pure and non-mutating — the input is copied before sorting, so
 * the caller's array (e.g. the store's collection) is never reordered.
 *
 * ISO-8601 UTC timestamps compare lexicographically, so string comparison
 * orders them correctly without parsing; ties break on the stable id so the
 * order is deterministic across renders (never dependent on input order). A
 * non-positive limit yields an empty list. Generic over any record carrying an
 * `id` and `updatedAt`, so it stays free of DOM/store dependencies and is unit
 * testable in isolation.
 */
export function selectRecentPortfolios<T extends { id: string; updatedAt: string }>(
	records: ReadonlyArray<T>,
	limit: number
): T[] {
	if (limit <= 0) {
		return [];
	}
	return [...records]
		.sort((a, b) => {
			if (a.updatedAt !== b.updatedAt) {
				return a.updatedAt < b.updatedAt ? 1 : -1;
			}
			if (a.id === b.id) {
				return 0;
			}
			return a.id < b.id ? -1 : 1;
		})
		.slice(0, limit);
}