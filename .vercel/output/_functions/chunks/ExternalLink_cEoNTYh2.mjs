import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_DbbqJ9by.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
//#region node_modules/lucide-astro/dist/ExternalLink.astro
createAstro("https://astro.build");
var $$ExternalLink = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$ExternalLink;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "external-link",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/ExternalLink.astro", void 0);
//#endregion
export { $$ExternalLink as t };
