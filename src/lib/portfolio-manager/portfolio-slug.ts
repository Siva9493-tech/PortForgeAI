import { generatePublishSlug } from '../publish/publish-utils.ts';

/**
 * Pure, dependency-light slug helpers for the publish flow. Separated from
 * `portfolio-publish.ts` (which owns the Supabase write/retry orchestration) so
 * the deterministic slug decisions can be unit-tested without a database or
 * Supabase client. Reuses the existing `generatePublishSlug` — no second slug
 * generator is introduced here.
 */

/** Maximum length of a public slug (matches the existing publish generator). */
export const SLUG_MAX_LENGTH = 60;

/** Public route prefix for the STEP 7 public profile page. */
export const PUBLIC_ROUTE_PREFIX = '/portfolio';

/**
 * The minimal slice of a portfolio the slug decision needs. Kept as a lone
 * structural type hooked to the real record via `Pick<PortfolioRecord, ...>` at
 * the call site (that type is assignable to this), so the helpers stay easy to
 * test without pulling in the full output/schema graph.
 */
export interface SlugSource {
	id: string;
	title: string;
	slug: string | null;
	data: { seo?: { slug?: string; title?: string } | null };
}

/** True when a slug is a safe, already-normalized URL path segment. */
export function isValidSlug(slug: string): boolean {
	return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= SLUG_MAX_LENGTH;
}

/** The deterministic suffixed slug used to de-duplicate a collision. */
export function suffixSlug(baseSlug: string, counter: number): string {
	return `${baseSlug}-${counter}`;
}

/** The public URL for a resolved slug, e.g. `/portfolio/my-ai-ml-portfolio`. */
export function publicUrlForSlug(slug: string): string {
	return `${PUBLIC_ROUTE_PREFIX}/${slug}`;
}

/**
 * Resolves the slug a portfolio should be published under. Prefers the
 * portfolio's existing stable slug (what round-trips through Supabase), then the
 * SEO slug embedded in the output, then a deterministic slug derived from the
 * SEO title / record title. Falls back to a slug derived from the portfolio id
 * so an empty title can still yield a unique, deterministic value.
 */
export function resolvePublishSlug(record: SlugSource): string {
	const existing = record.slug?.trim();
	if (existing && isValidSlug(existing)) {
		return existing;
	}

	const seoSlug = record.data.seo?.slug?.trim();
	if (seoSlug && isValidSlug(seoSlug)) {
		return seoSlug;
	}

	const title = record.data.seo?.title?.trim() || record.title;
	const idSlug = generatePublishSlug(record.id, 'portfolio');
	return generatePublishSlug(title, idSlug);
}
