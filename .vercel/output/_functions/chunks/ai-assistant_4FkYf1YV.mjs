import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { y as $$Sparkles } from "./globals_hrWnACD0.mjs";
import { a as $$Bot, r as portfolioManagerStore, t as $$DashboardLayout } from "./DashboardLayout_CCYMs8pO.mjs";
import { t as $$FolderPlus } from "./FolderPlus_Bf9ITuw9.mjs";
//#region src/lib/ai-assistant/features.ts
/**
* Metadata describing the future AI Assistant tools. Task 1 registers the full
* set so the interface can present them; the generators themselves are
* implemented by later Day-10 tasks.
*/
var ASSISTANT_FEATURES = [
	{
		id: "headline",
		title: "Headline Generator",
		description: "Craft a compelling professional headline from your portfolio."
	},
	{
		id: "bio",
		title: "Bio Generator",
		description: "Write a concise, engaging profile summary."
	},
	{
		id: "project-description",
		title: "Project Descriptions",
		description: "Improve how your projects are described."
	},
	{
		id: "skills",
		title: "Skills Suggestions",
		description: "Get suggestions to strengthen your skills section."
	},
	{
		id: "portfolio-review",
		title: "Portfolio Review",
		description: "Get an overall review of your portfolio."
	},
	{
		id: "recommendations",
		title: "AI Recommendations",
		description: "Receive tailored improvements for your portfolio."
	}
];
//#endregion
//#region src/pages/ai-assistant.astro
var ai_assistant_exports = /* @__PURE__ */ __exportAll({
	default: () => $$AiAssistant,
	file: () => $$file,
	url: () => $$url
});
var $$AiAssistant = createComponent(($$result, $$props, $$slots) => {
	const title = "AI Assistant â€” PortForge AI";
	const description = "Use AI to improve your portfolio: headlines, bios, project descriptions and more.";
	const records = portfolioManagerStore.getPortfolios();
	const comingSoonFeatures = ASSISTANT_FEATURES.filter((feature) => feature.id !== "headline" && feature.id !== "bio" && feature.id !== "project-description" && feature.id !== "skills" && feature.id !== "portfolio-review" && feature.id !== "recommendations");
	const primaryButtonClass = "inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover";
	const fieldClass = "w-full rounded-md border border-hairline bg-surface-2 px-md py-sm text-body-sm text-ink transition-colors duration-200 placeholder:text-ink-tertiary focus:border-primary-focus";
	return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {
		"title": title,
		"description": description,
		"pageLabel": "AI Assistant"
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<header class="flex flex-col gap-md"><div class="flex items-start gap-sm"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "Bot", $$Bot, { "size": "20" })}</span><div class="flex min-w-0 flex-col gap-xxs"><h1 id="assistant-heading" tabindex="-1" class="text-heading-md text-ink">AI Assistant</h1><p class="max-w-narrow text-body-sm text-ink-muted">Generate and improve portfolio content from your saved portfolio. The assistant works with the portfolio shown below â€” it never changes your portfolio automatically.</p></div></div></header><p id="assistant-status" role="status" class="sr-only"></p><section aria-labelledby="assistant-context-heading" class="mt-xl"><h2 id="assistant-context-heading" class="sr-only">Portfolio context</h2><div id="assistant-context" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><span class="text-eyebrow font-medium uppercase tracking-tight text-ink-subtle">Working with portfolio</span><h3 id="assistant-context-title" class="truncate text-heading-sm text-ink"></h3></div><div class="flex shrink-0 items-center gap-xs"><span id="assistant-context-status" class="inline-flex items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-xs py-xs text-caption font-medium text-ink-subtle"></span><span id="assistant-context-version" class="inline-flex items-center rounded-pill border border-hairline bg-surface-2 px-xs py-xs text-caption font-medium text-ink-subtle"></span></div></div><dl class="grid grid-cols-2 gap-xs sm:grid-cols-4"><div class="flex flex-col gap-xxs rounded-md border border-hairline bg-surface-2 p-sm"><dt class="text-caption text-ink-subtle">Last updated</dt><dd id="assistant-context-updated" class="text-body-sm font-medium text-ink"></dd></div><div class="flex flex-col gap-xxs rounded-md border border-hairline bg-surface-2 p-sm"><dt class="text-caption text-ink-subtle">Theme</dt><dd id="assistant-context-theme" class="text-body-sm font-medium text-ink"></dd></div><div class="flex flex-col gap-xxs rounded-md border border-hairline bg-surface-2 p-sm"><dt class="text-caption text-ink-subtle">Content</dt><dd id="assistant-context-content" class="text-body-sm font-medium text-ink"></dd></div><div class="flex flex-col gap-xxs rounded-md border border-hairline bg-surface-2 p-sm"><dt class="text-caption text-ink-subtle">Summary</dt><dd id="assistant-context-summary" class="truncate text-body-sm font-medium text-ink"></dd></div></dl><div class="flex flex-col gap-xs border-t border-hairline pt-md sm:flex-row sm:items-end sm:justify-between"><div class="flex min-w-0 flex-1 flex-col gap-xs"><label for="assistant-portfolio-select" class="text-caption font-medium text-ink-subtle">Switch portfolio</label><select id="assistant-portfolio-select" name="assistant-portfolio"${addAttribute(fieldClass, "class")}></select></div><a href="/portfolios" class="inline-flex shrink-0 items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2 sm:self-end">Manage portfolios</a></div></div><div id="assistant-empty" class="card mt-md flex w-full flex-col items-center gap-sm p-xl text-center"${addAttribute(records.length > 0, "hidden")}><span class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "FolderPlus", $$FolderPlus, { "size": "24" })}</span><h3 class="text-heading-sm text-ink">No portfolio available yet</h3><p class="max-w-narrow text-body-sm text-ink-subtle">Create a portfolio first to use AI Assistant.</p><div class="mt-sm"><a href="/portfolio-builder"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}Create a portfolio</a></div></div></section><section aria-labelledby="headline-generator-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="headline-generator-heading" class="text-heading-md text-ink">Headline Generator</h2><p class="text-body-sm text-ink-muted">Generate a few professional headline options from the portfolio shown above, then copy the one you like. Nothing is saved automatically.</p></div><div id="headline-panel" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><span class="text-eyebrow font-medium uppercase tracking-tight text-ink-subtle">Current headline</span><p id="headline-current" class="truncate text-body-sm text-ink"></p></div><button id="headline-generate" type="button"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}<span>Generate headlines</span></button></div><p id="headline-status" role="status" class="sr-only"></p><div id="headline-error" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-muted" role="alert" hidden></div><ol id="headline-results" class="flex flex-col gap-xs"></ol></div><p id="headline-note" class="mt-sm text-caption text-ink-tertiary"${addAttribute(records.length > 0, "hidden")}>Create a portfolio to generate headline options.</p></section><section aria-labelledby="bio-generator-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="bio-generator-heading" class="text-heading-md text-ink">Bio Generator</h2><p class="text-body-sm text-ink-muted">Generate a few professional bio / about-section options from the portfolio shown above, then copy the one you like. Nothing is saved automatically.</p></div><div id="bio-panel" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><span class="text-eyebrow font-medium uppercase tracking-tight text-ink-subtle">Current summary</span><p id="bio-current" class="truncate text-body-sm text-ink"></p></div><button id="bio-generate" type="button"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}<span>Generate bios</span></button></div><p id="bio-status" role="status" class="sr-only"></p><div id="bio-error" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-muted" role="alert" hidden></div><ol id="bio-results" class="flex flex-col gap-xs"></ol></div><p id="bio-note" class="mt-sm text-caption text-ink-tertiary"${addAttribute(records.length > 0, "hidden")}>Create a portfolio to generate bio options.</p></section><section aria-labelledby="project-description-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="project-description-heading" class="text-heading-md text-ink">Project Description Generator</h2><p class="text-body-sm text-ink-muted">Generate a professional description for a project in the portfolio shown above, then copy the one you like. Nothing is saved automatically.</p></div><div id="project-description-panel" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-end sm:justify-between"><div class="flex min-w-0 flex-1 flex-col gap-xs"><label for="project-description-select" class="text-caption font-medium text-ink-subtle">Project</label><select id="project-description-select" name="project-description"${addAttribute(fieldClass, "class")}></select></div><button id="project-description-generate" type="button"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}<span>Generate description</span></button></div><p id="project-description-no-projects" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-subtle" hidden>No projects available yet. Add a project to your portfolio to generate a description.</p><p id="project-description-status" role="status" class="sr-only"></p><div id="project-description-error" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-muted" role="alert" hidden></div><ol id="project-description-results" class="flex flex-col gap-xs"></ol></div><p id="project-description-note" class="mt-sm text-caption text-ink-tertiary"${addAttribute(records.length > 0, "hidden")}>Create a portfolio to generate project descriptions.</p></section><section aria-labelledby="skills-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="skills-heading" class="text-heading-md text-ink">Skills Improvement Suggestions</h2><p class="text-body-sm text-ink-muted">Analyze the portfolio's skills and get grounded suggestions for improvement. Suggestions are recommendations only â€” nothing is added or changed automatically.</p></div><div id="skills-panel" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><span class="text-eyebrow font-medium uppercase tracking-tight text-ink-subtle">Existing skills</span><p id="skills-current" class="truncate text-body-sm text-ink"></p></div><button id="skills-generate" type="button"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}<span>Analyze skills</span></button></div><p id="skills-status" role="status" class="sr-only"></p><div id="skills-error" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-muted" role="alert" hidden></div><ol id="skills-results" class="flex flex-col gap-xs"></ol></div><p id="skills-note" class="mt-sm text-caption text-ink-tertiary"${addAttribute(records.length > 0, "hidden")}>Create a portfolio to analyze skills.</p></section><section aria-labelledby="portfolio-review-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="portfolio-review-heading" class="text-heading-md text-ink">Portfolio Review</h2><p class="text-body-sm text-ink-muted">Review the portfolio across its content areas and get grounded, itemized feedback with priorities. The review is read-only â€” nothing in the portfolio is changed automatically.</p></div><div id="portfolio-review-panel" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><span class="text-eyebrow font-medium uppercase tracking-tight text-ink-subtle">Portfolio completeness</span><p id="portfolio-review-current" class="truncate text-body-sm text-ink"></p></div><button id="portfolio-review-generate" type="button"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}<span>Review portfolio</span></button></div><p id="portfolio-review-status" role="status" class="sr-only"></p><div id="portfolio-review-error" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-muted" role="alert" hidden></div><ol id="portfolio-review-results" class="flex flex-col gap-xs"></ol></div><p id="portfolio-review-note" class="mt-sm text-caption text-ink-tertiary"${addAttribute(records.length > 0, "hidden")}>Create a portfolio to run a review.</p></section><section aria-labelledby="recommendations-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="recommendations-heading" class="text-heading-md text-ink">AI Recommendations</h2><p class="text-body-sm text-ink-muted">Get prioritized, actionable recommendations for improving the portfolio shown above. Recommendations are suggestions only â€” nothing is applied or changed automatically.</p></div><div id="recommendations-panel" class="card flex flex-col gap-md p-lg"${addAttribute(records.length === 0, "hidden")}><div class="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between"><div class="flex min-w-0 flex-col gap-xxs"><span class="text-eyebrow font-medium uppercase tracking-tight text-ink-subtle">Analyzed portfolio</span><p id="recommendations-current" class="truncate text-body-sm text-ink"></p></div><button id="recommendations-generate" type="button"${addAttribute(primaryButtonClass, "class")}>${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "16",
		"aria-hidden": "true"
	})}<span>Generate recommendations</span></button></div><p id="recommendations-status" role="status" class="sr-only"></p><div id="recommendations-error" class="rounded-md border border-hairline bg-surface-2 p-sm text-body-sm text-ink-muted" role="alert" hidden></div><ol id="recommendations-results" class="flex flex-col gap-xs"></ol></div><p id="recommendations-note" class="mt-sm text-caption text-ink-tertiary"${addAttribute(records.length > 0, "hidden")}>Create a portfolio to get recommendations.</p></section><section aria-labelledby="assistant-tools-heading" class="mt-xl"><div class="mb-md flex flex-col gap-xs"><h2 id="assistant-tools-heading" class="text-heading-md text-ink">More AI Tools</h2><p class="text-body-sm text-ink-muted">All AI Assistant tools are live: headline, bio, project description, skills suggestions, portfolio review, and AI recommendations.</p></div>${comingSoonFeatures.length > 0 && renderTemplate`<ul class="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">${comingSoonFeatures.map((feature) => renderTemplate`<li class="card flex flex-col gap-sm p-md"><div class="flex items-center justify-between gap-sm"><h3 class="text-body font-semibold text-ink">${feature.title}</h3><span class="inline-flex shrink-0 items-center rounded-pill border border-hairline bg-surface-2 px-xs py-xxs text-caption font-medium text-ink-subtle">Coming soon</span></div><p class="text-body-sm text-ink-muted">${feature.description}</p></li>`)}</ul>`}</section>` })}${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/pages/ai-assistant.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/ai-assistant.astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/ai-assistant.astro";
var $$url = "/ai-assistant";
//#endregion
//#region \0virtual:astro:page:src/pages/ai-assistant@_@astro
var page = () => ai_assistant_exports;
//#endregion
export { page };
