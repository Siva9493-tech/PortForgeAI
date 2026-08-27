import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
import { i as $$Search, n as PORTFOLIO_EXPORT_OPTIONS, r as portfolioManagerStore, t as $$DashboardLayout } from "./DashboardLayout_CCYMs8pO.mjs";
import { t as $$Download } from "./Download_D2jnyiYq.mjs";
import { t as $$FolderPlus } from "./FolderPlus_Bf9ITuw9.mjs";
import { t as $$History } from "./History_C0HbuPmp.mjs";
import { t as $$Plus } from "./Plus_DPZfhrYc.mjs";
import { n as $$Trash2, t as $$X } from "./X_DoJvZmxM.mjs";
//#region node_modules/lucide-astro/dist/ArrowUpRight.astro
createAstro("https://astro.build");
var $$ArrowUpRight = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ArrowUpRight;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "arrow-up-right",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M7 7h10v10"></path><path d="M7 17 17 7"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/ArrowUpRight.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Copy.astro
createAstro("https://astro.build");
var $$Copy = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Copy;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "copy",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Copy.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Pencil.astro
createAstro("https://astro.build");
var $$Pencil = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Pencil;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "pencil",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Pencil.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Rocket.astro
createAstro("https://astro.build");
var $$Rocket = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Rocket;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "rocket",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Rocket.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/SearchX.astro
createAstro("https://astro.build");
var $$SearchX = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$SearchX;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "search-x",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="m13.5 8.5-5 5"></path><path d="m8.5 8.5 5 5"></path><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/SearchX.astro", void 0);
//#endregion
//#region src/lib/portfolio-manager/portfolio-card-utils.ts
/** Human-readable label for a portfolio status. Never color-only. */
function portfolioStatusText(status) {
	return status === "published" ? "Published" : "Draft";
}
/** Semantic tone tokens for a portfolio status (dot + label classes). */
function portfolioStatusTone(status) {
	return status === "published" ? {
		dot: "bg-semantic-success",
		label: "text-semantic-success"
	} : {
		dot: "bg-ink-tertiary",
		label: "text-ink-subtle"
	};
}
/** Consistent, locale-aware display formatting for ISO-8601 timestamps. */
function formatPortfolioDate(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleDateString(void 0, {
		year: "numeric",
		month: "short",
		day: "numeric"
	});
}
//#endregion
//#region src/components/portfolio/PortfolioCard.astro
createAstro("https://astro.build");
var $$PortfolioCard = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$PortfolioCard;
	const { portfolio } = Astro.props;
	const tone = portfolioStatusTone(portfolio.status);
	const titleId = `portfolio-card-title-${portfolio.id}`;
	const secondaryButtonClass = "inline-flex items-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2";
	return renderTemplate`${maybeRenderHead($$result)}<article class="card flex flex-col p-md"${addAttribute(titleId, "aria-labelledby")}><div class="flex items-start justify-between gap-sm"><h3${addAttribute(titleId, "id")} class="truncate text-body font-semibold text-ink">${portfolio.title}</h3><span class="inline-flex shrink-0 items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-xs py-xs"><span${addAttribute(`h-1.5 w-1.5 shrink-0 rounded-full ${tone.dot}`, "class")} aria-hidden="true"></span><span${addAttribute(`text-caption font-medium ${tone.label}`, "class")}>${portfolioStatusText(portfolio.status)}</span></span></div><dl class="mt-md flex flex-col gap-xs"><div class="flex items-center justify-between gap-sm"><dt class="text-caption text-ink-subtle">Last updated</dt><dd class="text-caption font-medium text-ink">${formatPortfolioDate(portfolio.updatedAt)}</dd></div><div class="flex items-center justify-between gap-sm"><dt class="text-caption text-ink-subtle">Version</dt><dd class="text-caption font-medium text-ink">v${portfolio.currentVersion}</dd></div></dl><div class="mt-md flex grow flex-col gap-sm rounded-b-md border-t border-hairline pt-sm">${portfolio.status === "draft" && renderTemplate`<button type="button"${addAttribute(portfolio.id, "data-publish-portfolio")}${addAttribute(`Publish ${portfolio.title}`, "aria-label")}${addAttribute("inline-flex w-full items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover", "class")}>${renderComponent($$result, "Rocket", $$Rocket, {
		"size": "14",
		"aria-hidden": "true"
	})}Publish</button>`}<button type="button"${addAttribute(portfolio.id, "data-duplicate-portfolio")}${addAttribute(`Duplicate ${portfolio.title}`, "aria-label")}${addAttribute("inline-flex w-full items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2", "class")}>${renderComponent($$result, "Copy", $$Copy, {
		"size": "14",
		"aria-hidden": "true"
	})}Duplicate</button><button type="button"${addAttribute(portfolio.id, "data-history-portfolio")}${addAttribute(`View version history for ${portfolio.title}`, "aria-label")}${addAttribute("inline-flex w-full items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2", "class")}>${renderComponent($$result, "History", $$History, {
		"size": "14",
		"aria-hidden": "true"
	})}Version History</button><button type="button"${addAttribute(portfolio.id, "data-export-portfolio")}${addAttribute(`Export ${portfolio.title}`, "aria-label")}${addAttribute("inline-flex w-full items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2", "class")}>${renderComponent($$result, "Download", $$Download, {
		"size": "14",
		"aria-hidden": "true"
	})}Export</button><div class="flex flex-wrap gap-sm"><a${addAttribute(`/portfolio-builder?portfolio=${portfolio.id}`, "href")}${addAttribute(`Edit ${portfolio.title}`, "aria-label")}${addAttribute(`${secondaryButtonClass} flex-1 justify-center`, "class")}>${renderComponent($$result, "Pencil", $$Pencil, {
		"size": "14",
		"aria-hidden": "true"
	})}Edit</a><a${addAttribute(`/preview?portfolio=${portfolio.id}`, "href")}${addAttribute(`Open ${portfolio.title}`, "aria-label")}${addAttribute(`${secondaryButtonClass} flex-1 justify-center`, "class")}>Open${renderComponent($$result, "ArrowUpRight", $$ArrowUpRight, {
		"size": "14",
		"class": "text-ink-subtle",
		"aria-hidden": "true"
	})}</a><button type="button"${addAttribute(portfolio.id, "data-delete-portfolio")}${addAttribute(`Delete ${portfolio.title}`, "aria-label")}${addAttribute(`inline-flex items-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-semantic-danger transition-colors duration-200 hover:bg-surface-2 flex-1 justify-center`, "class")}>${renderComponent($$result, "Trash2", $$Trash2, {
		"size": "14",
		"aria-hidden": "true"
	})}Delete</button></div></div></article>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/portfolio/PortfolioCard.astro", void 0);
//#endregion
//#region src/pages/portfolios.astro
var portfolios_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Portfolios,
	file: () => $$file,
	url: () => $$url
});
var $$Portfolios = createComponent(($$result, $$props, $$slots) => {
	const title = "My Portfolios â€” PortForge AI";
	const description = "Create, view and manage the portfolios you have generated with PortForge AI.";
	const records = portfolioManagerStore.getPortfolios();
	const primaryButtonClass = "inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover";
	const secondaryButtonClass = "inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-1";
	const primaryDeleteButtonClass = "inline-flex items-center justify-center gap-xs rounded-md bg-surface-2 px-md py-sm text-button font-medium text-semantic-danger transition-colors duration-200 hover:bg-surface-1 border border-hairline";
	const fieldClass = "w-full rounded-md border border-hairline bg-surface-2 px-md py-sm text-body-sm text-ink transition-colors duration-200 placeholder:text-ink-tertiary focus:border-primary-focus";
	return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {
		"title": title,
		"description": description,
		"pageLabel": "My Portfolios",
		"data-astro-cid-odaaseux": true
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<header class="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between" data-astro-cid-odaaseux><div data-astro-cid-odaaseux><h1 id="portfolios-heading" tabindex="-1" class="text-heading-md text-ink" data-astro-cid-odaaseux>My Portfolios</h1><p class="mt-1 max-w-narrow text-body-sm text-ink-muted" data-astro-cid-odaaseux>View and manage the portfolios you have generated with PortForge AI.</p></div><a href="/portfolio-builder"${addAttribute(primaryButtonClass, "class")} data-astro-cid-odaaseux>${renderComponent($$result, "Plus", $$Plus, {
		"size": "16",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}Create New Portfolio</a></header><div class="mt-lg flex flex-col gap-sm lg:flex-row lg:items-end lg:gap-md" data-astro-cid-odaaseux><div class="flex min-w-0 flex-1 flex-col gap-xs" data-astro-cid-odaaseux><label for="portfolio-search" class="text-caption font-medium text-ink-subtle" data-astro-cid-odaaseux>Search portfolios</label><div class="flex items-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm transition-colors duration-200 focus-within:border-primary-focus" data-astro-cid-odaaseux>${renderComponent($$result, "Search", $$Search, {
		"size": "16",
		"class": "shrink-0 text-ink-tertiary",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}<input id="portfolio-search" type="search" name="portfolio-search" placeholder="Search by titleâ€¦" autocomplete="off" spellcheck="false" class="w-full min-w-0 bg-transparent text-body-sm text-ink placeholder:text-ink-tertiary" data-astro-cid-odaaseux></div></div><div class="flex flex-col gap-xs" data-astro-cid-odaaseux><label for="portfolio-status-filter" class="text-caption font-medium text-ink-subtle" data-astro-cid-odaaseux>Status</label><select id="portfolio-status-filter" name="portfolio-status-filter"${addAttribute(fieldClass, "class")} data-astro-cid-odaaseux><option value="all" data-astro-cid-odaaseux>All</option><option value="draft" data-astro-cid-odaaseux>Draft</option><option value="published" data-astro-cid-odaaseux>Published</option></select></div></div><section aria-labelledby="portfolio-content-heading" class="mt-xl" data-astro-cid-odaaseux><h2 id="portfolio-content-heading" class="sr-only" data-astro-cid-odaaseux>Your portfolios</h2><p id="portfolios-count" aria-live="polite" class="text-body-sm text-ink-subtle" data-astro-cid-odaaseux></p><p id="portfolios-publish-status" role="status" class="text-body-sm font-medium text-semantic-success" hidden data-astro-cid-odaaseux></p><p id="portfolios-publish-error" role="alert" class="text-body-sm font-medium text-semantic-danger" hidden data-astro-cid-odaaseux></p><div id="portfolios-empty" class="card mt-md flex w-full flex-col items-center gap-sm p-xl text-center"${addAttribute(records.length > 0, "hidden")} data-astro-cid-odaaseux><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true" data-astro-cid-odaaseux>${renderComponent($$result, "FolderPlus", $$FolderPlus, {
		"size": "24",
		"data-astro-cid-odaaseux": true
	})}</span><h3 class="text-heading-sm text-ink" data-astro-cid-odaaseux>No portfolios yet</h3><p class="max-w-narrow text-body-sm text-ink-subtle" data-astro-cid-odaaseux>Create your first portfolio to get started.</p><div class="mt-sm" data-astro-cid-odaaseux><a href="/portfolio-builder"${addAttribute(primaryButtonClass, "class")} data-astro-cid-odaaseux>${renderComponent($$result, "Plus", $$Plus, {
		"size": "16",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}Create Portfolio</a></div></div><div id="portfolios-none" class="card mt-md flex w-full flex-col items-center gap-sm p-xl text-center" hidden data-astro-cid-odaaseux><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-subtle" aria-hidden="true" data-astro-cid-odaaseux>${renderComponent($$result, "SearchX", $$SearchX, {
		"size": "24",
		"data-astro-cid-odaaseux": true
	})}</span><h3 class="text-heading-sm text-ink" data-astro-cid-odaaseux>No portfolios found</h3><p class="max-w-narrow text-body-sm text-ink-subtle" data-astro-cid-odaaseux>Try changing your search or filter.</p><div class="mt-sm" data-astro-cid-odaaseux><button type="button" id="portfolios-reset"${addAttribute(secondaryButtonClass, "class")} data-astro-cid-odaaseux>Clear search and filters</button></div></div><div id="portfolios-list" class="mt-md grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"${addAttribute(records.length === 0, "hidden")} data-astro-cid-odaaseux>${records.map((portfolio) => renderTemplate`${renderComponent($$result, "PortfolioCard", $$PortfolioCard, {
		"portfolio": portfolio,
		"data-astro-cid-odaaseux": true
	})}`)}</div></section><dialog id="delete-portfolio-dialog" aria-labelledby="delete-portfolio-dialog-title" aria-describedby="delete-portfolio-dialog-description" class="card m-auto w-full max-w-sm p-lg" data-astro-cid-odaaseux><h2 id="delete-portfolio-dialog-title" class="text-heading-sm text-ink" data-astro-cid-odaaseux>Delete this portfolio?</h2><p id="delete-portfolio-dialog-description" class="mt-sm text-body-sm text-ink-muted" data-astro-cid-odaaseux>This permanently removes the portfolio. This action cannot be undone through the current UI, and the portfolio's contents will no longer be available.</p><div class="mt-lg flex flex-col-reverse gap-sm sm:flex-row sm:justify-end" data-astro-cid-odaaseux><button type="button" id="delete-portfolio-cancel"${addAttribute(secondaryButtonClass, "class")} data-astro-cid-odaaseux>Cancel</button><button type="button" id="delete-portfolio-confirm"${addAttribute(primaryDeleteButtonClass, "class")} data-astro-cid-odaaseux>${renderComponent($$result, "Trash2", $$Trash2, {
		"size": "14",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}Delete portfolio</button></div></dialog><dialog id="portfolio-history-dialog" aria-labelledby="portfolio-history-dialog-title" class="card m-auto w-full max-w-lg p-lg" data-astro-cid-odaaseux><div class="flex items-start justify-between gap-sm" data-astro-cid-odaaseux><div class="flex flex-col gap-xs" data-astro-cid-odaaseux><h2 id="portfolio-history-dialog-title" class="text-heading-sm text-ink" data-astro-cid-odaaseux>Version History</h2><p id="portfolio-history-dialog-subtitle" class="text-body-sm text-ink-muted" data-astro-cid-odaaseux></p></div><button type="button" id="portfolio-history-close" class="inline-flex items-center justify-center rounded-md border border-hairline bg-surface-2 p-xs text-ink transition-colors duration-200 hover:bg-surface-1" aria-label="Close version history" data-astro-cid-odaaseux>${renderComponent($$result, "X", $$X, {
		"size": "16",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}</button></div><ul id="portfolio-history-list" class="mt-lg flex flex-col gap-xs" data-astro-cid-odaaseux></ul></dialog><dialog id="restore-portfolio-dialog" aria-labelledby="restore-portfolio-dialog-title" aria-describedby="restore-portfolio-dialog-description" class="card m-auto w-full max-w-sm p-lg" data-astro-cid-odaaseux><h2 id="restore-portfolio-dialog-title" class="text-heading-sm text-ink" data-astro-cid-odaaseux>Restore version?</h2><p id="restore-portfolio-dialog-description" class="mt-sm text-body-sm text-ink-muted" data-astro-cid-odaaseux>Restoring creates a new current version from an older snapshot. Your existing version history is preserved and the portfolio's current contents are replaced with the restored data.</p><div class="mt-lg flex flex-col-reverse gap-sm sm:flex-row sm:justify-end" data-astro-cid-odaaseux><button type="button" id="restore-portfolio-cancel"${addAttribute(secondaryButtonClass, "class")} data-astro-cid-odaaseux>Cancel</button><button type="button" id="restore-portfolio-confirm"${addAttribute(primaryButtonClass, "class")} data-astro-cid-odaaseux>${renderComponent($$result, "History", $$History, {
		"size": "14",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}Restore</button></div></dialog><dialog id="portfolio-export-dialog" aria-labelledby="portfolio-export-dialog-title" aria-describedby="portfolio-export-dialog-description" class="card m-auto w-full max-w-lg p-lg" data-astro-cid-odaaseux><div class="flex items-start justify-between gap-sm" data-astro-cid-odaaseux><div class="flex flex-col gap-xs" data-astro-cid-odaaseux><h2 id="portfolio-export-dialog-title" class="text-heading-sm text-ink" data-astro-cid-odaaseux>Export Portfolio</h2><p id="portfolio-export-dialog-subtitle" class="text-body-sm text-ink-muted" data-astro-cid-odaaseux></p></div><button type="button" id="portfolio-export-close" class="inline-flex items-center justify-center rounded-md border border-hairline bg-surface-2 p-xs text-ink transition-colors duration-200 hover:bg-surface-1" aria-label="Close export dialog" data-astro-cid-odaaseux>${renderComponent($$result, "X", $$X, {
		"size": "16",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}</button></div><p id="portfolio-export-dialog-description" class="mt-sm text-body-sm text-ink-muted" data-astro-cid-odaaseux>Exporting uses the current version's data and does not change the portfolio's status or version history.</p><fieldset class="mt-lg flex flex-col gap-xs border-0 p-0" data-astro-cid-odaaseux><legend class="text-body-sm font-medium text-ink" data-astro-cid-odaaseux>Choose export format</legend>${PORTFOLIO_EXPORT_OPTIONS.map((option) => renderTemplate`<label${addAttribute([
		"flex flex-col gap-xs rounded-md border bg-surface-2 p-md",
		option.supported ? "border-hairline" : "border-hairline opacity-60",
		"focus-within:border-primary-focus"
	].join(" "), "class")} data-astro-cid-odaaseux><span class="flex items-start gap-sm" data-astro-cid-odaaseux><input type="radio" name="portfolio-export-format"${addAttribute(option.format, "value")}${addAttribute(!option.supported, "disabled")}${addAttribute(option.supported, "checked")} class="mt-0.5 size-4 accent-[var(--color-primary)]" data-astro-cid-odaaseux><span class="flex min-w-0 flex-col gap-xxs" data-astro-cid-odaaseux><span class="text-body-sm font-medium text-ink" data-astro-cid-odaaseux>${option.title}</span><span class="text-body-sm text-ink-muted" data-astro-cid-odaaseux>${option.description}</span>${!option.supported && renderTemplate`<span class="text-caption font-medium text-semantic-danger" data-astro-cid-odaaseux>${option.unavailableNote}</span>`}</span></span></label>`)}</fieldset><div class="mt-lg flex flex-col-reverse gap-sm sm:flex-row sm:justify-end" data-astro-cid-odaaseux><button type="button" id="portfolio-export-cancel"${addAttribute(secondaryButtonClass, "class")} data-astro-cid-odaaseux>Cancel</button><button type="button" id="portfolio-export-confirm"${addAttribute(primaryButtonClass, "class")} data-astro-cid-odaaseux>${renderComponent($$result, "Download", $$Download, {
		"size": "14",
		"aria-hidden": "true",
		"data-astro-cid-odaaseux": true
	})}Export</button></div></dialog>` })}${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/pages/portfolios.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/portfolios.astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/portfolios.astro";
var $$url = "/portfolios";
//#endregion
//#region \0virtual:astro:page:src/pages/portfolios@_@astro
var page = () => portfolios_exports;
//#endregion
export { page };
