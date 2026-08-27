import { deepEqual } from 'node:assert/strict';
import { test } from 'node:test';
import { selectRecentPortfolios } from '../src/lib/portfolio-manager/portfolio-card-utils.ts';

/**
 * Pure unit tests for the dashboard "recent portfolios" selector. Run with
 * Node's built-in test runner (no third-party framework):
 *
 *   node --experimental-strip-types --test scripts/*.test.ts
 */

/** Minimal record satisfying the selector's `{ id, updatedAt }` constraint. */
const rec = (id: string, updatedAt: string) => ({ id, updatedAt });

const ids = (records: ReadonlyArray<{ id: string }>): string[] => records.map((r) => r.id);

test('orders portfolios most-recently-updated first', () => {
	const out = selectRecentPortfolios(
		[
			rec('a', '2026-01-01T00:00:00.000Z'),
			rec('b', '2026-03-01T00:00:00.000Z'),
			rec('c', '2026-02-01T00:00:00.000Z'),
		],
		10
	);
	deepEqual(ids(out), ['b', 'c', 'a']);
});

test('caps the result at the requested limit', () => {
	const out = selectRecentPortfolios(
		[
			rec('a', '2026-01-01T00:00:00.000Z'),
			rec('b', '2026-03-01T00:00:00.000Z'),
			rec('c', '2026-02-01T00:00:00.000Z'),
		],
		2
	);
	deepEqual(ids(out), ['b', 'c']);
});

test('returns an empty list for a non-positive limit', () => {
	const one = [rec('a', '2026-01-01T00:00:00.000Z')];
	deepEqual(selectRecentPortfolios(one, 0), []);
	deepEqual(selectRecentPortfolios(one, -3), []);
});

test('breaks ties on id so ordering is deterministic', () => {
	const ts = '2026-01-01T00:00:00.000Z';
	const out = selectRecentPortfolios([rec('c', ts), rec('a', ts), rec('b', ts)], 10);
	deepEqual(ids(out), ['a', 'b', 'c']);
});

test('does not mutate the input array', () => {
	const input = [
		rec('a', '2026-01-01T00:00:00.000Z'),
		rec('b', '2026-03-01T00:00:00.000Z'),
	];
	const before = ids(input);
	selectRecentPortfolios(input, 10);
	deepEqual(ids(input), before);
});

test('handles an empty input', () => {
	deepEqual(selectRecentPortfolios([], 5), []);
});
