import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_DbbqJ9by.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
//#region node_modules/lucide-astro/dist/Eye.astro
createAstro("https://astro.build");
var $$Eye = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Eye;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "eye",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Eye.astro", void 0);
//#endregion
export { $$Eye as t };
