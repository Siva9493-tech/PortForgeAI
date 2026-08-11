import type { PortfolioOutput } from '../ai';
import type { PortfolioStatus } from './portfolio-manager-types';

/** Generates a stable, unique portfolio id. Never derived from the title. */
export function generatePortfolioId(): string {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
		return cryptoApi.randomUUID();
	}
	return `pf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Consistent ISO-8601 timestamp used for every date field. */
export function isoNow(): string {
	return new Date().toISOString();
}

/** True when a value is a supported portfolio status. */
export function isPortfolioStatus(value: unknown): value is PortfolioStatus {
	return value === 'draft' || value === 'published';
}

/**
 * Copy label used for duplicated portfolios. Reuses the existing `(Copy)`
 * convention and avoids creating multiple identical titles by appending a
 * numeric suffix when the base copy label already exists in the collection.
 */
export function duplicateTitle(title: string, existingTitles: readonly string[] = []): string {
	const base = `${title} (Copy)`;
	if (!existingTitles.includes(base)) {
		return base;
	}
	let index = 2;
	while (existingTitles.includes(`${title} (Copy ${index})`)) {
		index += 1;
	}
	return `${title} (Copy ${index})`;
}

/**
 * Defensive deep clone for portfolio data. Portfolio data is plain
 * JSON-serializable content (strings, numbers, booleans, arrays, null), so a
 * JSON round-trip is safe and avoids sharing mutable references with callers.
 */
export function clonePortfolioData<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

/** Comparable content of an output, ignoring generated metadata timestamps. */
function portfolioContent(value: PortfolioOutput): string {
	const { metadata, ...content } = value;
	void metadata;
	return JSON.stringify(content);
}

/**
 * Change detection for two normalized portfolio outputs. Compares the full
 * content but ignores `metadata`, whose timestamps are regenerated on every
 * transform and would otherwise mark every save as a change. Uses the same
 * JSON serialization strategy as the store's existing cloning — no new
 * dependency. Both values come from the same transform pipeline, so property
 * order is stable and a JSON comparison is a dependable deep equality check.
 */
export function portfolioOutputEquals(a: PortfolioOutput, b: PortfolioOutput): boolean {
	return portfolioContent(a) === portfolioContent(b);
}