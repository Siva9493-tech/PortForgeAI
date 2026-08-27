import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_DbbqJ9by.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
//#region node_modules/lucide-astro/dist/History.astro
createAstro("https://astro.build");
var $$History = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$History;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "history",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/History.astro", void 0);
//#endregion
export { $$History as t };
