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

/** Extracts the portfolio owner's name/full name from a title string. */
export function extractOwnerName(title: string): string {
	const trimmed = title.trim();
	if (!trimmed) return '';
	const [namePart] = trimmed.split(/\s*—\s*|\s*-\s*|\s*\|\s*/);
	return namePart?.trim() || trimmed;
}


/** Checks whether a slug was derived from a given name (exact match or suffixed collision -2, -3). */
export function isSlugDerivedFromName(slug: string, name: string): boolean {
	if (!isValidSlug(slug)) return false;
	const ownerName = extractOwnerName(name);
	const baseSlug = generatePublishSlug(ownerName, 'portfolio');
	if (slug === baseSlug) return true;
	const escaped = baseSlug.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
	return new RegExp(`^${escaped}-\\d+$`).test(slug);
}

/**
 * Resolves the slug a portfolio should be published under.
 * Requirements:
 * - Unchanged name: retain existing stable slug.
 * - Changed name: derive new slug from the current owner name.
 * - Duplicate: derive slug from duplicate's current name.
 * - Fall back to an id-derived slug when name is empty.
 */
export function resolvePublishSlug(record: SlugSource): string {
	const rawTitle = record.data.seo?.title?.trim() || record.title;
	const ownerName = extractOwnerName(rawTitle);
	const fallbackSlug = generatePublishSlug(record.id, 'portfolio');
	const baseSlug = generatePublishSlug(ownerName, fallbackSlug);

	const existing = record.slug?.trim();
	if (existing && isValidSlug(existing)) {
		if (isSlugDerivedFromName(existing, ownerName)) {
			return existing;
		}
		// Name changed -> derive from new name
		return baseSlug;
	}

	const seoSlug = record.data.seo?.slug?.trim();
	if (seoSlug && isValidSlug(seoSlug)) {
		if (isSlugDerivedFromName(seoSlug, ownerName)) {
			return seoSlug;
		}
	}

	return baseSlug;
}

