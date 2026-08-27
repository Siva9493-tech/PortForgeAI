import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, i as renderComponent, m as addAttribute, p as renderHead } from "./server_DbbqJ9by.mjs";
import { i as isThemeId, o as DEFAULT_THEME_ID, r as getThemeById } from "./globals_hrWnACD0.mjs";
import { t as $$PortfolioRenderer } from "./portfolio-renderer_BX401gRl.mjs";
import { n as getPublishedBySlug } from "./portfolio-repository_BlQXBlWh.mjs";
//#region src/lib/portfolio-manager/portfolio-slug.ts
/** Public route prefix for the STEP 7 public profile page. */
var PUBLIC_ROUTE_PREFIX = "/portfolio";
/** The public URL for a resolved slug, e.g. `/portfolio/my-ai-ml-portfolio`. */
function publicUrlForSlug(slug) {
	return `${PUBLIC_ROUTE_PREFIX}/${slug}`;
}
//#endregion
//#region src/pages/portfolio/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	prerender: () => false,
	url: () => $$url
});
createAstro("https://astro.build");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const slug = Astro.params.slug ?? "";
	const record = await getPublishedBySlug(slug).catch(() => null);
	if (record === null)
 /**
	* Astro sets a real HTTP 404 status when `Astro.response.status = 404` is
	* set before the page body is rendered. The custom not-found card is still
	* drawn so the page is recognisable, but search engines and crawlers see a
	* correct 404 response code.
	*/
	Astro.response.status = 404;
	const themeId = record?.data.theme?.templateId ?? record?.data.metadata?.templateId;
	const theme = themeId && isThemeId(themeId) ? getThemeById(themeId) : getThemeById(DEFAULT_THEME_ID);
	const pageTitle = record?.data.seo?.title?.trim() || record?.title || "Portfolio";
	const description = record?.data.seo?.description || "";
	const publicPath = publicUrlForSlug(record?.slug ?? slug);
	const canonicalHref = Astro.site ? new URL(publicPath, Astro.site).href : publicPath;
	return renderTemplate`<html lang="en" class="scroll-smooth"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#010102"><meta name="color-scheme" content="dark"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="generator"${addAttribute(Astro.generator, "content")}><title>${pageTitle}</title><meta name="description"${addAttribute(description, "content")}><link rel="canonical"${addAttribute(canonicalHref, "href")}><meta property="og:title"${addAttribute(pageTitle, "content")}><meta property="og:description"${addAttribute(description, "content")}><meta property="og:type" content="profile">${record?.data.seo?.ogImage && renderTemplate`<meta property="og:image"${addAttribute(record.data.seo.ogImage, "content")}>`}<meta name="twitter:card" content="summary_large_image">${renderHead($$result)}</head><body><a href="#portfolio-preview" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface-2 focus:px-sm focus:py-xs focus:text-body-sm focus:text-ink">Skip to content</a>${record === null ? renderTemplate`<div class="card mx-auto mt-xl flex w-full max-w-md flex-col items-center gap-sm p-xl text-center"><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-subtle" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-6"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path><path d="m8 11 2 2 4-4"></path></svg></span><h1 class="text-heading-sm text-ink">Portfolio not found</h1><p class="text-body-sm text-ink-subtle">The portfolio you requested does not exist.</p></div>` : renderTemplate`${renderComponent($$result, "PortfolioRenderer", $$PortfolioRenderer, {
		"portfolio": record.data,
		"theme": theme
	})}`}</body></html>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/portfolio/[slug].astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/portfolio/[slug].astro";
var $$url = "/portfolio/[slug]";
//#endregion
//#region \0virtual:astro:page:src/pages/portfolio/[slug]@_@astro
var page = () => _slug__exports;
//#endregion
export { page };
