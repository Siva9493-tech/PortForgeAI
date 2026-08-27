import { generatePortfolioPackage, validatePortfolio } from '../publish';
import type { PortfolioPackage, PublishReadinessReport } from '../publish';
import { findBySlug } from './portfolio-repository';
import {
	publicUrlForSlug,
	resolvePublishSlug,
	suffixSlug,
} from './portfolio-slug';
import type { PortfolioRecord } from './portfolio-manager-types';
import { portfolioManagerStore } from './portfolio-manager-store';

/** Outcome of a single explicit publish attempt for a managed portfolio. */
export interface PublishPortfolioResult {
	ok: boolean;
	/** True when the portfolio was already published and nothing changed. */
	alreadyPublished: boolean;
	record: PortfolioRecord | undefined;
	readiness: PublishReadinessReport | null;
	/** Prepared publish payload, present when the record is ready. */
	package: PortfolioPackage | null;
	/** The final, unique public slug assigned to the published portfolio. */
	slug: string | null;
	/** The public URL for the slug (e.g. `/portfolio/my-ai-ml-portfolio`). */
	publicUrl: string | null;
	/** User-readable feedback for the publish action. */
	message: string;
}

/**
 * Upper bound on slug-suffixing attempts before a publish is reported as a
 * failure. Bounded so a pathological conflict storm can never loop forever.
 */
const SLUG_RETRY_LIMIT = 10;

/** True when an error is a Postgres unique-violation (the slug column). */
function isSlugConflict(error: unknown): boolean {
	const err = error as { code?: string; message?: string } | null;
	return err?.code === '23505' || /duplicate key/i.test(err?.message ?? '');
}

type PersistOutcome =
	| { ok: true; slug: string; record: PortfolioRecord }
	| { ok: false; reason: 'write-failed' | 'slug-exhausted' };

/**
 * Persists the published state (`status`, `slug`, `published_at`, `updated_at`)
 * to Supabase through the store, de-duplicating the slug against the unique
 * `portfolios.slug` column.
 *
 * Collision handling is two-layered:
 *   1. Pre-write detection via `findBySlug` for any collision the session is
 *      allowed to see (own rows at any status + other users' published rows).
 *   2. The write itself as a backstop: a hidden collision (e.g. another user's
 *      unpublished draft that RLS hides, but that still holds the slug) surfaces
 *      as a unique-violation on write, which we catch and bump the suffix for.
 *
 * A genuine (non-conflict) failure returns `write-failed` without mutating local
 * state — the store only records the change after Supabase succeeds.
 */
async function persistPublished(id: string, baseSlug: string): Promise<PersistOutcome> {
	let candidate = baseSlug;
	let counter = 2;

	for (;;) {
		// Visible collision: someone we can see already holds this slug.
		const conflicting = await findBySlug(candidate).catch(() => null);
		const takenByAnother = conflicting !== null && conflicting.id !== id;

		if (!takenByAnother) {
			try {
				const record = await portfolioManagerStore.publishPortfolio(id, candidate);
				return { ok: true, slug: candidate, record };
			} catch (error) {
				if (!isSlugConflict(error)) {
					return { ok: false, reason: 'write-failed' };
				}
				// Hidden collision surfaced on write — fall through to suffix.
			}
		}

		if (counter > SLUG_RETRY_LIMIT) {
			return { ok: false, reason: 'slug-exhausted' };
		}
		candidate = suffixSlug(baseSlug, counter);
		counter += 1;
	}
}

/**
 * Publishes a single managed portfolio by stable id. This is the only explicit
 * publish entry point — a portfolio is never published implicitly.
 *
 * Flow:
 *   1. Look up the record by its stable id (never title/index/position).
 *   2. Idempotency guard: an already-published portfolio returns unchanged —
 *      no new version, no timestamp bump, no re-run of the pipeline.
 *   3. Validate readiness with the existing Day-8 validator. On failure the
 *      status stays `draft` and a user-readable report is returned.
 *   4. Resolve a stable, unique public slug (see `resolvePublishSlug` and
 *      `persistPublished`). Existing slugs are reused; collisions are suffixed.
 *   5. Persist `status = 'published'`, `slug`, `published_at` and `updated_at`
 *      to Supabase through the store, which writes first and only reports
 *      success once the write has succeeded. No success is shown on failure.
 *   6. Build the publish payload (assets + manifest) once, reusing the Day-8
 *      package builder with the resolved slug.
 */
export async function publishPortfolio(id: string): Promise<PublishPortfolioResult> {
	const record = portfolioManagerStore.getPortfolio(id);
	if (!record) {
		return {
			ok: false,
			alreadyPublished: false,
			record: undefined,
			readiness: null,
			package: null,
			slug: null,
			publicUrl: null,
			message: 'Portfolio not found. It may have been removed.',
		};
	}

	if (record.status === 'published') {
		return {
			ok: true,
			alreadyPublished: true,
			record,
			readiness: null,
			package: null,
			slug: record.slug ?? null,
			publicUrl: record.slug ? publicUrlForSlug(record.slug) : null,
			message: 'This portfolio is already published.',
		};
	}

	const readiness = validatePortfolio(record.data);
	if (!readiness.ready) {
		return {
			ok: false,
			alreadyPublished: false,
			record,
			readiness,
			package: null,
			slug: null,
			publicUrl: null,
			message: `Cannot publish yet. Missing: ${readiness.missing.join(', ')}.`,
		};
	}

	const baseSlug = resolvePublishSlug(record);
	const outcome = await persistPublished(id, baseSlug);

	if (!outcome.ok) {
		return {
			ok: false,
			alreadyPublished: false,
			record,
			readiness,
			package: null,
			slug: null,
			publicUrl: null,
			message:
				outcome.reason === 'slug-exhausted'
					? 'Could not publish the portfolio. A unique public URL could not be reserved.'
					: 'Could not publish the portfolio. The change could not be saved.',
		};
	}

	const pkg = generatePortfolioPackage(outcome.record.data, { slug: outcome.slug });

	return {
		ok: true,
		alreadyPublished: false,
		record: outcome.record,
		readiness,
		package: pkg,
		slug: outcome.slug,
		publicUrl: publicUrlForSlug(outcome.slug),
		message: 'Portfolio published.',
	};
}
