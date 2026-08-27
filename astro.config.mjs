// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
//
// STEP 10: the public `/portfolio/[slug]` route must be reachable the moment a
// publish write to Supabase succeeds. With a fully static build Astro needs a
// rebuild to materialise a new path, so the deployment target is now the
// `@astrojs/node` standalone server. The standalone output is the smallest
// runtime addition possible: a single `dist/server/entry.mjs` plus the existing
// `dist/client/` static assets, served on the same Node process.
//
// Everything except `src/pages/portfolio/[slug].astro` is explicitly opted back
// into static prerender, so marketing pages, auth pages, and authenticated app
// pages keep their existing build-time generation semantics. The only runtime
// route is the public portfolio slug page.
export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	vite: {
		plugins: [tailwindcss()],
	},
});
