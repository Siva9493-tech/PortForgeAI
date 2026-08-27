import { n as __exportAll, t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { n as templateExit, t as templateEnter } from "./template-depth_CKtzEMPL.mjs";
import { b as $$Github, x as $$Component, y as $$Sparkles } from "./globals_hrWnACD0.mjs";
import { r as portfolioManagerStore, t as $$DashboardLayout } from "./DashboardLayout_CCYMs8pO.mjs";
import { n as $$AnalyticsActivitySection, t as $$AnalyticsCards } from "./AnalyticsCards_CjcJW_LK.mjs";
import { t as $$Download } from "./Download_D2jnyiYq.mjs";
import { t as $$ExternalLink } from "./ExternalLink_cEoNTYh2.mjs";
import { n as $$FileUp } from "./ProtectedRoute_B-WLvZzU.mjs";
import { t as $$FolderOpen } from "./FolderOpen_B_cKfjuG.mjs";
import { t as $$FolderPlus } from "./FolderPlus_Bf9ITuw9.mjs";
import { t as $$Plus } from "./Plus_DPZfhrYc.mjs";
//#region node_modules/lucide-astro/dist/Clock3.astro
createAstro("https://astro.build");
var $$Clock3 = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Clock3;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "clock-3",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M12 6v6h4"></path><circle cx="12" cy="12" r="10"></circle>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Clock3.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Hand.astro
createAstro("https://astro.build");
var $$Hand = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Hand;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "hand",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"></path><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"></path><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Hand.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/Palette.astro
createAstro("https://astro.build");
var $$Palette = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Palette;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "palette",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"></path><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Palette.astro", void 0);
//#endregion
//#region node_modules/lucide-astro/dist/ShieldCheck.astro
createAstro("https://astro.build");
var $$ShieldCheck = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ShieldCheck;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "shield-check",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/ShieldCheck.astro", void 0);
//#endregion
//#region src/components/dashboard/EmptyState.astro
var $$EmptyState = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section id="empty-state" aria-labelledby="empty-state-heading" class="mt-xl flex items-center justify-center" hidden><div class="card flex w-full max-w-[28rem] flex-col items-center gap-sm p-lg text-center"><span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-2 text-primary" aria-hidden="true">${renderComponent($$result, "FolderPlus", $$FolderPlus, { "size": "24" })}</span><div class="flex flex-col gap-xs"><h2 id="empty-state-heading" class="text-heading-md text-ink">No portfolios yet</h2><p class="text-body-sm text-ink-subtle">Create your first AI-powered portfolio to showcase your skills, projects, and achievements.</p></div><div class="mt-sm flex flex-col gap-sm sm:flex-row sm:flex-wrap sm:justify-center"><a href="/portfolio-builder" class="inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover">${renderComponent($$result, "Plus", $$Plus, {
		"size": "16",
		"aria-hidden": "true"
	})}Create Portfolio</a><button type="button" class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2">${renderComponent($$result, "FileUp", $$FileUp, {
		"size": "16",
		"aria-hidden": "true"
	})}Import Resume</button></div></div></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/EmptyState.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/EmptyState.astro", void 0);
//#endregion
//#region src/components/dashboard/QuickActions.astro
var $$QuickActions = createComponent(($$result, $$props, $$slots) => {
	const actions = [
		{
			id: "qa-create-portfolio",
			title: "Create Portfolio",
			description: "Start a new AI-powered portfolio.",
			icon: $$Plus
		},
		{
			id: "qa-import-resume",
			title: "Import Resume",
			description: "Upload your resume to generate content.",
			icon: $$FileUp
		},
		{
			id: "qa-import-github",
			title: "Import GitHub",
			description: "Fetch repositories automatically.",
			icon: $$Github
		},
		{
			id: "qa-ai-assistant",
			title: "AI Assistant",
			description: "Generate headlines, bios and project descriptions.",
			icon: $$Sparkles
		}
	];
	return renderTemplate`${maybeRenderHead($$result)}<section id="quick-actions" aria-labelledby="quick-actions-heading" class="mt-xl"><div class="mb-md"><h2 id="quick-actions-heading" class="text-heading-md text-ink">Quick Actions</h2><p class="mt-1 text-body-sm text-ink-muted">Start building your portfolio faster.</p></div><div class="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-4">${actions.map((action) => renderTemplate`<article class="card card-hover flex flex-col gap-sm p-md"${addAttribute(action.id, "aria-labelledby")}><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-1 text-primary" aria-hidden="true">${renderComponent($$result, "action.icon", action.icon, { "size": "18" })}</span><div class="flex flex-col gap-1"><h3${addAttribute(action.id, "id")} class="text-body font-medium text-ink">${action.title}</h3><p class="text-caption text-ink-subtle">${action.description}</p></div></article>`)}</div></section>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/QuickActions.astro", void 0);
//#endregion
//#region src/components/dashboard/RecentPortfolios.astro
var $$RecentPortfolios = createComponent(($$result, $$props, $$slots) => {
	const hasPortfolios = portfolioManagerStore.getPortfolios().length > 0;
	return renderTemplate`${maybeRenderHead($$result)}<section id="recent-portfolios" aria-labelledby="recent-portfolios-heading" class="mt-xl"${addAttribute(!hasPortfolios, "hidden")}><div class="mb-md"><h2 id="recent-portfolios-heading" class="text-heading-md text-ink">Recent Portfolios</h2><p class="mt-1 text-body-sm text-ink-muted">Continue editing your recently created portfolios.</p></div><div id="recent-portfolios-list" class="grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3"></div><template id="recent-portfolio-card-template">${templateEnter($$result)}<article class="card card-hover flex flex-col p-md"><div class="flex items-center justify-between gap-sm"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-1 text-primary" aria-hidden="true">${renderComponent($$result, "FolderOpen", $$FolderOpen, { "size": "18" })}</span><span class="inline-flex items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-sm py-xs"><span class="h-1.5 w-1.5 rounded-full bg-ink-tertiary" data-status-dot aria-hidden="true"></span><span class="text-caption font-medium text-ink-subtle" data-status-label>Draft</span></span></div><div class="mt-md flex flex-col gap-sm"><h3 class="text-body font-medium text-ink" data-title></h3><p class="flex items-center gap-xs text-caption text-ink-subtle" data-theme-row>${renderComponent($$result, "Palette", $$Palette, {
		"size": "13",
		"aria-hidden": "true"
	})}<span data-theme></span></p><p class="flex items-center gap-xs text-caption text-ink-subtle">${renderComponent($$result, "Clock3", $$Clock3, {
		"size": "13",
		"aria-hidden": "true"
	})}Updated <span data-updated></span></p></div><a data-open class="mt-md inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2">Open${renderComponent($$result, "ExternalLink", $$ExternalLink, {
		"size": "14",
		"class": "text-ink-subtle",
		"aria-hidden": "true"
	})}</a></article>${templateExit($$result)}</template></section>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/RecentPortfolios.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/RecentPortfolios.astro", void 0);
//#endregion
//#region src/components/dashboard/WelcomeSection.astro
var $$WelcomeSection = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${maybeRenderHead($$result)}<section id="welcome" aria-labelledby="welcome-heading" class="flex flex-col gap-lg"><div class="flex max-w-2xl flex-col gap-sm"><p class="flex items-center gap-xs text-eyebrow font-medium uppercase tracking-tight text-primary">${renderComponent($$result, "Hand", $$Hand, {
		"size": "14",
		"aria-hidden": "true"
	})}Welcome back!</p><h1 id="welcome-heading" class="text-display-md text-ink">Ready to build your next portfolio?</h1><p class="text-body-lg text-ink-subtle">Create, manage, and publish beautiful AI-powered portfolios from one workspace.</p><div class="mt-md flex flex-col gap-sm sm:flex-row sm:flex-wrap"><a href="/portfolio-builder" class="inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover">${renderComponent($$result, "Plus", $$Plus, {
		"size": "16",
		"aria-hidden": "true"
	})}Build Portfolio</a><button type="button" class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2">${renderComponent($$result, "FileUp", $$FileUp, {
		"size": "16",
		"aria-hidden": "true"
	})}Import Resume</button><button type="button" class="inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2">${renderComponent($$result, "Github", $$Github, {
		"size": "16",
		"aria-hidden": "true"
	})}Import GitHub</button></div></div><aside class="card shrink-0 p-md lg:w-72" aria-label="Workspace features"><ul class="flex flex-col gap-sm"><li class="flex items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-sm py-xs">${renderComponent($$result, "Sparkles", $$Sparkles, {
		"size": "14",
		"class": "text-primary",
		"aria-hidden": "true"
	})}<span class="text-caption font-medium text-ink-subtle">Portfolio Builder</span></li><li class="flex items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-sm py-xs">${renderComponent($$result, "ShieldCheck", $$ShieldCheck, {
		"size": "14",
		"class": "text-primary",
		"aria-hidden": "true"
	})}<span class="text-caption font-medium text-ink-subtle">AI Ready</span></li><li class="flex items-center gap-xs rounded-pill border border-hairline bg-surface-2 px-sm py-xs">${renderComponent($$result, "Download", $$Download, {
		"size": "14",
		"class": "text-primary",
		"aria-hidden": "true"
	})}<span class="text-caption font-medium text-ink-subtle">Export Anytime</span></li></ul></aside></section>`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/dashboard/WelcomeSection.astro", void 0);
//#endregion
//#region src/pages/dashboard.astro
var dashboard_exports = /* @__PURE__ */ __exportAll({
	default: () => $$Dashboard,
	file: () => $$file,
	url: () => $$url
});
var $$Dashboard = createComponent(($$result, $$props, $$slots) => {
	return renderTemplate`${renderComponent($$result, "DashboardLayout", $$DashboardLayout, {
		"title": "Dashboard â€” PortForge AI",
		"description": "Build and manage your AI-powered portfolio from your PortForge AI dashboard.",
		"pageLabel": "Dashboard"
	}, { "default": ($$result) => renderTemplate`${renderComponent($$result, "WelcomeSection", $$WelcomeSection, {})}${renderComponent($$result, "AnalyticsCards", $$AnalyticsCards, {})}${renderComponent($$result, "AnalyticsActivitySection", $$AnalyticsActivitySection, {})}${renderComponent($$result, "QuickActions", $$QuickActions, {})}${renderComponent($$result, "RecentPortfolios", $$RecentPortfolios, {})}${renderComponent($$result, "EmptyState", $$EmptyState, {})}` })}${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/pages/dashboard.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/pages/dashboard.astro", void 0);
var $$file = "D:/dev/Antigravity/PortForgeAI/app/src/pages/dashboard.astro";
var $$url = "/dashboard";
//#endregion
//#region \0virtual:astro:page:src/pages/dashboard@_@astro
var page = () => dashboard_exports;
//#endregion
export { page };
