import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { v as $$Trophy, x as $$Component, y as $$Sparkles } from "./globals_hrWnACD0.mjs";
import { r as portfolioManagerStore, t as $$DashboardLayout } from "./DashboardLayout_CCYMs8pO.mjs";
import { n as $$AnalyticsActivitySection, t as $$AnalyticsCards } from "./AnalyticsCards_CjcJW_LK.mjs";
//#region node_modules/lucide-astro/dist/Info.astro
createAstro("https://astro.build");
var $$Info = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Info;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "info",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Info.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Lightbulb.astro
createAstro("https://astro.build");
var $$Lightbulb = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Lightbulb;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "lightbulb",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Lightbulb.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/TrendingUp.astro
createAstro("https://astro.build");
var $$TrendingUp = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$TrendingUp;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "trending-up",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/TrendingUp.astro", void 0);
//#endregion
//#region src/components/dashboard/AchievementsSummary.astro
var $$AchievementsSummary = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<!--
	Achievement SUMMARY for the Analytics dashboard (Day-11 Task 13).

	Deliberately NOT the full Achievement System — it shows unlocked/total for the
	selected portfolio plus a short "next up" list, and routes to the dedicated
	/achievements page for the complete view. Reads the shared Analytics
	portfolio selector (#analytics-portfolio-select) so it always reflects the
	same portfolio as the metrics and activity sections.
--><section id="achievements-summary-section" aria-labelledby="achievements-summary-heading" class="mt-xl" data-reveal><div class="mb-md flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><h2 id="achievements-summary-heading" class="text-heading-sm text-ink">Achievements</h2><p class="text-body-sm text-ink-muted">Progress and next milestones for the selected portfolio.</p></div><a href="/achievements" class="inline-flex shrink-0 items-center justify-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1">${renderComponent($$result, "Trophy", $$Trophy, {
		"size": "16",
		"aria-hidden": "true"
	})}View all achievements</a></div><p id="achievements-summary" class="text-body-sm text-ink-subtle" aria-live="polite"></p><p id="achievements-summary-status" role="status" class="sr-only"></p><div id="achievements-summary-empty" class="card mt-md flex w-full flex-col items-center gap-sm p-lg text-center" hidden><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "Trophy", $$Trophy, { "size": "24" })}</span><h3 class="text-heading-sm text-ink">Your first milestone is waiting</h3><p class="max-w-narrow text-body-sm text-ink-subtle">Keep building and sharing this portfolio to earn achievements from real activity. See the full breakdown on the Achievements page.</p></div><ul id="achievements-summary-list" class="card mt-md divide-y divide-hairline" aria-labelledby="achievements-summary-heading"></ul><div id="achievements-summary-error" role="alert" class="mt-md rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-semantic-danger" hidden></div></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AchievementsSummary.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AchievementsSummary.astro", void 0);
//#endregion
//#region src/components/dashboard/AnalyticsAbout.astro
var $$AnalyticsAbout = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<!--
	Additional analytics information (Day-11 Task 14).

	A progressively expandable <details> block that explains the data sources and
	limits of the Analytics dashboard honestly: where metrics come from, how
	privacy is handled, and what the indicators do and do not mean. No fabricated
	analytics, no external APIs.
--><section id="analytics-about" aria-labelledby="analytics-about-summary" class="mt-xl" data-reveal><details class="card p-md"><summary id="analytics-about-summary" class="flex cursor-pointer items-center gap-xs rounded-sm py-xs text-subhead text-ink">${renderComponent($$result, "Info", $$Info, {
		"size": "16",
		"aria-hidden": "true",
		"class": "shrink-0 text-primary"
	})}About this analytics data</summary><div class="mt-sm flex flex-col gap-sm text-body-sm text-ink-subtle"><p>All metrics, activity and insights on this page are computed locally from analytics events recorded while visitors interact with your portfolio. Data is isolated by portfolio and shown for the portfolio selected in the toolbar.</p><p>Completion and quality scores are PortForge indicators derived from the content of your portfolio. They are not an ATS score, hiring or employability rating, job guarantee, or acceptance probability.</p><p>No real analytics API or AI service is connected yet. Visitor identifiers are anonymous and are never linked to personal identity.</p></div></details></section>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsAbout.astro", void 0);
//#endregion
//#region src/components/dashboard/AnalyticsOverview.astro
var $$AnalyticsOverview = createComponent(($$result, $$props, $$slots) => {
	const hasPortfolios = portfolioManagerStore.getPortfolios().length > 0;
	const sectionLinkClass = "rounded-md px-sm py-sm text-body-sm text-ink-subtle transition-colors duration-200 hover:bg-surface-2 hover:text-ink";
	return renderTemplate`${maybeRenderHead($$result)}<section id="analytics-overview" aria-labelledby="analytics-page-heading" class="mt-xl"><div class="flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><h1 id="analytics-page-heading" tabindex="-1" class="text-heading-md text-ink">Analytics</h1><p class="text-body-sm text-ink-muted">Portfolio performance, activity and achievement progress for a single portfolio, isolated by portfolio.</p></div><p id="analytics-overview-context" class="min-w-0 text-body-sm text-ink-subtle" aria-live="polite"></p></div><nav id="analytics-section-nav" aria-label="On this page" class="mt-md"${addAttribute(!hasPortfolios, "hidden")}><ul class="flex flex-wrap items-center gap-xs"><li><a href="#analytics-metrics"${addAttribute(sectionLinkClass, "class")}>Portfolio metrics</a></li><li><a href="#creator-insights"${addAttribute(sectionLinkClass, "class")}>Creator insights</a></li><li><a href="#analytics-activity"${addAttribute(sectionLinkClass, "class")}>Activity</a></li><li><a href="#achievements-summary-section"${addAttribute(sectionLinkClass, "class")}>Achievements</a></li></ul></nav></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsOverview.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsOverview.astro", void 0);
//#endregion
//#region src/lib/analytics/analytics-types.ts
/** The complete set of known analytics event types. */
var ANALYTICS_EVENT_TYPES = [
	"portfolio_view",
	"github_click",
	"linkedin_click",
	"project_click",
	"contact_click",
	"resume_click",
	"export_click"
];
/**
* The subset of event types that represent visitor click interactions. Used to
* distinguish meaningful clicks from page views and unique visitors so the
* metrics never mix. Derived from `ANALYTICS_EVENT_TYPES` — no new events.
*/
var ANALYTICS_CLICK_TYPES = [
	"github_click",
	"linkedin_click",
	"project_click",
	"contact_click",
	"resume_click",
	"export_click"
];
/** True when a value is a known analytics event type. */
function isAnalyticsEventType(value) {
	return ANALYTICS_EVENT_TYPES.includes(value);
}
/** True when a value is a supported click interaction type. */
function isAnalyticsClickType(value) {
	return ANALYTICS_CLICK_TYPES.includes(value);
}
//#endregion
//#region src/lib/analytics/analytics-utils.ts
/**
* Pure, dependency-free utilities for the Day-11 Analytics system. They mirror
* the project's existing conventions (crypto UUID with fallback, ISO-8601
* timestamps, guarded storage access) without coupling analytics to any other
* domain module.
*/
/** Generates a unique analytics event id. Never derived from event content. */
function generateAnalyticsEventId() {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi && typeof cryptoApi.randomUUID === "function") return cryptoApi.randomUUID();
	return `ev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
/** Consistent ISO-8601 timestamp used for every analytics field. */
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
/** True when the value is an analytics-safe primitive. */
function isAnalyticsPrimitive(value) {
	return value === null || value === void 0 || typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
/**
* Validates an unknown value into a usable `AnalyticsEventMetadata` object.
* Returns null for non-objects, arrays, or any non-primitive entry so malformed
* persisted data is safely rejected instead of crashing the store.
*/
function toAnalyticsEventMetadata(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
	const metadata = {};
	for (const [key, entry] of Object.entries(value)) {
		if (!isAnalyticsPrimitive(entry)) return null;
		metadata[key] = entry;
	}
	return metadata;
}
/** True when browser storage is available and analytics may use it. */
function canUseStorage() {
	return typeof localStorage !== "undefined";
}
//#endregion
//#region src/lib/analytics/analytics-visitor.ts
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
var VISITOR_STORAGE_KEY = "portforge:analytics:visitor:v1";
/** Metadata field name used to attach the anonymous visitor id to analytics events. */
var VISITOR_METADATA_KEY = "visitorId";
/** Prefix so visitor tokens are never mistaken for event or portfolio ids. */
var VISITOR_ID_PREFIX = "vis-";
/** Generates a fresh anonymous visitor token. Pure random — no personal data. */
function generateVisitorId() {
	const cryptoApi = globalThis.crypto;
	if (cryptoApi && typeof cryptoApi.randomUUID === "function") return `${VISITOR_ID_PREFIX}${cryptoApi.randomUUID()}`;
	return `${VISITOR_ID_PREFIX}${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
/**
* Module-level cache so repeated calls inside a session never re-derive or
* re-persist the token. This is what makes refresh/re-render safe: a browser
* reload restores the same id from storage, and any number of component
* re-renders simply read the cached value.
*/
var cachedVisitorId = null;
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
function getVisitorId() {
	if (cachedVisitorId !== null) return cachedVisitorId;
	if (canUseStorage()) {
		const persisted = localStorage.getItem(VISITOR_STORAGE_KEY);
		if (persisted) {
			cachedVisitorId = persisted;
			return cachedVisitorId;
		}
		const created = generateVisitorId();
		try {
			localStorage.setItem(VISITOR_STORAGE_KEY, created);
		} catch {}
		cachedVisitorId = created;
		return cachedVisitorId;
	}
	cachedVisitorId = generateVisitorId();
	return cachedVisitorId;
}
/** True when a value is a usable anonymous visitor token. */
function isVisitorId(value) {
	return typeof value === "string" && value.length > 0;
}
//#endregion
//#region src/lib/analytics/analytics-queries.ts
/**
* Pure analytics queries. These operate on immutable event arrays and never
* touch the store or any other application state. Task 1 provides the
* structural queries (per-portfolio, time-window, event-type counts); the
* derived metrics (views, clicks, completion/quality scores) are computed by
* later Day-11 tasks on top of these. Unique visitor counting lives here too
* and reuses the prevailing `portfolio_view` event flow.
*/
/** Events belonging to a single stable portfolio id. */
function getEventsForPortfolio(events, portfolioId) {
	return events.filter((event) => event.portfolioId === portfolioId);
}
/**
* Total views recorded for a single stable portfolio id. Counts only
* `portfolio_view` events and never crosses portfolio boundaries, so
* multi-portfolio totals never combine incorrectly.
*/
function getPortfolioViews(events, portfolioId) {
	return getEventsForPortfolio(events, portfolioId).filter((event) => event.eventType === "portfolio_view").length;
}
/**
* Unique visitors for a single stable portfolio id. Each distinct anonymous
* visitor token on a `portfolio_view` event counts once, regardless of how
* many times that visitor viewed the portfolio.
*
* Portfolio isolation is strict: events are narrowed to the requested
* portfolio before deduplication, so the same visitor counting against two
* different portfolios is counted once in each — never shared across them.
*
* A single pass with a `Set` keeps the calculation lightweight and avoids
* scanning unrelated portfolios. An optional time window (inclusive ISO-8601
* bounds) is applied inline so callers never need a second pass.
*/
function getPortfolioUniqueVisitors(events, portfolioId, window) {
	const seen = /* @__PURE__ */ new Set();
	for (const event of getEventsForPortfolio(events, portfolioId)) {
		if (event.eventType !== "portfolio_view") continue;
		if (window !== void 0) {
			if (window.start !== void 0 && event.timestamp < window.start) continue;
			if (window.end !== void 0 && event.timestamp > window.end) continue;
		}
		const visitorId = event.metadata?.[VISITOR_METADATA_KEY];
		if (isVisitorId(visitorId)) seen.add(visitorId);
	}
	return seen.size;
}
/**
* Total meaningful click interactions recorded for a single portfolio id.
* Counts only the click event types (GitHub, LinkedIn, project, contact,
* resume, export). Page views and unique-visitor counts are deliberately never
* included, so this metric stays independent of the other two.
*/
function getPortfolioClicks(events, portfolioId) {
	return getEventsForPortfolio(events, portfolioId).filter((event) => isAnalyticsClickType(event.eventType)).length;
}
/**
* Clicks of a single event type for a portfolio id. Any non-click event type
* returns 0 rather than mixing view/visitor metrics into click analytics.
*/
function getClicksByType(events, portfolioId, eventType) {
	if (!isAnalyticsClickType(eventType)) return 0;
	return getEventsForPortfolio(events, portfolioId).filter((event) => event.eventType === eventType).length;
}
/**
* Clicks on a single project's links for a portfolio id. Uses the stable
* project identity carried in event metadata (`PROJECT_METADATA_KEY`), which
* distills to `project.id ?? project.name` at render time. Distinct projects
* never combine, and multi-portfolio isolation is preserved by construction.
*/
function getProjectClicks(events, portfolioId, projectToken) {
	return getEventsForPortfolio(events, portfolioId).filter((event) => event.eventType === "project_click" && event.metadata?.["project"] === projectToken).length;
}
//#endregion
//#region src/lib/analytics/analytics-store.ts
/** Default storage key, consistent with the project's `portforge:*:v1` convention. */
var STORAGE_KEY = "portforge:analytics:v1";
/** Validates an unknown persisted entry into a usable analytics event. */
function normalizePersistedEvent(value) {
	if (typeof value !== "object" || value === null) return null;
	const entry = value;
	if (typeof entry.id !== "string" || typeof entry.portfolioId !== "string" || typeof entry.timestamp !== "string" || !isAnalyticsEventType(entry.eventType)) return null;
	const metadata = toAnalyticsEventMetadata(entry.metadata);
	return {
		id: entry.id,
		portfolioId: entry.portfolioId,
		eventType: entry.eventType,
		timestamp: entry.timestamp,
		metadata
	};
}
/**
* The single source of truth for analytics events. Records and reads analytics
* information only — it never touches portfolio content, lifecycle metadata, or
* any other application store. Events are keyed by the existing stable
* portfolio id, so multiple portfolios are isolated by construction.
*
* Follows the project's established store conventions: a class singleton with
* `subscribe`/`notify`, guarded `localStorage` persistence, and safe
* construction in any environment (empty at build/SSR time, restored in a
* browser).
*/
var AnalyticsStore = class {
	persistKey;
	events = [];
	listeners = /* @__PURE__ */ new Set();
	constructor(options = {}) {
		this.persistKey = options.persistKey ?? STORAGE_KEY;
		this.restore();
	}
	/** All recorded events, oldest to newest. Read-only view. */
	getEvents() {
		return this.events;
	}
	/** Events for a single stable portfolio id only. Empty when none exist. */
	getPortfolioEvents(portfolioId) {
		return this.events.filter((event) => event.portfolioId === portfolioId);
	}
	/** Total `portfolio_view` events recorded for a single portfolio id. */
	getPortfolioViews(portfolioId) {
		return getPortfolioViews(this.events, portfolioId);
	}
	/**
	* Number of distinct anonymous visitors for a single portfolio id. Reuses
	* the `portfolio_view` event flow and stays isolated per portfolio.
	*/
	getUniqueVisitors(portfolioId) {
		return getPortfolioUniqueVisitors(this.events, portfolioId);
	}
	/**
	* Records a `portfolio_view` stamped with the visitor's anonymous id.
	* Extends the existing portfolio-view flow in place — the recording path
	* is unchanged, the visitor token rides along in event metadata.
	*/
	recordPortfolioView(portfolioId) {
		return this.recordEvent({
			portfolioId,
			eventType: "portfolio_view",
			metadata: { [VISITOR_METADATA_KEY]: getVisitorId() }
		});
	}
	/**
	* Records a click interaction for a single stable portfolio id, stamped
	* with the anonymous visitor id. Only click event types are accepted —
	* anything else throws as a programmer-error guard so views/visitors are
	* never mis-recorded as clicks.
	*/
	recordPortfolioClick(portfolioId, eventType, metadata) {
		if (!isAnalyticsClickType(eventType)) throw new Error(`Not a click event type: ${eventType}`);
		return this.recordEvent({
			portfolioId,
			eventType,
			metadata: {
				[VISITOR_METADATA_KEY]: getVisitorId(),
				...metadata
			}
		});
	}
	/** Total meaningful click interactions recorded for a portfolio id. */
	getPortfolioClicks(portfolioId) {
		return getPortfolioClicks(this.events, portfolioId);
	}
	/** Clicks of a single (click) event type for a portfolio id. */
	getClicksByType(portfolioId, eventType) {
		return getClicksByType(this.events, portfolioId, eventType);
	}
	/** Clicks on a single project's links for a portfolio id. */
	getProjectClicks(portfolioId, projectToken) {
		return getProjectClicks(this.events, portfolioId, projectToken);
	}
	/**
	* Records a single analytics event and returns it. The portfolio id must be
	* non-empty so analytics never attach to an unnamed target; this is a
	* programmer-error guard, not user-facing validation.
	*/
	recordEvent(input) {
		const portfolioId = input.portfolioId.trim();
		if (!portfolioId) throw new Error("Analytics requires a non-empty portfolioId.");
		const event = {
			id: generateAnalyticsEventId(),
			portfolioId,
			eventType: input.eventType,
			timestamp: input.timestamp ?? nowIso(),
			metadata: input.metadata ?? null
		};
		this.events.push(event);
		this.notify();
		return event;
	}
	/**
	* Removes recorded events. With a `portfolioId`, only that portfolio's
	* events are removed; without one, all events are removed. Returns the
	* number of events removed.
	*/
	clearEvents(portfolioId) {
		const next = portfolioId ? this.events.filter((event) => event.portfolioId !== portfolioId) : [];
		const removed = this.events.length - next.length;
		if (removed > 0) {
			this.events = next;
			this.notify();
		}
		return removed;
	}
	/** Resets analytics to the initial empty state. No-op when already empty. */
	reset() {
		if (this.events.length === 0) return;
		this.events = [];
		this.notify();
	}
	/** Registers a listener notified after any change. Returns an unsubscribe function. */
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	/** Re-reads the persisted event log (no-op when storage is unavailable). */
	restore() {
		if (!canUseStorage()) return false;
		const raw = localStorage.getItem(this.persistKey);
		if (!raw) return false;
		try {
			const parsed = JSON.parse(raw);
			if (!Array.isArray(parsed.events)) return false;
			const restored = parsed.events.map(normalizePersistedEvent).filter((event) => event !== null);
			if (restored.length === 0) return false;
			this.events = restored;
			return true;
		} catch {
			return false;
		}
	}
	/**
	* Persists the event log (no-op when storage is unavailable). Guarded so a
	* storage failure is contained — it never throws out of record/clear and
	* never leaves a partial log persisted.
	*/
	save() {
		if (!canUseStorage()) return false;
		try {
			const payload = { events: this.events };
			localStorage.setItem(this.persistKey, JSON.stringify(payload));
			return true;
		} catch {
			return false;
		}
	}
	notify() {
		this.save();
		for (const listener of this.listeners) listener(this.events);
	}
};
new AnalyticsStore();
//#endregion
//#region src/lib/analytics/analytics-time.ts
/** All supported time ranges, in display order. */
var ANALYTICS_TIME_RANGES = [
	"today",
	"last_7_days",
	"last_30_days",
	"all_time"
];
/** Human-readable labels for the time-range control. */
var ANALYTICS_TIME_RANGE_LABELS = {
	today: "Today",
	last_7_days: "7 Days",
	last_30_days: "30 Days",
	all_time: "All Time"
};
//#endregion
//#region src/components/dashboard/AnalyticsToolbar.astro
var $$AnalyticsToolbar = createComponent(($$result, $$props, $$slots) => {
	const fieldClass = "w-full rounded-md border border-hairline bg-surface-2 px-md py-sm text-body-sm text-ink transition-colors duration-200 placeholder:text-ink-tertiary focus:border-primary-focus";
	const rangeButtonClass = "inline-flex items-center justify-center rounded-md border px-md py-sm text-button font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1";
	return renderTemplate`${maybeRenderHead($$result)}<section id="analytics-toolbar" aria-label="Analytics filters" class="mt-xl"><div class="flex w-full min-w-0 flex-wrap items-end gap-md"><div class="flex min-w-0 flex-1 flex-col gap-xs sm:flex-none sm:w-64"><label for="analytics-portfolio-select" class="text-caption font-medium text-ink-subtle">Portfolio</label><select id="analytics-portfolio-select" name="analytics-portfolio"${addAttribute(fieldClass, "class")}></select></div><div class="flex min-w-0 flex-col gap-xs"><span id="analytics-range-label" class="text-caption font-medium text-ink-subtle">Period</span><div id="analytics-range-group" role="group" aria-labelledby="analytics-range-label" class="flex flex-wrap gap-xs">${ANALYTICS_TIME_RANGES.map((range) => renderTemplate`<button type="button"${addAttribute(range, "data-analytics-range")}${addAttribute(range === "all_time" ? "true" : "false", "aria-pressed")}${addAttribute([rangeButtonClass, range === "all_time" ? "border-primary bg-primary text-on-primary" : "border-hairline bg-surface-2 text-ink hover:bg-surface-3"], "class:list")}>${ANALYTICS_TIME_RANGE_LABELS[range]}</button>`)}</div></div></div></section>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsToolbar.astro", void 0);
//#endregion
//#region src/components/dashboard/CreatorInsightsSection.astro
var $$CreatorInsightsSection = createComponent(($$result, $$props, $$slots) => {
	const hasPortfolios = portfolioManagerStore.getPortfolios().length > 0;
	return renderTemplate`${maybeRenderHead($$result)}<!--
	Creator Insights section (Day-11 Task 14).

	Presents REAL, existing analytics output only: the deterministic quality
	evaluator already used for the AI Quality metric. Each insight is a measured
	quality signal (label + value) grouped under its dimension score, plus the
	genuine strengths and improvements the evaluator derives from the selected
	portfolio's content. No fabricated signals, no invented numbers, no external
	API. Reads the SHARED #analytics-portfolio-select like every other section.
--><section id="creator-insights" aria-labelledby="creator-insights-heading" class="mt-xl" data-reveal${addAttribute(!hasPortfolios, "hidden")}><div class="mb-md flex flex-col gap-xxs"><h2 id="creator-insights-heading" class="text-heading-sm text-ink">Creator Insights</h2><p class="text-body-sm text-ink-muted">Measured content signals and dimension scores for the selected portfolio.</p></div><p id="creator-insights-status" role="status" class="sr-only"></p><div id="creator-insights-empty" class="card mt-md flex w-full flex-col items-center gap-sm p-lg text-center" hidden><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "Lightbulb", $$Lightbulb, { "size": "24" })}</span><h3 class="text-heading-sm text-ink">No insights yet</h3><p id="creator-insights-empty-body" class="max-w-narrow text-body-sm text-ink-subtle">Add meaningful content to this portfolio to surface quality signals and suggestions.</p></div><div id="creator-insights-summary" class="card mt-md p-md" hidden><p id="creator-insights-summary-text" class="text-body-sm text-ink-subtle"></p></div><ul id="creator-insights-list" class="mt-md grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="creator-insights-heading" aria-busy="true"></ul><div id="creator-insights-findings" class="mt-md grid grid-cols-1 gap-md lg:grid-cols-2" hidden><div class="card p-md"><h3 class="flex items-center gap-xs text-subhead text-ink">${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true",
		"class": "shrink-0 text-primary"
	})}Strengths</h3><ul id="creator-insights-strengths" class="mt-sm flex flex-col gap-xs"></ul></div><div class="card p-md"><h3 class="flex items-center gap-xs text-subhead text-ink">${renderComponent($$result, "TrendingUp", $$TrendingUp, {
		"size": "16",
		"aria-hidden": "true",
		"class": "shrink-0 text-primary"
	})}Worth improving</h3><ul id="creator-insights-improvements" class="mt-sm flex flex-col gap-xs"></ul></div></div><div id="creator-insights-error" role="alert" class="mt-md rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-semantic-danger" hidden></div></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/CreatorInsightsSection.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/CreatorInsightsSection.astro", void 0);
//#endregion
//#region src/pages/analytics.astro
var analytics_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Analytics,
	file: () => $$file,
	url: () => $$url
});
var $$Analytics = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {
		"title": "Analytics â€” PortForge AI",
		"description": "Inspect views, unique visitors, clicks, completion, quality, activity and achievements for each portfolio, isolated by portfolio.",
		"pageLabel": "Analytics"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "AnalyticsOverview", $$AnalyticsOverview, {})}${renderComponent($$result, "AnalyticsToolbar", $$AnalyticsToolbar, {})}${renderComponent($$result, "AnalyticsCards", $$AnalyticsCards, {})}${renderComponent($$result, "CreatorInsightsSection", $$CreatorInsightsSection, {})}${renderComponent($$result, "AnalyticsActivitySection", $$AnalyticsActivitySection, {})}${renderComponent($$result, "AchievementsSummary", $$AchievementsSummary, {})}${renderComponent($$result, "AnalyticsAbout", $$AnalyticsAbout, {})}` })}${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/pages/analytics.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/analytics.astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/analytics.astro";
var $$url = "/analytics";
//#endregion
//#region \0virtual:astro:page:src/pages/analytics@_@astro
var page = () => analytics_exports;
//#endregion
export { page };
