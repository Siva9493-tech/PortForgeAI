import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, c as renderSlot, d as renderTemplate, f as maybeRenderHead, i as renderComponent, m as addAttribute } from "./server_DbbqJ9by.mjs";
import { t as renderScript } from "./script_BxHXw6xd.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
//#region node_modules/lucide-astro/dist/FileUp.astro
createAstro("https://astro.build");
var $$FileUp = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$FileUp;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "file-up",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M12 12v6"></path><path d="m15 15-3-3-3 3"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/FileUp.astro", void 0);
//#endregion
//#region src/components/ProtectedRoute.astro
createAstro("https://astro.build");
var $$ProtectedRoute = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ProtectedRoute;
	const { redirectTo = "/login" } = Astro.props;
	return renderTemplate`${maybeRenderHead($$result)}<div class="root" data-protected-route${addAttribute(redirectTo, "data-redirect")} aria-busy="true" data-astro-cid-5yp3aujm><div class="loading" data-loading data-astro-cid-5yp3aujm><span class="spinner" aria-hidden="true" data-astro-cid-5yp3aujm></span><p class="mt-md text-body-sm text-ink-subtle" data-astro-cid-5yp3aujm>Checking your session…</p></div><div class="content" data-content hidden data-astro-cid-5yp3aujm>${renderSlot($$result, $$slots["default"])}</div></div>${renderScript($$result, "D:/dev/Antigravity/PortForgeAI/app/src/components/ProtectedRoute.astro?astro&type=script&index=0&lang.ts")}`;
}, "D:/dev/Antigravity/PortForgeAI/app/src/components/ProtectedRoute.astro", void 0);
//#endregion
export { $$FileUp as n, $$ProtectedRoute as t };
