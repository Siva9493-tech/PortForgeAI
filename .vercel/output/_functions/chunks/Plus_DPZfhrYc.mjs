import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_DbbqJ9by.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
//#region node_modules/lucide-astro/dist/Plus.astro
createAstro("https://astro.build");
var $$Plus = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Plus;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "plus",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M5 12h14"></path><path d="M12 5v14"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Plus.astro", void 0);
//#endregion
export { $$Plus as t };
