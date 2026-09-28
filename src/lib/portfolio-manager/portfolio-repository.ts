import type { PortfolioOutput } from '../ai';
import { supabase } from '../supabase';
import type {
	PortfolioRecord,
	PortfolioStatus,
	PortfolioVersion,
} from './portfolio-manager-types';
import {
	clonePortfolioData,
	isPortfolioStatus,
	isoNow,
} from './portfolio-manager-utils';
import { suffixSlug } from './portfolio-slug';

/**
 * Thin persistence adapter for portfolios over the existing Supabase client.
 *
 * It is the ONLY layer that speaks snake_case. Every function takes or returns
 * the domain `PortfolioRecord` (camelCase) so the store and renderers never see
 * database column names.
 *
 * Layer notes:
 *   - RLS policies already scope reads/writes to the authenticated user; these
 *     queries add explicit `user_id` / `id` filters on top of that.
 *   - V1 stores ONLY the current snapshot in the `data` jsonb column. The
 *     database has no `versions` / `current_version` columns, so a row maps to a
 *     single-snapshot record (`currentVersion` = 1, `versions` = [snapshot]).
 *     Version history is intentionally not persisted or invented here.
 */

/** snake_case row shape as stored in `public.portfolios`. */
interface PortfolioRow {
	id: string;
	user_id: string;
	title: string;
	slug: string | null;
	status: string;
	data: PortfolioOutput;
	created_at: string;
	updated_at: string;
	published_at: string | null;
}

/** Fields that may be changed on an existing portfolio, in domain casing. */
export interface PortfolioUpdatePatch {
	title?: string;
	slug?: string | null;
	status?: PortfolioStatus;
	data?: PortfolioOutput;
	publishedAt?: string | null;
}

/**
 * Columns read/written for every operation. `user_id` is filtered on rather
 * than returned to the domain, but is selected so the row type stays honest for
 * inserts (which set it explicitly).
 */
const COLUMNS =
	'id, user_id, title, slug, status, data, created_at, updated_at, published_at';

/**
 * The public slug to persist with a portfolio. A portfolio only gets a slug
 * when its SEO output defines one; drafts without one keep `NULL` so the unique
 * slug column is never accidentally collisioned by templated titles.
 */
function resolveInitialSlug(data: PortfolioOutput): string | null {
	return data.seo?.slug ?? null;
}

/**
 * Maps a snake_case `public.portfolios` row into the domain `PortfolioRecord`.
 * `data` is deep-cloned so the record owns its content; `currentVersion` is `1`
 * and `versions` holds that single snapshot (the V1 representation of a row that
 * carries no version history).
 */
function mapRowToRecord(row: PortfolioRow): PortfolioRecord {
	const data = clonePortfolioData(row.data);
	const status: PortfolioStatus = isPortfolioStatus(row.status) ? row.status : 'draft';
	const snapshot: PortfolioVersion = {
		version: 1,
		title: row.title,
		data,
		createdAt: row.created_at,
	};

	return {
		id: row.id,
		title: row.title,
		status,
		slug: row.slug,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
		publishedAt: row.published_at,
		currentVersion: 1,
		versions: [snapshot],
		data,
	};
}

/** Lists every portfolio owned by a user, oldest to newest. */
export async function listForUser(userId: string): Promise<PortfolioRecord[]> {
	const { data, error } = await supabase
		.from('portfolios')
		.select(COLUMNS)
		.eq('user_id', userId);

	if (error) {
		throw error;
	}

	return (data ?? []).map(mapRowToRecord);
}

/** Returns a single portfolio by id, or null when it does not exist. */
export async function getById(id: string): Promise<PortfolioRecord | null> {
	const { data, error } = await supabase
		.from('portfolios')
		.select(COLUMNS)
		.eq('id', id)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data ? mapRowToRecord(data) : null;
}

/**
 * Returns any portfolio visible to the current session that holds the given
 * slug, or null when none does. Because `portfolios.slug` is UNIQUE, a single
 * row can match — but RLS limits a querying user to their own rows (any status)
 * plus other users' published rows, so a slug held by another user's unpublished
 * draft is invisible here. Use this to detect (and suffix around) collisions that
 * the session is actually allowed to see; the unique constraint is the backstop
 * for anything RLS hides.
 */
export async function findBySlug(slug: string): Promise<PortfolioRecord | null> {
	const { data, error } = await supabase
		.from('portfolios')
		.select(COLUMNS)
		.eq('slug', slug)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data ? mapRowToRecord(data) : null;
}

/** True when an error is a Postgres unique-violation on portfolios.slug. */
export function isSlugConflict(error: unknown): boolean {
	const err = error as { code?: string; message?: string } | null;
	return err?.code === '23505' || /duplicate key|portfolios_slug_key/i.test(err?.message ?? '');
}

/** Checks whether a slug is already taken in Supabase by another portfolio. */
export async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
	const existing = await findBySlug(slug).catch(() => null);
	if (!existing) return false;
	return existing.id !== excludeId;
}

/**
 * Inserts a portfolio, preserving the caller-supplied id and timestamps.
 * Always resolves against the active Supabase authenticated user to prevent
 * RLS mismatches with stale cached user IDs.
 * Retries with deterministic slug suffixing if a hidden or concurrent slug collision occurs.
 */
export async function create(record: PortfolioRecord, userId?: string): Promise<PortfolioRecord> {
	const { data: authData } = await supabase.auth.getUser();
	const authUserId = authData?.user?.id ?? userId;
	if (!authUserId) {
		throw new Error('User must be authenticated to create a portfolio.');
	}

	let candidateSlug = record.slug ?? resolveInitialSlug(record.data);
	const baseSlug = candidateSlug ? candidateSlug.replace(/-\d+$/, '') : 'portfolio';
	let counter = 2;
	const maxRetries = 10;

	for (;;) {
		const row = {
			id: record.id,
			user_id: authUserId,
			title: record.title,
			slug: candidateSlug,
			status: record.status,
			data: {
				...record.data,
				seo: record.data.seo
					? {
							...record.data.seo,
							slug: candidateSlug ?? record.data.seo.slug,
							canonicalUrl: candidateSlug ? `/p/${candidateSlug}` : record.data.seo.canonicalUrl,
							ogImage: candidateSlug ? `/og/${candidateSlug}.png` : record.data.seo.ogImage,
						}
					: record.data.seo,
			},
			created_at: record.createdAt,
			updated_at: record.updatedAt,
			published_at: record.publishedAt,
		};

		const { data, error } = await supabase
			.from('portfolios')
			.insert(row)
			.select(COLUMNS)
			.single();

		if (!error && data) {
			return mapRowToRecord(data);
		}

		if (error && isSlugConflict(error) && counter <= maxRetries) {
			candidateSlug = suffixSlug(baseSlug, counter);
			counter += 1;
			continue;
		}

		if (error) {
			console.error('[portfolio-repository] Failed to create portfolio in Supabase:', error);
			throw error;
		}

		throw new Error('Unknown error while creating portfolio.');
	}
}

/**
 * Updates only the fields supplied by the patch, bumping `updated_at`. Returns
 * the updated record, or null when no portfolio with that id exists.
 * Retries with deterministic slug suffixing if a slug update collides.
 */
export async function update(
	id: string,
	patch: PortfolioUpdatePatch,
): Promise<PortfolioRecord | null> {
	const row: Record<string, unknown> = {};

	if (patch.title !== undefined) {
		row.title = patch.title;
	}
	if (patch.status !== undefined) {
		row.status = patch.status;
	}
	if (patch.data !== undefined) {
		row.data = patch.data;
	}
	if (patch.publishedAt !== undefined) {
		row.published_at = patch.publishedAt;
	}

	row.updated_at = isoNow();

	let candidateSlug = patch.slug;
	const baseSlug = candidateSlug ? candidateSlug.replace(/-\d+$/, '') : undefined;
	let counter = 2;
	const maxRetries = 10;

	for (;;) {
		if (candidateSlug !== undefined) {
			row.slug = candidateSlug;
			if (row.data && typeof row.data === 'object' && 'seo' in (row.data as object)) {
				const currentData = row.data as PortfolioOutput;
				if (currentData.seo) {
					currentData.seo.slug = candidateSlug;
					currentData.seo.canonicalUrl = `/p/${candidateSlug}`;
					currentData.seo.ogImage = `/og/${candidateSlug}.png`;
				}
			}
		}

		const { data, error } = await supabase
			.from('portfolios')
			.update(row)
			.eq('id', id)
			.select(COLUMNS)
			.maybeSingle();

		if (!error) {
			return data ? mapRowToRecord(data) : null;
		}

		if (error && isSlugConflict(error) && baseSlug && counter <= maxRetries) {
			candidateSlug = suffixSlug(baseSlug, counter);
			counter += 1;
			continue;
		}

		if (error) {
			console.error('[portfolio-repository] Failed to update portfolio in Supabase:', error);
			throw error;
		}

	}
}

/**
 * Deletes a portfolio by id. Returns true when a row was actually removed and
 * false when the id did not exist (idempotent). Throws on a real query/RLS
 * failure.
 */
export async function remove(id: string): Promise<boolean> {
	const { data, error } = await supabase
		.from('portfolios')
		.delete()
		.eq('id', id)
		.select('id');

	if (error) {
		throw error;
	}

	return (data?.length ?? 0) > 0;
}

/** Returns the portfolio published under a given slug, or null when none. */
export async function getPublishedBySlug(slug: string): Promise<PortfolioRecord | null> {
	const { data, error } = await supabase
		.from('portfolios')
		.select(COLUMNS)
		.eq('slug', slug)
		.eq('status', 'published')
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data ? mapRowToRecord(data) : null;
}

/**
 * Lists every public slug currently exposed by a published portfolio. Returns
 * only rows that pass the same RLS gate the public route relies on
 * (`status = 'published'` and a non-null slug), so a caller can enumerate the
 * set of public URLs without ever seeing an unpublished or un-slugged draft.
 *
 * Used only by the static public route's `getStaticPaths` to pre-render the
 * pages that exist at build time. Empty strings are filtered out defensively
 * (the publish flow normalizes slugs, but a malformed row must never yield a
 * false public URL). Throws on a real query/RLS failure; the caller decides
 * whether to degrade.
 */
export async function listPublishedSlugs(): Promise<string[]> {
	const { data, error } = await supabase
		.from('portfolios')
		.select('slug')
		.eq('status', 'published')
		.not('slug', 'is', null);

	if (error) {
		throw error;
	}

	return (data ?? [])
		.map((row) => row.slug)
		.filter((slug): slug is string => typeof slug === 'string' && slug.trim() !== '');
}
