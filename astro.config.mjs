// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
//
// STEP 10: Official Vercel deployment architecture.
// @astrojs/vercel is the core-team adapter supporting server output.
// output: 'server' + adapter: vercel() produces the .vercel/output/
// serverless function that Vercel invokes. Static pages remain
// prerendered (index, login, signup, forgot-password); auth/session
// pages and /portfolio/[slug] remain request-time (no getStaticPaths).
export default defineConfig({
	output: 'server',
	adapter: vercel({
		webAnalytics: { enabled: true }
	}),
	vite: {
		plugins: [tailwindcss()],
	},
});
