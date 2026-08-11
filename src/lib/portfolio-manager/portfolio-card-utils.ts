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