import type { PortfolioOutput } from '../ai';
import type { PortfolioRecord, PortfolioStatus, PortfolioVersion } from './portfolio-manager-types.ts';

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

/**
 * Deterministic semantic deep equality check for JSON-compatible structures.
 *
 * - Objects compare equal regardless of key insertion/serialization order.
 * - Arrays preserve order and compare element-by-element.
 * - Primitives and null are compared strictly.
 * - Undefined and missing object keys are treated equivalently.
 * - Does not mutate either input.
 */
export function deepSemanticEquals(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null || a === undefined || b === undefined) {
		return a === b;
	}
	if (typeof a !== 'object' || typeof b !== 'object') {
		return a === b;
	}

	const aIsArr = Array.isArray(a);
	const bIsArr = Array.isArray(b);
	if (aIsArr !== bIsArr) return false;

	if (aIsArr && bIsArr) {
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) {
			if (!deepSemanticEquals(a[i], b[i])) return false;
		}
		return true;
	}

	const objA = a as Record<string, unknown>;
	const objB = b as Record<string, unknown>;

	const keysA = Object.keys(objA).filter((k) => objA[k] !== undefined);
	const keysB = Object.keys(objB).filter((k) => objB[k] !== undefined);

	if (keysA.length !== keysB.length) return false;

	for (const key of keysA) {
		if (!Object.prototype.hasOwnProperty.call(objB, key) && objB[key] === undefined) {
			return false;
		}
		if (!deepSemanticEquals(objA[key], objB[key])) {
			return false;
		}
	}

	return true;
}

/**
 * Change detection for two normalized portfolio outputs. Compares the full
 * content independent of key serialization order (e.g. Postgres jsonb reordering),
 * but ignores `metadata`, whose timestamps are regenerated on every transform.
 */
export function portfolioOutputEquals(a: PortfolioOutput, b: PortfolioOutput): boolean {
	const { metadata: _mA, ...contentA } = a;
	const { metadata: _mB, ...contentB } = b;
	return deepSemanticEquals(contentA, contentB);
}

/**
 * Builds a bounded localStorage cache payload containing only the active version snapshot
 * per record, preventing unbounded cache growth from historical versions.
 */
export function buildBoundedCachePayload(records: PortfolioRecord[]): { records: PortfolioRecord[] } {
	const boundedRecords = records.map((record) => {
		const currentSnapshot: PortfolioVersion = {
			version: record.currentVersion,
			title: record.title,
			data: record.data,
			createdAt: record.updatedAt,
		};
		return {
			...record,
			versions: [currentSnapshot],
		};
	});
	return { records: boundedRecords };
}

/**
 * Safely persists records to localStorage cache with bounded history and base64 quota fallback.
 * Gracefully absorbs QuotaExceededError and returns boolean success without throwing.
 */
export function safePersistCache(records: PortfolioRecord[], storageKey: string): boolean {
	if (typeof globalThis.localStorage === 'undefined') {
		return false;
	}
	try {
		const payload = buildBoundedCachePayload(records);
		globalThis.localStorage.setItem(storageKey, JSON.stringify(payload));
		return true;
	} catch {
		try {
			// Secondary fallback if still exceeding quota: prune large base64 previews in cached copy only
			const fallbackRecords = records.map((record) => {
				const prunedData = clonePortfolioData(record.data);
				if (prunedData.builder?.profilePhoto && typeof prunedData.builder.profilePhoto === 'object') {
					const photo = prunedData.builder.profilePhoto;
					if (typeof photo.dataUrl === 'string' && photo.dataUrl.length > 512) {
						photo.dataUrl = '';
					}
				}
				return {
					...record,
					versions: [{
						version: record.currentVersion,
						title: record.title,
						data: prunedData,
						createdAt: record.updatedAt,
					}],
					data: prunedData,
				};
			});
			globalThis.localStorage.setItem(storageKey, JSON.stringify({ records: fallbackRecords }));
			return true;
		} catch {
			console.warn('[portfolio-store] Local storage cache write failed (quota exceeded). In-memory state preserved.');
			return false;
		}
	}
}