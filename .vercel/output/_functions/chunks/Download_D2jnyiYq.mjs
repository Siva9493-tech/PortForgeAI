import { t as createComponent } from "./compiler_C6hRptXc.mjs";
import { S as createAstro, d as renderTemplate, f as maybeRenderHead, i as renderComponent } from "./server_DbbqJ9by.mjs";
import { x as $$Component } from "./globals_hrWnACD0.mjs";
//#region node_modules/lucide-astro/dist/Download.astro
createAstro("https://astro.build");
var $$Download = createComponent(($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Download;
	return renderTemplate`${renderComponent($$result, "Layout", $$Component, {
		"iconName": "download",
		...Astro.props
	}, { "default": ($$result) => renderTemplate`${maybeRenderHead($$result)}<path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path>` })}`;
}, "D:/dev/Antigravity/PortForgeAI/app/node_modules/lucide-astro/dist/Download.astro", void 0);
//#endregion
export { $$Download as t };
