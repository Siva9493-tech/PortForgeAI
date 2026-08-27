import { createClient } from "@supabase/supabase-js";
//#region src/lib/portfolio-manager/portfolio-manager-utils.ts
/** Generates a stable, unique portfolio id. Never derived from the title. */
function generatePortfolioId() {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
	return `pf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
/** Consistent ISO-8601 timestamp used for every date field. */
function isoNow() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
/** True when a value is a supported portfolio status. */
function isPortfolioStatus(value) {
	return value === "draft" || value === "published";
}
/**
* Copy label used for duplicated portfolios. Reuses the existing `(Copy)`
* convention and avoids creating multiple identical titles by appending a
* numeric suffix when the base copy label already exists in the collection.
*/
function duplicateTitle(title, existingTitles = []) {
	const base = `${title} (Copy)`;
	if (!existingTitles.includes(base)) return base;
	let index = 2;
	while (existingTitles.includes(`${title} (Copy ${index})`)) index += 1;
	return `${title} (Copy ${index})`;
}
/**
* Defensive deep clone for portfolio data. Portfolio data is plain
* JSON-serializable content (strings, numbers, booleans, arrays, null), so a
* JSON round-trip is safe and avoids sharing mutable references with callers.
*/
function clonePortfolioData(value) {
	return JSON.parse(JSON.stringify(value));
}
/** Comparable content of an output, ignoring generated metadata timestamps. */
function portfolioContent(value) {
	const { metadata, ...content } = value;
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
function portfolioOutputEquals(a, b) {
	return portfolioContent(a) === portfolioContent(b);
}
var supabase = createClient("https://ytomqchccsaoinandlsk.supabase.co", "sb_publishable_sHqVFZTi7pixJCmffLxrjg_nJU2DhEk");
//#endregion
//#region src/lib/portfolio-manager/portfolio-repository.ts
/**
* Columns read/written for every operation. `user_id` is filtered on rather
* than returned to the domain, but is selected so the row type stays honest for
* inserts (which set it explicitly).
*/
var COLUMNS = "id, user_id, title, slug, status, data, created_at, updated_at, published_at";
/**
* The public slug to persist with a portfolio. A portfolio only gets a slug
* when its SEO output defines one; drafts without one keep `NULL` so the unique
* slug column is never accidentally collisioned by templated titles.
*/
function resolveInitialSlug(data) {
	return data.seo?.slug ?? null;
}
/**
* Maps a snake_case `public.portfolios` row into the domain `PortfolioRecord`.
* `data` is deep-cloned so the record owns its content; `currentVersion` is `1`
* and `versions` holds that single snapshot (the V1 representation of a row that
* carries no version history).
*/
function mapRowToRecord(row) {
	const data = clonePortfolioData(row.data);
	const status = isPortfolioStatus(row.status) ? row.status : "draft";
	const snapshot = {
		version: 1,
		title: row.title,
		data,
		createdAt: row.created_at
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
		data
	};
}
/** Lists every portfolio owned by a user, oldest to newest. */
async function listForUser(userId) {
	const { data, error } = await supabase.from("portfolios").select(COLUMNS).eq("user_id", userId);
	if (error) throw error;
	return (data ?? []).map(mapRowToRecord);
}
/**
* Inserts a portfolio, preserving the caller-supplied id and timestamps. The
* whole `PortfolioRecord` is surfaced back (mapped from the inserted row), so
* V1 callers see a single-snapshot record consistent with what is stored.
*/
async function create(record, userId) {
	const row = {
		id: record.id,
		user_id: userId,
		title: record.title,
		slug: resolveInitialSlug(record.data),
		status: record.status,
		data: record.data,
		created_at: record.createdAt,
		updated_at: record.updatedAt,
		published_at: record.publishedAt
	};
	const { data, error } = await supabase.from("portfolios").insert(row).select(COLUMNS).single();
	if (error) throw error;
	return mapRowToRecord(data);
}
/**
* Updates only the fields supplied by the patch, bumping `updated_at`. Returns
* the updated record, or null when no portfolio with that id exists.
*/
async function update(id, patch) {
	const row = {};
	if (patch.title !== void 0) row.title = patch.title;
	if (patch.slug !== void 0) row.slug = patch.slug;
	if (patch.status !== void 0) row.status = patch.status;
	if (patch.data !== void 0) row.data = patch.data;
	if (patch.publishedAt !== void 0) row.published_at = patch.publishedAt;
	row.updated_at = isoNow();
	const { data, error } = await supabase.from("portfolios").update(row).eq("id", id).select(COLUMNS).maybeSingle();
	if (error) throw error;
	return data ? mapRowToRecord(data) : null;
}
/**
* Deletes a portfolio by id. Returns true when a row was actually removed and
* false when the id did not exist (idempotent). Throws on a real query/RLS
* failure.
*/
async function remove(id) {
	const { data, error } = await supabase.from("portfolios").delete().eq("id", id).select("id");
	if (error) throw error;
	return (data?.length ?? 0) > 0;
}
/** Returns the portfolio published under a given slug, or null when none. */
async function getPublishedBySlug(slug) {
	const { data, error } = await supabase.from("portfolios").select(COLUMNS).eq("slug", slug).eq("status", "published").maybeSingle();
	if (error) throw error;
	return data ? mapRowToRecord(data) : null;
}
//#endregion
export { update as a, duplicateTitle as c, isoNow as d, portfolioOutputEquals as f, remove as i, generatePortfolioId as l, getPublishedBySlug as n, supabase as o, listForUser as r, clonePortfolioData as s, create as t, isPortfolioStatus as u };
