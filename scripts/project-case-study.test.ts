import { deepEqual, equal, ok } from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeProjects } from '../src/lib/ai/portfolio-schema.ts';
import { transformProjects } from '../src/lib/ai/transformer.ts';
import type { PortfolioProject } from '../src/lib/ai/types.ts';
import {
	findProjectBySlug,
	getProjectSlug,
	isSafeWebUrl,
	resolveProject,
	resolveProjects,
} from '../src/lib/portfolio/public-data.ts';
import type { ProjectEntry } from '../src/lib/portfolio/types.ts';

test('1. Old project with only basic fields resolves safely without error and preserves backward compatibility', () => {
	// Represents an existing project in the database with only legacy fields
	const oldProject: PortfolioProject = {
		name: 'Legacy Card Project',
		description: 'A simple project built before Day 16 case studies were introduced.',
		technologies: ['React', 'CSS'],
		highlights: ['Deployed MVP'],
		repositoryUrl: 'https://github.com/developer/legacy-project',
		liveUrl: 'https://legacy-project.vercel.app',
	};

	const resolved = resolveProject(oldProject);

	equal(resolved.name, 'Legacy Card Project');
	equal(resolved.description, 'A simple project built before Day 16 case studies were introduced.');
	equal(resolved.repositoryUrl, 'https://github.com/developer/legacy-project');
	equal(resolved.liveUrl, 'https://legacy-project.vercel.app');
	equal(resolved.hasCaseStudy, false);
	equal(resolved.caseStudy.problem, null);
	equal(resolved.caseStudy.whyItMattered, null);
	equal(resolved.caseStudy.solution, null);
	equal(resolved.caseStudy.howItWasBuilt, null);
	equal(resolved.caseStudy.challenges, null);
	equal(resolved.caseStudy.results, null);
	equal(resolved.hasMedia, false);
	equal(resolved.media.length, 0);
	equal(resolved.demoVideoUrl, null);
});

test('2. Project with complete case study preserves all conceptual fields across schema and resolution', () => {
	const completeProject: PortfolioProject = {
		name: 'PortForge AI',
		role: 'Lead Architect',
		description: 'Next-generation AI portfolio builder with live themes and deterministic export.',
		technologies: ['Astro', 'TypeScript', 'Tailwind', 'Supabase'],
		highlights: ['Sub-second page loads', 'Zero CSS layout shift'],
		repositoryUrl: 'https://github.com/developer/portforge-ai',
		liveUrl: 'https://portforge.dev',
		problem: 'Existing portfolio builders lock users into rigid templates and generate bloated markup.',
		whyItMattered: 'Developers need clean, fast, authoritative portfolios to land senior roles without maintenance overhead.',
		solution: 'Engineered an Astro-powered platform combining live theme switching with structured data schemas.',
		howItWasBuilt: 'Constructed using Astro SSR, Tailwind tokens, Supabase RLS, and strict TypeScript types.',
		challenges: 'Synchronizing client-side theme preview with server-side rendered layouts without re-fetching.',
		results: 'Reduced portfolio generation time by 80% with 100/100 Lighthouse performance across all templates.',
		media: [
			{ url: 'https://portforge.dev/shot1.png', alt: 'Dashboard overview', caption: 'Live preview editor' },
			{ url: 'https://portforge.dev/shot2.png', alt: 'Mobile view' },
		],
		demoVideoUrl: 'https://youtube.com/watch?v=demo123',
	};

	// Validate normalization pass
	const [normalized] = normalizeProjects([completeProject]);
	equal(normalized.name, 'PortForge AI');
	equal(normalized.problem, completeProject.problem);
	equal(normalized.whyItMattered, completeProject.whyItMattered);
	equal(normalized.solution, completeProject.solution);
	equal(normalized.howItWasBuilt, completeProject.howItWasBuilt);
	equal(normalized.challenges, completeProject.challenges);
	equal(normalized.results, completeProject.results);
	equal(normalized.media?.length, 2);
	equal(normalized.demoVideoUrl, 'https://youtube.com/watch?v=demo123');

	// Validate resolution pass
	const resolved = resolveProject(normalized);
	equal(resolved.hasCaseStudy, true);
	equal(resolved.caseStudy.problem, completeProject.problem);
	equal(resolved.caseStudy.whyItMattered, completeProject.whyItMattered);
	equal(resolved.caseStudy.solution, completeProject.solution);
	equal(resolved.caseStudy.howItWasBuilt, completeProject.howItWasBuilt);
	equal(resolved.caseStudy.role, 'Lead Architect');
	equal(resolved.caseStudy.challenges, completeProject.challenges);
	equal(resolved.caseStudy.results, completeProject.results);
	equal(resolved.hasMedia, true);
	equal(resolved.media.length, 2);
	equal(resolved.media[0].caption, 'Live preview editor');
	equal(resolved.demoVideoUrl, 'https://youtube.com/watch?v=demo123');
});

test('3. Project with partial case study gracefully resolves populated fields and sets omitted fields to null', () => {
	const partialProject: PortfolioProject = {
		name: 'Micro Service Gateway',
		technologies: ['Go', 'gRPC'],
		description: 'High-throughput RPC gateway.',
		problem: 'Service-to-service communication bottleneck under 10k RPS load.',
		solution: 'Introduced an in-memory connection pool with asynchronous batching.',
		// whyItMattered, howItWasBuilt, challenges, results intentionally omitted
	};

	const resolved = resolveProject(partialProject);
	equal(resolved.hasCaseStudy, true);
	equal(resolved.caseStudy.problem, 'Service-to-service communication bottleneck under 10k RPS load.');
	equal(resolved.caseStudy.solution, 'Introduced an in-memory connection pool with asynchronous batching.');
	equal(resolved.caseStudy.whyItMattered, null);
	equal(resolved.caseStudy.howItWasBuilt, null);
	equal(resolved.caseStudy.challenges, null);
	equal(resolved.caseStudy.results, null);
});

test('4. Project without screenshots resolves hasMedia to false and media array to empty', () => {
	const projectNoScreenshots: PortfolioProject = {
		name: 'CLI Tool',
		description: 'Command line utility without GUI screenshots.',
		technologies: ['Rust'],
	};

	const resolved = resolveProject(projectNoScreenshots);
	equal(resolved.hasMedia, false);
	deepEqual(resolved.media, []);
	equal(resolved.demoVideoUrl, null);
});

test('5. Project without GitHub URL resolves repositoryUrl to null without throwing', () => {
	const proprietaryProject: PortfolioProject = {
		name: 'Proprietary Internal Tool',
		description: 'Internal tool with private closed source repository.',
		technologies: ['Python', 'PostgreSQL'],
		liveUrl: 'https://internal.company.com',
	};

	const resolved = resolveProject(proprietaryProject);
	equal(resolved.repositoryUrl, null);
	equal(resolved.liveUrl, 'https://internal.company.com');
	equal(resolved.hasLinks, true);
});

test('6. Project without live demo URL resolves liveUrl to null without placeholder links', () => {
	const backendEngine: PortfolioProject = {
		name: 'Distributed Database Engine',
		description: 'Underlying storage engine with no web frontend.',
		technologies: ['C++', 'RocksDB'],
		repositoryUrl: 'https://github.com/engine/db',
	};

	const resolved = resolveProject(backendEngine);
	equal(resolved.liveUrl, null);
	equal(resolved.repositoryUrl, 'https://github.com/engine/db');
	equal(resolved.hasLinks, true);
});

test('7. Project without results does not invent fake metrics or percentages', () => {
	const academicProject: PortfolioProject = {
		name: 'Algorithmic Research',
		description: 'Study of graph partition algorithms.',
		technologies: ['Python'],
		problem: 'Graph partitioning heuristics degrade on non-planar graphs.',
		solution: 'Formulated a spectral clustering approximation.',
		// no results or metrics provided
	};

	const resolved = resolveProject(academicProject);
	equal(resolved.caseStudy.results, null);
	ok(!resolved.caseStudy.results, 'Must not manufacture any fake metrics or percentages');
});

test('8. Project with multiple screenshots parses and normalizes URLs, alt text and captions correctly', () => {
	const entry: ProjectEntry = {
		projectName: 'Design System Documentation',
		projectRole: 'Design Engineer',
		technologies: 'Astro, Tailwind',
		githubUrl: 'https://github.com/org/design-system',
		demoUrl: 'https://design.org.com',
		description: 'Comprehensive token and component showcase.',
		highlights: 'WCAG AAA compliant',
		problem: 'Disjointed component styling across teams.',
		whyItMattered: 'Brand inconsistency and repeated CSS authoring.',
		solution: 'Unified token library with live preview documentation.',
		howItWasBuilt: 'Built with Tailwind v4 CSS variables and Astro islands.',
		challenges: 'Cross-browser color gamut differences in OKLCH.',
		results: 'Adopted by 4 internal product teams.',
		mediaUrls: 'https://design.org.com/shot1.png | Token Architecture\nhttps://design.org.com/shot2.png | Component Grid\nhttps://design.org.com/shot3.png',
		demoVideoUrl: 'https://youtube.com/watch?v=sys-demo',
	};

	// Test form transform pipeline (form entry -> PortfolioProject)
	const [transformed] = transformProjects({
		data: { projects: [entry] } as any,
		templateId: 'modern',
	});
	equal(transformed.name, 'Design System Documentation');
	equal(transformed.role, 'Design Engineer');
	equal(transformed.media?.length, 3);
	equal(transformed.media?.[0].url, 'https://design.org.com/shot1.png');
	equal(transformed.media?.[0].caption, 'Token Architecture');
	equal(transformed.media?.[1].url, 'https://design.org.com/shot2.png');
	equal(transformed.media?.[1].caption, 'Component Grid');
	equal(transformed.media?.[2].url, 'https://design.org.com/shot3.png');
	equal(transformed.media?.[2].caption, undefined);
	equal(transformed.demoVideoUrl, 'https://youtube.com/watch?v=sys-demo');


	// Test resolution pipeline
	const resolved = resolveProject(transformed);
	equal(resolved.hasMedia, true);
	equal(resolved.media.length, 3);
	equal(resolved.demoVideoUrl, 'https://youtube.com/watch?v=sys-demo');
});

test('9. Unsafe or malicious URLs (javascript: or data: in links) are rejected', () => {
	equal(isSafeWebUrl('javascript:alert(1)'), false);
	equal(isSafeWebUrl('data:text/html,<script>alert(1)</script>'), false);
	equal(isSafeWebUrl('https://example.com/project'), true);
	equal(isSafeWebUrl('http://localhost:3000'), true);
	equal(isSafeWebUrl(''), false);
	equal(isSafeWebUrl(undefined), false);

	const maliciousProject: PortfolioProject = {
		name: 'Unsafe Project',
		description: 'Project with injected URLs',
		technologies: [],
		repositoryUrl: 'javascript:void(0)',
		liveUrl: 'data:text/html;base64,...',
	};

	const resolved = resolveProject(maliciousProject);
	equal(resolved.repositoryUrl, null);
	equal(resolved.liveUrl, null);
	equal(resolved.hasLinks, false);
});

test('10. getProjectSlug produces clean, deterministic slugs matching portfolio naming conventions', () => {
	equal(getProjectSlug({ name: 'Driver Risk Assessment', role: '', technologies: [], description: '', highlights: [] }), 'driver-risk-assessment');
	equal(getProjectSlug({ name: 'AI Code Reviewer & Linter!', role: '', technologies: [], description: '', highlights: [] }), 'ai-code-reviewer-linter');
	equal(getProjectSlug({ name: '', role: '', technologies: [], description: '', highlights: [] }, 0), 'project-1');
	equal(getProjectSlug({ id: 'proj-custom-id', name: '', role: '', technologies: [], description: '', highlights: [] }, 1), 'proj-custom-id');
});

test('11. findProjectBySlug correctly locates project by slug or ID and preserves portfolio ordering', () => {
	const projects: PortfolioProject[] = [
		{ id: 'p1', name: 'Alpha Gateway', description: 'First project', role: '', technologies: [], highlights: [] },
		{ id: 'p2', name: 'Beta Visualizer', description: 'Second project', role: '', technologies: [], highlights: [] },
		{ id: 'p3', name: 'Gamma Optimizer', description: 'Third project', role: '', technologies: [], highlights: [] },
	];

	// Match by slug
	const matchMiddle = findProjectBySlug(projects, 'beta-visualizer');
	ok(matchMiddle !== null);
	equal(matchMiddle.project.name, 'Beta Visualizer');
	equal(matchMiddle.index, 1);
	equal(matchMiddle.prevProject?.name, 'Alpha Gateway');
	equal(matchMiddle.nextProject?.name, 'Gamma Optimizer');

	// First project has no prevProject
	const matchFirst = findProjectBySlug(projects, 'alpha-gateway');
	ok(matchFirst !== null);
	equal(matchFirst.index, 0);
	equal(matchFirst.prevProject, null);
	equal(matchFirst.nextProject?.name, 'Beta Visualizer');

	// Last project has no nextProject
	const matchLast = findProjectBySlug(projects, 'p3'); // match by raw ID
	ok(matchLast !== null);
	equal(matchLast.index, 2);
	equal(matchLast.prevProject?.name, 'Beta Visualizer');
	equal(matchLast.nextProject, null);
});

test('12. findProjectBySlug returns null for non-existent project or empty source', () => {
	const projects: PortfolioProject[] = [
		{ name: 'Portfolio Forge', description: 'A builder', role: '', technologies: [], highlights: [] },
	];

	equal(findProjectBySlug(projects, 'non-existent-project'), null);
	equal(findProjectBySlug([], 'portfolio-forge'), null);
	equal(findProjectBySlug(null, 'portfolio-forge'), null);
	equal(findProjectBySlug(projects, ''), null);
});

test('13. Partial case study states (A: title only, B: title+summary, C: +tech, D: +problem+solution, E: complete) resolve cleanly', () => {
	// State A: Title only
	const stateA = resolveProject({ name: 'Minimal Tool', description: '', role: '', technologies: [], highlights: [] });
	equal(stateA.name, 'Minimal Tool');
	equal(stateA.hasCaseStudy, false);
	equal(stateA.caseStudy.problem, null);
	equal(stateA.caseStudy.solution, null);

	// State B: Title + summary
	const stateB = resolveProject({ name: 'Doc Generator', description: 'Generates API docs from schemas.', role: '', technologies: [], highlights: [] });
	equal(stateB.summary, 'Generates API docs from schemas.');
	equal(stateB.hasCaseStudy, false);

	// State C: Title + summary + technologies
	const stateC = resolveProject({ name: 'Web Analytics', description: 'Privacy-first analytics.', role: 'Lead Developer', technologies: ['TypeScript', 'ClickHouse'], highlights: [] });
	equal(stateC.technologies.length, 2);
	equal(stateC.role, 'Lead Developer');
	equal(stateC.hasCaseStudy, false);

	// State D: Title + summary + problem + solution
	const stateD = resolveProject({
		name: 'Cache Sync',
		description: 'Distributed cache sync.',
		role: '',
		technologies: ['Go', 'Redis'],
		highlights: [],
		problem: 'Cache invalidation stampedes under spike loads.',
		solution: 'Implemented probabilistic early expiration (XFetch).',
	});
	equal(stateD.hasCaseStudy, true);
	equal(stateD.caseStudy.problem, 'Cache invalidation stampedes under spike loads.');
	equal(stateD.caseStudy.solution, 'Implemented probabilistic early expiration (XFetch).');
	equal(stateD.caseStudy.howItWasBuilt, null);
	equal(stateD.caseStudy.results, null);

	// State E: Complete case study
	const stateE = resolveProject({
		name: 'Driver Risk Assessment',
		description: 'Real-time telemetry and hazard scoring for commercial fleet drivers.',
		role: 'Sole Engineer',
		technologies: ['Python', 'FastAPI', 'PyTorch'],
		highlights: ['Sub-50ms inference', 'Edge deployment'],
		problem: 'Fleet managers lacked real-time visibility into driver fatigue and risk patterns.',
		whyItMattered: 'Preventable road accidents caused insurance premiums and vehicle downtime to surge.',
		solution: 'Built a sensor-fusion pipeline analyzing acceleration, lane deviation, and brake timing.',
		howItWasBuilt: 'Trained a temporal CNN on CAN-bus telemetry and deployed it as a containerized edge agent.',
		challenges: 'Noisy gyroscope sensor readings on uneven road terrain required Butterworth bandpass filtering.',
		results: 'Reduced critical driving incident alerts by 34% across a test pilot of 50 vehicles.',
		media: [{ url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341', alt: 'Telemetry Dashboard' }],
		repositoryUrl: 'https://github.com/developer/driver-risk',
		liveUrl: 'https://driver-risk.dev',
	});
	equal(stateE.hasCaseStudy, true);
	equal(stateE.hasMedia, true);
	equal(stateE.hasLinks, true);
	equal(stateE.caseStudy.role, 'Sole Engineer');
	equal(stateE.caseStudy.results, 'Reduced critical driving incident alerts by 34% across a test pilot of 50 vehicles.');
});

test('14. Link resilience handles GitHub only, Live demo only, Both, and Neither gracefully', () => {
	// Neither
	const neither = resolveProject({ name: 'Offline Script', description: '', role: '', technologies: [], highlights: [] });
	equal(neither.repositoryUrl, null);
	equal(neither.liveUrl, null);
	equal(neither.hasLinks, false);

	// GitHub only
	const ghOnly = resolveProject({ name: 'Open Library', description: '', role: '', technologies: [], highlights: [], repositoryUrl: 'https://github.com/dev/lib' });
	equal(ghOnly.repositoryUrl, 'https://github.com/dev/lib');
	equal(ghOnly.liveUrl, null);
	equal(ghOnly.hasLinks, true);

	// Live Demo only
	const demoOnly = resolveProject({ name: 'Client Web App', description: '', role: '', technologies: [], highlights: [], liveUrl: 'https://clientapp.com' });
	equal(demoOnly.repositoryUrl, null);
	equal(demoOnly.liveUrl, 'https://clientapp.com');
	equal(demoOnly.hasLinks, true);

	// Both
	const both = resolveProject({ name: 'Full SaaS', description: '', role: '', technologies: [], highlights: [], repositoryUrl: 'https://github.com/dev/saas', liveUrl: 'https://saas.io' });
	equal(both.repositoryUrl, 'https://github.com/dev/saas');
	equal(both.liveUrl, 'https://saas.io');
	equal(both.hasLinks, true);
});

test('15. Media resilience gracefully handles missing media, single image, and multiple images with captions', () => {
	// Missing media
	const noMedia = resolveProject({ name: 'CLI Tool', description: '', role: '', technologies: [], highlights: [] });
	equal(noMedia.hasMedia, false);
	equal(noMedia.media.length, 0);

	// Single image
	const singleImage = resolveProject({
		name: 'Mobile App',
		description: '',
		role: '',
		technologies: [],
		highlights: [],
		media: [{ url: 'https://example.com/app.png', alt: 'App Screenshot', caption: 'Home Screen' }],
	});
	equal(singleImage.hasMedia, true);
	equal(singleImage.media.length, 1);
	equal(singleImage.media[0].caption, 'Home Screen');

	// Multiple images
	const multiImages = resolveProject({
		name: 'Design System',
		description: '',
		role: '',
		technologies: [],
		highlights: [],
		media: [
			{ url: 'https://example.com/shot1.png', alt: 'Shot 1' },
			{ url: 'https://example.com/shot2.png', alt: 'Shot 2', caption: 'Tokens Grid' },
			{ url: 'https://example.com/shot3.png', alt: 'Shot 3' },
		],
	});
	equal(multiImages.hasMedia, true);
	equal(multiImages.media.length, 3);
	equal(multiImages.media[1].caption, 'Tokens Grid');
});


