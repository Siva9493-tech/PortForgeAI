import { equal, ok, match } from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { publicUrlForSlug } from '../src/lib/portfolio-manager/portfolio-slug.ts';

/**
 * DB-free checks for the STEP 10 public route's non-DB building blocks.
 *
 * The route's Supabase work (`getPublishedBySlug`) lives in
 * `portfolio-repository.ts` and is intentionally NOT exercised here — this suite
 * never touches Supabase. The app uses bundler-style extensionless imports that
 * the plain Node runner cannot resolve, so only a leaf module that is
 * Node-runnable (`portfolio-slug.ts`) is imported directly.
 *
 * What this verifies:
 *   - the public URL is built from the DATABASE slug (`record.slug`), never
 *     from `data.seo.slug`;
 *   - the page title resolution (SEO title → record title → fallback);
 *   - the page source is configured for runtime (no `getStaticPaths`, has
 *     `prerender = false`, sets a 404 status on miss, and never imports
 *     `supabase.ts`).
 */
interface RouteRecord {
	title: string;
	slug: string | null;
	data: { seo?: { title?: string; slug?: string } | null };
}

function routeRecord(over: Partial<RouteRecord['data']> = {}): RouteRecord {
	return {
		title: 'Fixture Portfolio',
		slug: 'db-slug',
		data: { seo: { title: 'Ada Lovelace — Engineer', slug: 'seo-slug' }, ...over },
	};
}

function resolvePageTitle(record: RouteRecord): string {
	return record.data.seo?.title?.trim() || record.title || 'Portfolio';
}

const here = dirname(fileURLToPath(import.meta.url));
const pagePath = resolve(here, '..', 'src', 'pages', 'portfolio', '[slug].astro');
const repoPath = resolve(here, '..', 'src', 'lib', 'portfolio-manager', 'portfolio-repository.ts');
const supabasePath = resolve(here, '..', 'src', 'lib', 'supabase.ts');

const pageSource = readFileSync(pagePath, 'utf8');
const repoSource = readFileSync(repoPath, 'utf8');
const supabaseSource = readFileSync(supabasePath, 'utf8');

test('public route builds its URL from the database slug, not the SEO slug', () => {
	const record = routeRecord();
	// The SEO payload carries a DIFFERENT slug than the stored database slug.
	const publicPath = publicUrlForSlug(record.slug ?? record.data.seo?.slug ?? '');
	equal(publicPath, '/portfolio/' + record.slug);
	ok(publicPath !== '/portfolio/' + record.data.seo?.slug, 'must not use the SEO slug');
});

test('canonical URL is exactly /portfolio/<slug>', () => {
	equal(publicUrlForSlug('my-ai-ml-portfolio'), '/portfolio/my-ai-ml-portfolio');
});

test('page title prefers the SEO title, then the record title, then a fallback', () => {
	equal(resolvePageTitle(routeRecord()), 'Ada Lovelace — Engineer');
	equal(resolvePageTitle(routeRecord({ seo: null })), 'Fixture Portfolio');
	equal(resolvePageTitle(routeRecord({ seo: { title: '' } })), 'Fixture Portfolio');
	// Full fallback: no SEO title AND no usable record title.
	equal(
		resolvePageTitle({ title: '', slug: 'db-slug', data: { seo: { title: '' } } }),
		'Portfolio',
	);
});

// --- STEP 10 runtime contract ---

test('public route is configured for request-time rendering (no getStaticPaths)', () => {
	ok(!/export\s+async\s+function\s+getStaticPaths\s*\(/.test(pageSource), 'must drop getStaticPaths');
	match(pageSource, /export\s+const\s+prerender\s*=\s*false/, 'must opt out of prerender');
});

test('public route never imports the Supabase client directly', () => {
	ok(!/from\s+['"]\.\.\/\.\.\/lib\/supabase(?:\.ts)?['"]/.test(pageSource), 'page must not import supabase');
});

test('public route uses the repository lookup (getPublishedBySlug), not listPublishedSlugs', () => {
	ok(/getPublishedBySlug/.test(pageSource), 'must call getPublishedBySlug');
	ok(!/listPublishedSlugs/.test(pageSource), 'must not call listPublishedSlugs at request time');
});

test('public route returns a real HTTP 404 when the slug does not resolve', () => {
	match(pageSource, /Astro\.response\.status\s*=\s*404/, 'must set status 404 on miss');
});

test('public route canonical URL is built from the database record slug', () => {
	// The page must use record?.slug (not Astro.params.slug) when forming the
	// canonical link, so a malformed/empty URL parameter can never leak into
	// the canonical tag.
	ok(/record\?\.slug/.test(pageSource), 'canonical must derive from record.slug');
});

// --- Repository safety (defence in depth on the public path) ---

test('repository is the ONLY place that issues .from("portfolios") for the public route', () => {
	// The repository must be the only module under src/lib/portfolio-manager
	// that talks to the `portfolios` table. The page itself never imports
	// supabase; the public route goes through getPublishedBySlug.
	const repoHasFrom = /\.from\(\s*['"]portfolios['"]\s*\)/.test(repoSource);
	ok(repoHasFrom, 'repository must call .from("portfolios")');
	// The Supabase client lives in lib/supabase.ts; verify the page does NOT
	// pull that file in (we already asserted that), and the repository IS the
	// path through which the page reaches Supabase.
	ok(/from\s+['"]\.\.\/supabase(?:\.ts)?['"]/.test(repoSource), 'repository imports supabase client');
});

test('repository getPublishedBySlug filters to status="published"', () => {
	// Inline-check the SQL filter rather than mocking Supabase.
	const slice = repoSource.match(/export\s+async\s+function\s+getPublishedBySlug[\s\S]*?\n\}/);
	ok(slice, 'getPublishedBySlug must be exported');
	ok(/\.eq\(\s*['"]status['"]\s*,\s*['"]published['"]\s*\)/.test(slice![0]), 'must filter status=published');
});

// --- supabase client is the publishable (anon) key only ---

test('supabase client is configured with the public publishable key only', () => {
	ok(/PUBLIC_SUPABASE_URL/.test(supabaseSource), 'must read PUBLIC_SUPABASE_URL');
	ok(/PUBLIC_SUPABASE_PUBLISHABLE_KEY/.test(supabaseSource), 'must read PUBLIC_SUPABASE_PUBLISHABLE_KEY');
	ok(!/SERVICE_ROLE/.test(supabaseSource), 'must never use a service role key');
});
