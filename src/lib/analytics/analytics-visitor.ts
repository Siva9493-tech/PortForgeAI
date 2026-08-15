import { canUseStorage } from './analytics-utils';

/**
 * Privacy-conscious anonymous visitor identifier for the Day-11 Analytics
 * system.
 *
 * A visitor id is a random, non-personal token generated on the client and
 * stored only in the browser's `localStorage`. It is deliberately detached
 * from the portfolio domain: a portfolio id identifies a portfolio, while a
 * visitor id identifies an anonymous analytics visitor. The two are never
 * exchanged or conflated.
 *
 * The identifier is intentionally opaque so it cannot be reverse-engineered
 * into personal data — it carries no name, email, account reference, IP
 * address, location, fingerprint, or any other identifying signal.
 */

/** Storage key for the visitor token, following the `portforge:*:v1` convention. */
export const VISITOR_STORAGE_KEY = 'portforge:analytics:visitor:v1';

/** Metadata field name used to attach the anonymous visitor id to analytics events. */
export const VISITOR_METADATA_KEY = 'visitorId';

/** Prefix so visitor tokens are never mistaken for event or portfolio ids. */
const VISITOR_ID_PREFIX = 'vis-';

/** Generates a fresh anonymous visitor token. Pure random — no personal data. */
function generateVisitorId(): string {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
		return `${VISITOR_ID_PREFIX}${cryptoApi.randomUUID()}`;
	}
	return `${VISITOR_ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Module-level cache so repeated calls inside a session never re-derive or
 * re-persist the token. This is what makes refresh/re-render safe: a browser
 * reload restores the same id from storage, and any number of component
 * re-renders simply read the cached value.
 */
let cachedVisitorId: string | null = null;

/**
 * Returns the stable anonymous visitor token for the current browser.
 *
 * The token is created once and persisted across refreshes/sessions:
 *   1. return the module cache when present (no storage access);
 *   2. otherwise read the persisted token from `localStorage`;
 *   3. otherwise generate, persist, and cache a brand-new token.
 *
 * Outside a browser (SSR/build) it falls back to an in-memory token so this
 * function never throws, but analytics recording only happens on the client,
 * so the fallback is not reached in practice.
 */
export function getVisitorId(): string {
	if (cachedVisitorId !== null) {
		return cachedVisitorId;
	}

	if (canUseStorage()) {
		const persisted = localStorage.getItem(VISITOR_STORAGE_KEY);
		if (persisted) {
			cachedVisitorId = persisted;
			return cachedVisitorId;
		}

		const created = generateVisitorId();
		try {
			localStorage.setItem(VISITOR_STORAGE_KEY, created);
		} catch {
			// Storage unavailable or full: keep the in-memory token for this session.
		}
		cachedVisitorId = created;
		return cachedVisitorId;
	}

	cachedVisitorId = generateVisitorId();
	return cachedVisitorId;
}

/** True when a value is a usable anonymous visitor token. */
export function isVisitorId(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}