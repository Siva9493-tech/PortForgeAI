import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { v as $$Trophy } from "./globals_hrWnACD0.mjs";
import { r as portfolioManagerStore, t as $$DashboardLayout } from "./DashboardLayout_CCYMs8pO.mjs";
import { t as $$Plus } from "./Plus_DPZfhrYc.mjs";
//#region src/components/dashboard/AchievementsCard.astro
var $$AchievementsCard = createComponent(($$result, $$props, $$slots) => {
	const hasPortfolios = portfolioManagerStore.getPortfolios().length > 0;
	return renderTemplate`${maybeRenderHead($$result)}<section id="achievements-section" aria-labelledby="achievements-list-heading" class="mt-xl"><div class="mb-md flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><h2 id="achievements-list-heading" class="text-heading-sm text-ink">Your achievements</h2><p class="text-body-sm text-ink-muted">Badges earned from your real portfolio content and analytics activity, isolated by portfolio.</p></div><div class="flex w-full min-w-0 flex-col gap-sm sm:w-64"><label for="achievements-portfolio-select" class="text-caption font-medium text-ink-subtle">Portfolio</label><select id="achievements-portfolio-select" name="achievements-portfolio"${addAttribute("w-full rounded-md border border-hairline bg-surface-2 px-md py-sm text-body-sm text-ink transition-colors duration-200 placeholder:text-ink-tertiary focus:border-primary-focus", "class")}></select></div></div><p id="achievements-summary" class="text-body-sm text-ink-subtle" aria-live="polite"></p><p id="achievements-status" role="status" class="sr-only"></p><div id="achievements-empty" class="card mt-md flex w-full flex-col items-center gap-sm p-xl text-center"${addAttribute(hasPortfolios, "hidden")}><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "Trophy", $$Trophy, { "size": "24" })}</span><h3 class="text-heading-sm text-ink">No portfolio to track yet</h3><p class="max-w-narrow text-body-sm text-ink-subtle">Create a portfolio first to start earning achievements.</p><div class="mt-sm"><a href="/portfolio-builder"${addAttribute("inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover", "class")}>${renderComponent($$result, "Plus", $$Plus, {
		"size": "16",
		"aria-hidden": "true"
	})}Create Portfolio</a></div></div><div id="achievements-zero" class="card mt-md flex w-full flex-col items-center gap-sm p-lg text-center" hidden><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "Trophy", $$Trophy, { "size": "24" })}</span><h3 class="text-heading-sm text-ink">Your first milestone is waiting</h3><p class="max-w-narrow text-body-sm text-ink-subtle">Keep building and sharing this portfolio to earn achievements from real activity.</p></div><div id="achievements-grid" class="mt-md grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-busy="true"${addAttribute(!hasPortfolios, "hidden")}></div><div id="achievements-error" role="alert" class="mt-md rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-semantic-danger" hidden></div></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AchievementsCard.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/AchievementsCard.astro", void 0);
//#endregion
//#region src/pages/achievements.astro
var achievements_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Achievements,
	file: () => $$file,
	url: () => $$url
});
var $$Achievements = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {
		"title": "Achievements â€” PortForge AI",
		"description": "Badges earned from your real portfolio content and analytics activity, isolated by portfolio.",
		"pageLabel": "Achievements"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<section aria-labelledby="achievements-page-heading" class="mt-xl"><h1 id="achievements-page-heading" tabindex="-1" class="text-heading-md text-ink">Achievements</h1><p class="mt-xxs text-body-sm text-ink-muted">Unlocked and locked milestones for a single portfolio, earned only from real portfolio content and analytics data.</p></section>${renderComponent($$result, "AchievementsCard", $$AchievementsCard, {})}` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/achievements.astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/achievements.astro";
var $$url = "/achievements";
//#endregion
//#region \0virtual:astro:page:src/pages/achievements@_@astro
var page = () => achievements_exports;
//#endregion
export { page };
