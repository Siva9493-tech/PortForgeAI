import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute, p as renderHead } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { a as previewSwatchClass, n as themeStore, t as generatePortfolio, x as $$Component } from "./globals_hrWnACD0.mjs";
import { n as $$FileText, r as $$ArrowLeft, t as $$PenLine } from "./PenLine_DEyhkoh_.mjs";
import { t as $$PortfolioRenderer } from "./portfolio-renderer_BX401gRl.mjs";
import { t as $$FolderOpen } from "./FolderOpen_B_cKfjuG.mjs";
//#region node_modules/lucide-astro/dist/Braces.astro
createAstro("https://astro.build");
var $$Braces = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Braces;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "braces",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"></path><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Braces.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/FileCode2.astro
createAstro("https://astro.build");
var $$FileCode2 = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$FileCode2;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "file-code-corner",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m5 16-3 3 3 3"></path><path d="m9 22 3-3-3-3"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/FileCode2.astro", void 0);
//#endregion
//#region src/components/portfolio/PortfolioExport.astro
var $$PortfolioExport = createComponent(($$result, $$props, $$slots) => {
	const options = [
		{
			title: "Static HTML Export",
			description: "Generate a standalone HTML portfolio.",
			icon: $$FileCode2
		},
		{
			title: "PDF Resume Export",
			description: "Create a printable PDF version.",
			icon: $$FileText
		},
		{
			title: "JSON Portfolio Data",
			description: "Export your structured portfolio information.",
			icon: $$Braces
		}
	];
	return renderTemplate`${maybeRenderHead($$result)}<section id="portfolio-export" aria-labelledby="portfolio-export-heading" class="mt-md flex flex-col gap-md"><div class="flex flex-col gap-xs"><h2 id="portfolio-export-heading" class="text-heading-md text-ink">Export Portfolio</h2><p class="text-body-sm text-ink-subtle">Prepare your portfolio for download or deployment.</p></div><div class="card flex flex-col gap-md p-lg"><ul class="flex flex-col gap-md">${options.map((option) => renderTemplate`<li class="flex flex-col gap-sm rounded-md border border-hairline bg-surface-2 p-md sm:flex-row sm:items-center sm:gap-md"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-2 text-ink-subtle" aria-hidden="true">${renderComponent($$result, "option.icon", option.icon, { "size": "20" })}</span><div class="flex min-w-0 flex-col gap-xxs"><h3 class="text-heading-sm text-ink">${option.title}</h3><p class="text-body-sm text-ink-muted">${option.description}</p></div><button type="button" disabled${addAttribute("inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto", "class")}>Export</button></li>`)}</ul><div class="flex flex-col gap-xs"><button type="button" disabled${addAttribute("inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 w-full", "class")}>Prepare Export</button><p class="text-body-sm text-ink-tertiary">Export generation will be available after AI portfolio creation is completed.</p></div></div></section>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/portfolio/PortfolioExport.astro", void 0);
//#endregion
//#region src/pages/preview.astro
var preview_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Preview,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Preview = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Preview;
	const generated = generatePortfolio();
	const ssrPortfolio = generated.portfolio;
	const currentTheme = generated.theme;
	const availableThemes = themeStore.getAvailableThemes();
	const isBuilderPreview = new URL(Astro.url).searchParams.get("from") === "builder";
	const themeButtonBase = "inline-flex items-center gap-xs rounded-md border px-md py-sm text-button font-medium transition duration-200";
	const themeButtonActive = "bg-primary text-on-primary border-primary";
	const themeButtonIdle = "bg-surface-2 text-ink border-hairline";
	return renderTemplate`<html lang="en" class="scroll-smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#010102"><meta name="color-scheme" content="dark"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro.generator, "content")}><title>${isBuilderPreview ? "Portfolio Builder Preview" : "Portfolio Preview"}</title><meta name="description"${addAttribute(ssrPortfolio.seo?.description, "content")}>${renderHead($$result)}</head><body><a href="#live-preview-root" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-2 focus:px-sm focus:py-xs focus:text-body-sm focus:text-ink">Skip to content</a><header class="border-b border-hairline" aria-label="Preview controls"><div class="mx-auto flex w-full max-w-page flex-wrap items-center gap-md px-md py-md md:px-xl"><div class="mr-auto flex min-w-0 flex-wrap items-center gap-xs"><a data-back-to-builder class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1" hidden>${renderComponent($$result, "ArrowLeft", $$ArrowLeft, {
		"size": "16",
		"aria-hidden": "true"
	})}Back to Builder</a><a data-edit-portfolio class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1" hidden>${renderComponent($$result, "PenLine", $$PenLine, {
		"size": "16",
		"aria-hidden": "true"
	})}Edit Portfolio</a><a data-back-to-portfolios class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1" hidden>${renderComponent($$result, "FolderOpen", $$FolderOpen, {
		"size": "16",
		"aria-hidden": "true"
	})}My Portfolios</a></div><label id="theme-selector-label" class="text-body-sm font-medium text-ink-muted">Theme</label><div id="theme-selector" role="group" aria-labelledby="theme-selector-label" class="flex flex-wrap gap-xs">${availableThemes.map((theme) => renderTemplate`<button type="button"${addAttribute(theme.id, "data-theme-id")}${addAttribute(theme.id === currentTheme.id ? "true" : "false", "aria-pressed")}${addAttribute(`${themeButtonBase} ${theme.id === currentTheme.id ? themeButtonActive : themeButtonIdle}`, "class")}><span${addAttribute(`block size-2 rounded-full ${previewSwatchClass(theme.id)}`, "class")} aria-hidden="true"></span>${theme.name}</button>`)}</div></div><p id="preview-status" role="status" class="mx-auto flex w-full max-w-page items-start gap-xs px-md pb-md text-caption text-ink-subtle md:px-xl" hidden></p></header><div id="live-preview-root">${renderComponent($$result, "PortfolioRenderer", $$PortfolioRenderer, {
		"portfolio": ssrPortfolio,
		"theme": currentTheme
	})}</div><div class="mx-auto w-full max-w-page px-md md:px-xl">${renderComponent($$result, "PortfolioExport", $$PortfolioExport, {})}</div>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/pages/preview.astro?astro&type=script&index=0&lang.ts")}</body></html>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/preview.astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/preview.astro";
var $$url = "/preview";
//#endregion
//#region \0virtual:astro:page:src/pages/preview@_@astro
var page = () => preview_exports;
//#endregion
export { page };
