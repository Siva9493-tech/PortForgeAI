import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { x as $$Component, y as $$Sparkles } from "./globals_hrWnACD0.mjs";
import { o as $$BarChart3, r as portfolioManagerStore } from "./DashboardLayout_CCYMs8pO.mjs";
import { t as $$Eye } from "./Eye_DJGXYIPh.mjs";
import { t as $$History } from "./History_C0HbuPmp.mjs";
import { t as $$Plus } from "./Plus_DPZfhrYc.mjs";
//#region node_modules/lucide-astro/dist/CircleCheckBig.astro
createAstro("https://astro.build");
var $$CircleCheckBig = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$CircleCheckBig;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "circle-check-big",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/CircleCheckBig.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/MousePointerClick.astro
createAstro("https://astro.build");
var $$MousePointerClick = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$MousePointerClick;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "mouse-pointer-click",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M14 4.1 12 6"></path><path d="m5.1 8-2.9-.8"></path><path d="m6 12-1.9 2"></path><path d="M7.2 2.2 8 5.1"></path><path d="M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/MousePointerClick.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Users.astro
createAstro("https://astro.build");
var $$Users = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Users;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "users",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Users.astro", void 0);
//#endregion
//#region src/components/dashboard/AnalyticsActivitySection.astro
var $$AnalyticsActivitySection = createComponent(($$result, $$props, $$slots) => {
	const hasPortfolios = portfolioManagerStore.getPortfolios().length > 0;
	return renderTemplate`${maybeRenderHead($$result)}<!--
	Analytics Activity section for the Analytics dashboard (Day-11 Task 13).

	Recent analytics events for the portfolio selected in the shared
	#analytics-portfolio-select control, honoring the same period group. It is a
	separate section so the page hierarchy reads metrics → Creator Insights →
	Activity → Achievements. Reads the EXISTING analytics event layer only; it
	never records, invents, or synthesizes events.
--><section id="analytics-activity" class="mt-xl" aria-labelledby="analytics-activity-heading" data-reveal${addAttribute(!hasPortfolios, "hidden")}><div class="mb-sm flex flex-col gap-xxs"><h2 id="analytics-activity-heading" class="text-subhead text-ink">Activity</h2><p class="text-body-sm text-ink-muted">Recent interactions from visitors who opened this portfolio.</p></div><div id="analytics-activity-empty" class="card mt-sm flex flex-col items-center gap-sm p-lg text-center" hidden><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "History", $$History, { "size": "24" })}</span><h3 id="analytics-activity-empty-title" class="text-heading-sm text-ink">No activity yet</h3><p id="analytics-activity-empty-body" class="max-w-narrow text-body-sm text-ink-subtle">Activity will appear here when visitors interact with your portfolio.</p></div><ol id="analytics-activity-list" class="card mt-sm divide-y divide-hairline" aria-labelledby="analytics-activity-heading"></ol><div id="analytics-activity-more-wrap" class="mt-sm flex justify-center" hidden><button type="button" id="analytics-activity-more" class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2">Show more activity</button></div></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsActivitySection.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsActivitySection.astro", void 0);
//#endregion
//#region src/components/dashboard/SummaryCard.astro
createAstro("https://astro.build");
var $$SummaryCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SummaryCard;
	const { id, title, value, description, icon: Icon, valueId, help } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<article class="group/analytics-card card flex flex-col gap-sm p-md transition-colors duration-200 hover:border-primary-focus hover:shadow-sm" data-analytics-card${addAttribute(`${id}-title`, "aria-labelledby")}><div class="flex items-center justify-between gap-sm"><h3${addAttribute(`${id}-title`, "id")} class="text-body-sm font-medium text-ink-muted">${title}</h3><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-2 text-primary transition-transform duration-200 group-hover/analytics-card:scale-110" aria-hidden="true">${renderComponent($$result, "Icon", Icon, { "size": "16" })}</span></div><p${addAttribute(valueId, "id")} class="text-headline text-ink">${value}</p><p class="text-caption text-ink-subtle">${description}</p>${help && renderTemplate`<details class="mt-auto pt-xs"><summary class="inline-flex cursor-pointer items-center rounded-sm py-xs text-caption font-medium text-ink-subtle underline-offset-2 transition-colors duration-200 hover:text-ink">How is this measured?</summary><p class="mt-xs text-caption text-ink-subtle">${help}</p></details>`}</article>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/SummaryCard.astro", void 0);
//#endregion
//#region src/components/dashboard/AnalyticsCards.astro
var $$AnalyticsCards = createComponent(($$result, $$props, $$slots) => {
	const hasPortfolios = portfolioManagerStore.getPortfolios().length > 0;
	return renderTemplate`${maybeRenderHead($$result)}<section id="analytics-metrics" aria-labelledby="analytics-metrics-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xxs"><h2 id="analytics-metrics-heading" class="text-heading-sm text-ink">Portfolio metrics</h2><p class="text-body-sm text-ink-muted">Views, visitors, clicks and content scores for the selected portfolio and period.</p></div><p id="analytics-status" role="status" class="sr-only"></p><div id="analytics-empty" class="card mt-md flex w-full flex-col items-center gap-sm p-xl text-center"${addAttribute(hasPortfolios, "hidden")}><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "BarChart3", $$BarChart3, { "size": "24" })}</span><h3 class="text-heading-sm text-ink">No portfolio to analyze yet</h3><p class="max-w-narrow text-body-sm text-ink-subtle">Create a portfolio first to see its analytics.</p><div class="mt-sm"><a href="/portfolio-builder"${addAttribute("inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover", "class")}>${renderComponent($$result, "Plus", $$Plus, {
		"size": "16",
		"aria-hidden": "true"
	})}Create Portfolio</a></div></div><div id="analytics-grid" class="mt-md grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5" aria-busy="true"${addAttribute(!hasPortfolios, "hidden")}>${renderComponent($$result, "SummaryCard", $$SummaryCard, {
		"id": "analytics-views",
		"title": "Portfolio Views",
		"value": "—",
		"description": "Total portfolio views",
		"icon": $$Eye,
		"valueId": "analytics-views-value",
		"help": "Counts every portfolio_view event recorded for this portfolio in the selected period."
	})}${renderComponent($$result, "SummaryCard", $$SummaryCard, {
		"id": "analytics-visitors",
		"title": "Unique Visitors",
		"value": "—",
		"description": "Distinct anonymous visitors",
		"icon": $$Users,
		"valueId": "analytics-visitors-value",
		"help": "Distinct anonymous visitor tokens detected in the selected period. Tokens are never linked to identity."
	})}${renderComponent($$result, "SummaryCard", $$SummaryCard, {
		"id": "analytics-clicks",
		"title": "Clicks",
		"value": "—",
		"description": "Meaningful click interactions",
		"icon": $$MousePointerClick,
		"valueId": "analytics-clicks-value",
		"help": "Counts meaningful interactions such as opening a project or following a GitHub, LinkedIn, resume or contact link."
	})}${renderComponent($$result, "SummaryCard", $$SummaryCard, {
		"id": "analytics-completion",
		"title": "Completion",
		"value": "—",
		"description": "Portfolio completion score",
		"icon": $$CircleCheckBig,
		"valueId": "analytics-completion-value",
		"help": "How fully your portfolio content is filled in, based on the sections the portfolio builder collects."
	})}${renderComponent($$result, "SummaryCard", $$SummaryCard, {
		"id": "analytics-quality",
		"title": "AI Quality",
		"value": "—",
		"description": "PortForge content-quality indicator",
		"icon": $$Sparkles,
		"valueId": "analytics-quality-value",
		"help": "A PortForge content-quality indicator. It is not an ATS, hiring or employability score."
	})}</div><details id="analytics-metrics-about" class="mt-md"${addAttribute(!hasPortfolios, "hidden")}><summary class="inline-flex cursor-pointer items-center rounded-sm py-xs text-caption font-medium text-ink-subtle underline-offset-2 transition-colors duration-200 hover:text-ink">How these metrics are measured</summary><div class="card mt-xs p-md text-body-sm text-ink-subtle"><p>Metrics are computed locally from the analytics events recorded for the selected portfolio only, and are isolated by portfolio. Visitor identifiers are anonymous and are never linked to personal identity. The selected period filters which events are counted; switching periods re-evaluates every metric from the same recorded events.</p></div></details><div id="analytics-error" role="alert" class="mt-md rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-semantic-danger" hidden></div></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsCards.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AnalyticsCards.astro", void 0);
//#endregion
export { $$AnalyticsActivitySection as n, $$AnalyticsCards as t };
