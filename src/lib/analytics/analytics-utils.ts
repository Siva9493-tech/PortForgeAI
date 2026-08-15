import type { AnalyticsEventMetadata } from './analytics-types';

/**
 * Pure, dependency-free utilities for the Day-11 Analytics system. They mirror
 * the project's existing conventions (crypto UUID with fallback, ISO-8601
 * timestamps, guarded storage access) without coupling analytics to any other
 * domain module.
 */

/** Generates a unique analytics event id. Never derived from event content. */
export function generateAnalyticsEventId(): string {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
		return cryptoApi.randomUUID();
	}
	return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Consistent ISO-8601 timestamp used for every analytics field. */
export function nowIso(): string {
	return new Date().toISOString();
}

/** True when the value is an analytics-safe primitive. */
export function isAnalyticsPrimitive(value: unknown): value is string | number | boolean | null | undefined {
	return (
		value === null ||
		value === undefined ||
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean'
	);
}

/**
 * Validates an unknown value into a usable `AnalyticsEventMetadata` object.
 * Returns null for non-objects, arrays, or any non-primitive entry so malformed
 * persisted data is safely rejected instead of crashing the store.
 */
export function toAnalyticsEventMetadata(value: unknown): AnalyticsEventMetadata | null {
	if (typeof value !== 'object' || value === null || Array.isArray(value)) {
		return null;
	}
	const metadata: AnalyticsEventMetadata = {};
	for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
		if (!isAnalyticsPrimitive(entry)) {
			return null;
		}
		metadata[key] = entry;
	}
	return metadata;
}

/** True when browser storage is available and analytics may use it. */
export function canUseStorage(): boolean {
	return typeof localStorage !== 'undefined';
}