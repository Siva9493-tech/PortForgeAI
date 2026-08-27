// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
//
// STEP 10: Vercel deployment architecture.
//
// We use @astrojs/node in standalone mode. The build emits
// `dist/server/entry.mjs`, which Vercel invokes directly as a long-running
// Node server. Static pages use `export const prerender = true`; the public
// portfolio slug route and authenticated pages use `prerender = false` and
// render on each request. This isolates server-side environment checks
// from the static build steps and matches Vercel's expected Node runtime
// contract (no serverless function routing layer to misroute `/`).
export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	vite: {
		plugins: [tailwindcss()],
	},
});
