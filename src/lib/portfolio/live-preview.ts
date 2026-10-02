import type { PortfolioOutput } from '../ai';
import { themeStore, type PortfolioTheme, type ThemePresentation } from '../themes';
import type { PortfolioData } from './types';
import {
	resolveAbout,
	resolveFooter,
	resolveHero,
	resolveIdentityLinks,
	resolveProjects,
	resolveSectionNav,
	type PublicHeroData,
	type PublicIdentityLink,
} from './public-data';
import { wizardStore } from './wizard-store';
import { generatePortfolio } from './generator';
import { initMotionEngine } from './motion-engine';

/**
 * Client-side live preview controller.
 *
 * Flow (single source of truth):
 *   wizardStore ─► generatePortfolio() ─► PortfolioOutput ─► render()
 *   themeStore  ───────────────────────────────────────────► presentation
 *
 * The renderer never reads the store directly; it always receives a freshly
 * generated `PortfolioOutput` plus the selected theme presentation. Changing
 * the theme re-applies presentation classes (swap) — it never regenerates.
 */

const PERSIST_KEY = 'portforge:wizard:v1';
const MOUNT_SELECTOR = '#live-preview-root';

let unsubscribeData: (() => void) | undefined;
let unsubscribeTheme: (() => void) | undefined;
let mounted = false;
let sectionNavObserver: IntersectionObserver | null = null;
let motionCleanup: (() => void) | null = null;
let currentPresentation: ThemePresentation = themeStore.getTheme().presentation;

/** Escapes user-provided text before it is injected into the DOM. */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function chip(label: string): string {
	return `<li class="rounded-sm border border-hairline bg-surface-2 px-xs py-xxs text-caption text-ink-subtle">${escapeHtml(label)}</li>`;
}

function link(
	href: string,
	label: string,
	className: string,
	iconSvg: string | null,
	themeKey?: keyof ThemePresentation,
	dataAttrs = ''
): string {
	const external = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
	const themeAttr = themeKey ? ` data-theme="${themeKey}"` : '';
	return `<a href="${escapeHtml(href)}"${external}${themeAttr}${dataAttrs} class="${className}">${iconSvg ? `${iconSvg}${escapeHtml(label)}` : escapeHtml(label)}</a>`;
}

function section(
	id: string,
	heading: string,
	bodyClass: string,
	bodyHtml: string,
	revealMode: 'default' | 'projects' | 'timeline' | 'compact' | 'none' = 'default'
): string {
	const sectionAttr =
		revealMode === 'projects'
			? 'data-reveal-projects'
			: revealMode === 'timeline'
				? 'data-reveal-timeline'
				: revealMode === 'none'
					? ''
					: 'data-reveal';
	const bodyAttr =
		revealMode === 'compact'
			? 'data-reveal-group="compact"'
			: revealMode === 'timeline'
				? 'data-timeline-container'
				: revealMode === 'projects' || revealMode === 'none'
					? ''
					: 'data-reveal-group';
	const sectionAttrStr = sectionAttr ? ` ${sectionAttr}` : '';
	const bodyAttrStr = bodyAttr ? ` ${bodyAttr}` : '';
	return `<section id="${id}" aria-labelledby="${id}-heading"${sectionAttrStr} class="${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<h2 id="${id}-heading" class="${currentPresentation.display} text-headline ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(heading)}</h2>
		<div class="${bodyClass}"${bodyAttrStr}>${bodyHtml}</div>
	</section>`;
}

const HERO_ICON_SVG: Record<PublicIdentityLink['kind'], string> = {
	linkedin:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
	github:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>',
	email:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
	website:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
	twitter:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>',
	instagram:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
	youtube:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>',
	other:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>',
};

const HERO_SPARKLES_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>';

const HERO_ARROW_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

const HERO_DOWNLOAD_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>';

const ABOUT_USER_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

const HERO_MAP_PIN_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>';

const BOOK_OPEN_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 text-accent transition-transform duration-fast group-hover/cs:scale-110" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>';

const CLOSE_X_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

const PROJECT_REPO_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 icon-inline transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>';

const PROJECT_GLOBE_SVG =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 icon-inline transition-transform duration-fast group-hover:scale-110" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>';

function heroHtml(output: PortfolioOutput): string {
	const hero = resolveHero(output);
	const hasPhoto = Boolean(hero.photo?.dataUrl);

	const headline = hero.headline
		? `<p data-hero-item="content" class="max-w-narrow break-words text-balance ${currentPresentation.display} text-headline font-medium ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(hero.headline)}</p>`
		: '';
	const introduction = hero.introduction
		? `<p data-hero-item="content" class="max-w-narrow text-body-lg text-ink-muted">${escapeHtml(hero.introduction)}</p>`
		: '';
	const location = hero.location
		? `<p data-hero-item="content" class="flex items-center gap-xs text-caption text-ink-subtle">${HERO_MAP_PIN_SVG}Based in ${escapeHtml(hero.location)}</p>`
		: '';
	const chips = hero.keywords.length
		? `<ul data-hero-item="content" class="flex flex-wrap gap-xs" aria-label="Portfolio keywords">${hero.keywords.map(chip).join('')}</ul>`
		: '';
	const actions = hero.ctas.length
		? `<div data-hero-item="actions" class="flex flex-wrap items-center gap-sm">${hero.ctas
				.map((cta) => {
					const external = cta.href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
					const analytics = cta.analytics ? ` data-analytics-click="${cta.analytics}"` : '';
					const icon = cta.icon === 'arrow' ? HERO_ARROW_SVG : cta.icon === 'download' ? HERO_DOWNLOAD_SVG : '';
					const cls = cta.variant === 'primary' ? currentPresentation.button : currentPresentation.ghostButton;
					const themeKey = cta.variant === 'primary' ? 'button' : 'ghostButton';
					return `<a href="${escapeHtml(cta.href)}"${external}${analytics} class="${cls}" data-theme="${themeKey}">${escapeHtml(cta.label)}${icon}</a>`;
				})
				.join('')}</div>`
		: '';
	const profileLinks = heroLinksHtml(hero);
	const photo = hasPhoto
		? `<div data-hero-item="visual" class="flex justify-center md:justify-end"><div data-parallax-hero class="size-40 overflow-hidden rounded-full border border-hairline-strong bg-surface-2 p-1 shadow-elevated md:size-52"><img src="${escapeHtml(hero.photo?.dataUrl ?? '')}" alt="${escapeHtml(hero.name ? `${hero.name} profile photo` : 'Profile photo')}" class="size-full rounded-full object-cover" /></div></div>`
		: '';

	return `<section id="hero" aria-labelledby="hero-heading" data-reveal-hero class="grid grid-cols-1 gap-lg ${hasPhoto ? 'md:grid-cols-2 md:items-center md:gap-xl' : ''} ${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<div class="flex flex-col gap-md">
			<div class="badge badge-accent self-start shadow-subtle" data-hero-item="badge">
				${HERO_SPARKLES_SVG}
				<span class="${currentPresentation.accent}" data-theme="accent">Portfolio</span>
			</div>
			<h1 id="hero-heading" data-hero-item="headline" class="type-display break-words ${currentPresentation.display} ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(hero.name || 'Portfolio')}</h1>
			${headline}
			${introduction}
			${location}
			${chips}
			${profileLinks}
			${actions}
		</div>
		${photo}
	</section>`;
}

function heroLinksHtml(hero: PublicHeroData): string {
	if (hero.links.length === 0) {
		return '';
	}
	const items = hero.links
		.map((entry) => {
			const external = entry.href.startsWith('http')
				? ' target="_blank" rel="noopener noreferrer"'
				: '';
			return `<li><a href="${escapeHtml(entry.href)}"${external} class="inline-flex items-center gap-xs py-xxs text-body-sm text-ink-muted transition-colors duration-fast hover:text-ink">${HERO_ICON_SVG[entry.kind]}${escapeHtml(entry.label)}</a></li>`;
		})
		.join('');
	return `<ul class="flex flex-wrap items-center gap-md" aria-label="Profile links">${items}</ul>`;
}

function aboutHtml(output: PortfolioOutput): string {
	const about = resolveAbout(output);
	const paragraphs = about.introduction
		.split(/\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
	if (paragraphs.length === 0) {
		return '';
	}
	const body = paragraphs
		.map(
			(paragraph, index) =>
				`<p class="${index === 0 ? 'text-body-lg text-ink font-normal text-balance leading-relaxed break-words' : 'type-body text-ink-muted leading-relaxed break-words'}">${escapeHtml(paragraph)}</p>`
		)
		.join('');
	return `<section id="about" aria-labelledby="about-heading" data-reveal-about class="grid grid-cols-1 gap-md md:grid-cols-[minmax(0,200px)_minmax(0,1fr)] lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] md:gap-xl lg:gap-xxl ${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<div data-about-col="bio" class="flex flex-col gap-xs">
			<p class="type-eyebrow">Biography</p>
			<div class="flex items-center gap-sm">
				${ABOUT_USER_SVG}
				<h2 id="about-heading" class="type-heading-section ${currentPresentation.display} ${currentPresentation.heading}" data-theme="display heading">About</h2>
			</div>
			<div class="hidden md:block w-10 h-0.5 bg-primary/40 mt-xs rounded-pill" aria-hidden="true"></div>
		</div>
		<div data-about-col="story" class="flex flex-col gap-md max-w-prose min-w-0">${body}</div>
	</section>`;
}

function projectsHtml(output: PortfolioOutput): string {
	const resolved = resolveProjects(output.projects);
	if (resolved.length === 0) {
		return '';
	}
	const cards = resolved
		.map((project, index) => {
			const isFeatured = index === 0 && resolved.length > 1;
			const cardClass = isFeatured
				? `${currentPresentation.card} card-interactive edge-highlight flex flex-col justify-between gap-md card-p-sm md:card-p-lg md:col-span-2 emphasis-featured`
				: `${currentPresentation.card} card-interactive edge-highlight flex flex-col justify-between gap-sm card-p-sm md:card-p`;
			const modalId = `modal-${escapeHtml(project.id)}`;

			const previewMedia = project.hasMedia && project.media.length > 0
				? `<div data-project-visual class="mt-xs aspect-video w-full overflow-hidden rounded-md border border-hairline-subtle bg-surface-subtle">
					<img src="${escapeHtml(project.media[0].url)}" alt="${escapeHtml(project.media[0].alt || `${project.name} preview`)}" class="h-full w-full object-cover transition-transform duration-slow hover:scale-105" loading="lazy" />
				</div>`
				: '';

			const outcomePreview = (!project.hasMedia || project.media.length === 0) && (project.caseStudy.results || project.highlights.length > 0)
				? `<div class="mt-xxs flex items-center gap-xs text-caption text-ink-subtle">
					<span class="size-1.5 rounded-full bg-accent shrink-0" aria-hidden="true"></span>
					<span class="font-medium text-ink truncate">${escapeHtml(project.caseStudy.results || project.highlights[0])}</span>
				</div>`
				: '';

			const displayedTechs = project.technologies.slice(0, 5);
			const overflowTechsCount = project.technologies.length - 5;
			const techs = project.technologies.length
				? `<ul class="flex flex-wrap gap-xs" aria-label="Technologies for ${escapeHtml(project.name)}">
					${displayedTechs.map((t) => `<li class="pill pill-sm">${escapeHtml(t)}</li>`).join('')}
					${overflowTechsCount > 0 ? `<li class="pill pill-sm text-ink-tertiary">+${overflowTechsCount}</li>` : ''}
				</ul>`
				: '';

			const projectToken = escapeHtml(project.id ?? project.name);
			const projectAttr = ` data-analytics-click="project_click" data-analytics-project="${projectToken}"`;

			const caseStudyAction = project.hasCaseStudy
				? `<button type="button" class="btn btn-sm btn-secondary group/cs" data-open-case-study="${modalId}" aria-haspopup="dialog" aria-controls="${modalId}">
					${BOOK_OPEN_SVG}
					<span>View Case Study</span>
				</button>`
				: '<span></span>';

			const links = `
				<div class="flex items-center gap-md">
					${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer"${projectAttr} class="link-action group">${PROJECT_GLOBE_SVG}<span>Live Demo</span></a>` : ''}
					${project.repositoryUrl ? `<a href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer"${projectAttr} class="link-action group">${PROJECT_REPO_SVG}<span>Code</span></a>` : ''}
				</div>
			`;

			const caseStudyBadge = project.hasCaseStudy ? '<span class="badge badge-featured">Case Study</span>' : '';
			const roleBadge = project.role ? `<span class="badge badge-neutral">${escapeHtml(project.role)}</span>` : '';

			return `<article class="${cardClass}" data-project-item="${isFeatured || resolved.length === 1 ? 'featured' : 'secondary'}" data-theme="card">
				<div class="flex flex-col gap-xs">
					<div class="flex items-start justify-between gap-xs min-w-0">
						<h3 class="${isFeatured ? 'type-heading-sub md:text-headline' : 'type-heading-sub'} ${currentPresentation.display} text-ink break-words min-w-0" data-theme="display">${escapeHtml(project.name)}</h3>
						<div class="flex items-center gap-xs shrink-0 flex-wrap justify-end">
							${isFeatured ? '<span class="badge badge-accent">Featured</span>' : ''}
							${caseStudyBadge}
							${roleBadge}
						</div>
					</div>
					${previewMedia}
					${project.description ? `<p class="type-body-sm text-ink-muted leading-relaxed break-words line-clamp-3">${escapeHtml(project.description)}</p>` : ''}
					${outcomePreview}
				</div>
				<div class="flex flex-col gap-sm pt-xs mt-auto">
					${techs}
					<div class="flex flex-wrap items-center justify-between gap-sm border-t border-hairline-subtle pt-xs">
						${caseStudyAction}
						${links}
					</div>
				</div>
			</article>`;
		})
		.join('');

	const dialogs = resolved
		.filter((p) => p.hasCaseStudy)
		.map((project) => {
			const modalId = `modal-${escapeHtml(project.id)}`;
			const titleId = `title-${escapeHtml(project.id)}`;

			const problemSection = project.caseStudy.problem
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">01 — The Problem</p>
					<p class="text-body-lg text-ink font-medium leading-relaxed max-w-prose">${escapeHtml(project.caseStudy.problem)}</p>
				</section>`
				: '';

			const whyItMatteredSection = project.caseStudy.whyItMattered
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">02 — Why It Mattered</p>
					<div class="emphasis-callout py-xs text-body text-ink-muted leading-relaxed max-w-prose">${escapeHtml(project.caseStudy.whyItMattered)}</div>
				</section>`
				: '';

			const solutionSection = project.caseStudy.solution
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">03 — The Solution</p>
					<div class="type-body text-ink leading-relaxed max-w-prose">${escapeHtml(project.caseStudy.solution)}</div>
				</section>`
				: '';

			const howItWasBuiltSection = project.caseStudy.howItWasBuilt
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">04 — Architecture & Engineering</p>
					<div class="rounded-lg border border-hairline bg-surface-2/60 p-md type-body-sm text-ink-muted leading-relaxed max-w-prose">${escapeHtml(project.caseStudy.howItWasBuilt)}</div>
				</section>`
				: '';

			const technologiesSection = project.technologies.length > 0
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">05 — Technologies & Tools</p>
					<ul class="flex flex-wrap gap-xs" aria-label="Technologies used in this case study">
						${project.technologies.map((t) => `<li class="pill pill-default font-mono text-xs">${escapeHtml(t)}</li>`).join('')}
					</ul>
				</section>`
				: '';

			const roleSection = project.caseStudy.role
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">06 — My Role & Contribution</p>
					<p class="type-body text-ink-muted max-w-prose">Contributed as <span class="font-medium text-ink">${escapeHtml(project.caseStudy.role)}</span>.</p>
				</section>`
				: '';

			const challengesSection = project.caseStudy.challenges
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-ink-subtle">07 — Key Challenges Overcome</p>
					<div class="rounded-lg border border-hairline-subtle bg-surface-subtle p-md type-body-sm text-ink-muted leading-relaxed max-w-prose">${escapeHtml(project.caseStudy.challenges)}</div>
				</section>`
				: '';

			const resultsSection = project.caseStudy.results
				? `<section class="flex flex-col gap-xs">
					<p class="type-eyebrow text-accent">08 — Verified Results & Outcomes</p>
					<div class="card-featured p-md md:p-lg flex items-start gap-md">
						<div class="icon-box-accent icon-box-sm mt-0.5 shrink-0" aria-hidden="true">${HERO_SPARKLES_SVG}</div>
						<div class="flex flex-col gap-xxs">
							<h4 class="text-body font-semibold text-ink">Impact & Verification</h4>
							<p class="type-body-sm text-ink-muted leading-relaxed">${escapeHtml(project.caseStudy.results)}</p>
						</div>
					</div>
				</section>`
				: '';

			const mediaItems = project.media.length > 0
				? `<div class="grid grid-cols-1 gap-md md:grid-cols-2">
					${project.media.map((item, mIdx) => `
						<figure class="flex flex-col gap-xxs overflow-hidden rounded-lg border border-hairline bg-surface-subtle">
							<img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.alt || `${project.name} showcase image ${mIdx + 1}`)}" class="aspect-video w-full object-cover transition-transform duration-medium hover:scale-[1.02]" loading="lazy" />
							${item.caption ? `<figcaption class="px-sm py-xs text-caption text-ink-tertiary">${escapeHtml(item.caption)}</figcaption>` : ''}
						</figure>
					`).join('')}
				</div>`
				: '';

			const videoItem = project.demoVideoUrl
				? `<div class="flex items-center gap-sm pt-xs">
					<a href="${escapeHtml(project.demoVideoUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${PROJECT_REPO_SVG}<span>Watch Video Walkthrough</span></a>
				</div>`
				: '';

			const mediaSection = ((project.hasMedia && project.media.length > 0) || project.demoVideoUrl)
				? `<section class="flex flex-col gap-md">
					<p class="type-eyebrow text-ink-subtle">09 — Visual Showcase & Media</p>
					${mediaItems}
					${videoItem}
				</section>`
				: '';

			const linksSection = (project.liveUrl || project.repositoryUrl)
				? `<section class="flex flex-col gap-sm border-t border-hairline-subtle pt-lg">
					<p class="type-eyebrow text-ink-subtle">10 — Explore & Verify</p>
					<div class="flex flex-wrap items-center gap-sm">
						${project.liveUrl ? `<a href="${escapeHtml(project.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${PROJECT_GLOBE_SVG}<span>Launch Live Application</span></a>` : ''}
						${project.repositoryUrl ? `<a href="${escapeHtml(project.repositoryUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary">${PROJECT_REPO_SVG}<span>Browse GitHub Repository</span></a>` : ''}
					</div>
				</section>`
				: '';

			return `
				<dialog id="${modalId}" class="case-study-dialog" aria-labelledby="${titleId}" aria-modal="true">
					<header class="sticky top-0 z-20 flex items-center justify-between border-b border-hairline bg-surface-1/95 px-md py-sm backdrop-blur-md md:px-lg">
						<div class="flex items-center gap-xs min-w-0">
							<span class="badge badge-accent">Case Study</span>
							<h3 id="${titleId}" class="type-heading-sub truncate text-ink">${escapeHtml(project.name)}</h3>
						</div>
						<button type="button" data-close-case-study class="btn btn-sm btn-ghost p-1.5 rounded-full text-ink-muted hover:text-ink hover:bg-surface-2" aria-label="Close ${escapeHtml(project.name)} case study">
							${CLOSE_X_SVG}
						</button>
					</header>
					<div class="flex-1 overflow-y-auto p-md md:p-xl flex flex-col gap-xl">
						<div class="flex flex-col gap-xs border-b border-hairline-subtle pb-lg">
							<div class="flex flex-wrap items-center gap-xs">
								${project.role ? `<span class="badge badge-neutral">${escapeHtml(project.role)}</span>` : ''}
								${project.technologies.length > 0 ? `<span class="type-meta text-ink-subtle">${escapeHtml(project.technologies.join(' · '))}</span>` : ''}
							</div>
							<h2 class="type-display text-ink text-balance">${escapeHtml(project.name)}</h2>
							${project.description ? `<p class="type-body-lg text-ink-muted leading-relaxed max-w-prose pt-xs">${escapeHtml(project.description)}</p>` : ''}
						</div>
						${problemSection}
						${whyItMatteredSection}
						${solutionSection}
						${howItWasBuiltSection}
						${technologiesSection}
						${roleSection}
						${challengesSection}
						${resultsSection}
						${mediaSection}
						${linksSection}
					</div>
				</dialog>
			`;
		})
		.join('');

	return section('projects', 'Projects', 'grid grid-cols-1 gap-lg md:grid-cols-2', `${cards}${dialogs}`, 'projects');
}

function experienceHtml(output: PortfolioOutput): string {
	if (output.experience.length === 0) {
		return '';
	}
	const entries = output.experience
		.map((entry) => {
			const period = entry.currentlyWorking
				? entry.startDate
					? `${escapeHtml(entry.startDate)} — Present`
					: 'Present'
				: entry.startDate && entry.endDate
					? `${escapeHtml(entry.startDate)} — ${escapeHtml(entry.endDate)}`
					: escapeHtml(entry.startDate || entry.endDate || '');
			const currentBadge = entry.currentlyWorking
				? '<span class="badge badge-accent"><span class="badge-dot" aria-hidden="true"></span>Current</span>'
				: '';
			const typeBadge = entry.employmentType
				? `<span class="badge badge-neutral">${escapeHtml(entry.employmentType)}</span>`
				: '';
			const location = entry.location
				? `<span class="type-meta text-ink-subtle">${escapeHtml(entry.location)}</span>`
				: '';

			return `<article class="group relative flex flex-col gap-xs" data-timeline-item>
				<div class="absolute -left-[calc(var(--spacing-md)+5px)] sm:-left-[calc(var(--spacing-lg)+5px)] top-1.5 size-2.5 rounded-full border border-hairline-strong bg-primary shadow-subtle transition-transform duration-fast group-hover:scale-125" data-timeline-dot aria-hidden="true"></div>
				<div class="flex flex-col gap-xxs sm:flex-row sm:items-baseline sm:justify-between sm:gap-sm min-w-0">
					<h3 class="type-heading-sub ${currentPresentation.display} text-ink break-words min-w-0" data-theme="display">${escapeHtml(entry.role)}${entry.company ? `<span class="text-ink-subtle font-normal"> · ${escapeHtml(entry.company)}</span>` : ''}</h3>
					${period ? `<span class="type-meta font-mono shrink-0 text-ink-subtle">${period}</span>` : ''}
				</div>
				<div class="flex flex-wrap items-center gap-xs">
					${currentBadge}
					${typeBadge}
					${location}
				</div>
				${entry.description ? `<p class="type-body-sm max-w-prose pt-xxs leading-relaxed text-ink-muted break-words">${escapeHtml(entry.description)}</p>` : ''}
			</article>`;
		})
		.join('');
	const progressRail = '<div class="timeline-rail-progress" aria-hidden="true" style="height: var(--timeline-progress, 0%);"></div>';
	return section('experience', 'Experience', 'relative border-l border-hairline pl-md sm:pl-lg ml-xs sm:ml-sm flex flex-col gap-lg', `${progressRail}${entries}`, 'timeline');
}

function educationHtml(output: PortfolioOutput): string {
	if (output.education.length === 0) {
		return '';
	}
	const entries = output.education
		.map((entry) => {
			const years = [entry.startYear, entry.endYear].filter(Boolean).join(' — ');
			const isNumericCgpa = entry.cgpa && !Number.isNaN(parseFloat(entry.cgpa));
			const decimals = isNumericCgpa && entry.cgpa.includes('.') ? entry.cgpa.split('.')[1].length : 0;
			const cgpa = entry.cgpa
				? `<span class="badge badge-neutral">CGPA: ${isNumericCgpa ? `<span data-counter="${parseFloat(entry.cgpa)}" data-counter-decimals="${decimals}">${escapeHtml(entry.cgpa)}</span>` : escapeHtml(entry.cgpa)}</span>`
				: '';
			const yearMeta = years ? `<span class="type-meta font-mono shrink-0 text-ink-subtle">${escapeHtml(years)}</span>` : '';

			return `<article class="flex flex-col gap-xs py-md first:pt-0 last:pb-0">
				<div class="flex flex-col gap-xxs sm:flex-row sm:items-baseline sm:justify-between sm:gap-sm min-w-0">
					<div class="min-w-0">
						<h3 class="type-heading-sub ${currentPresentation.display} text-ink break-words min-w-0" data-theme="display">${escapeHtml(entry.degree)}</h3>
						<p class="type-body-sm text-ink-muted break-words">${escapeHtml(entry.institution)}${entry.fieldOfStudy ? `<span class="text-ink-subtle"> · ${escapeHtml(entry.fieldOfStudy)}</span>` : ''}</p>
					</div>
					<div class="flex items-center gap-xs pt-xxs sm:pt-0 shrink-0">
						${cgpa}
						${yearMeta}
					</div>
				</div>
				${entry.description ? `<p class="type-body-sm max-w-prose pt-xs leading-relaxed text-ink-subtle break-words">${escapeHtml(entry.description)}</p>` : ''}
			</article>`;
		})
		.join('');
	return section('education', 'Education', 'flex flex-col divide-y divide-hairline-subtle', entries);
}

function skillsHtml(output: PortfolioOutput): string {
	if (output.skills.length === 0) {
		return '';
	}
	const cards = output.skills
		.map((skill) => {
			const items = skill.value && skill.value.includes(',')
				? skill.value.split(',').map((s) => s.trim()).filter(Boolean)
				: [skill.value.trim()];
			const content = items.length > 1
				? `<ul class="flex flex-wrap gap-xs pt-xxs" aria-label="Skills for ${escapeHtml(skill.category)}">${items.map((item) => `<li class="pill pill-default pill-interactive">${escapeHtml(item)}</li>`).join('')}</ul>`
				: `<p class="type-body-sm text-ink-muted break-words">${escapeHtml(skill.value)}</p>`;

			return `<div class="flex flex-col gap-xs rounded-lg border border-hairline-subtle bg-surface-subtle p-md transition-colors duration-fast hover:border-hairline min-w-0">
				<h3 class="type-eyebrow text-primary text-caption tracking-wider break-words">${escapeHtml(skill.category)}</h3>
				${content}
			</div>`;
		})
		.join('');
	return section('skills', 'Skills & Capabilities', 'grid grid-cols-1 gap-md md:grid-cols-2 lg:gap-lg', cards);
}

function certificationsHtml(output: PortfolioOutput): string {
	if (output.certifications.length === 0) {
		return '';
	}
	const cards = output.certifications
		.map((certification) => {
			const verifyLink = certification.credentialUrl
				? `<div class="pt-xs border-t border-hairline-subtle"><a href="${escapeHtml(certification.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="link-action group"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 icon-inline transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg><span>Verify Credential</span></a></div>`
				: '';
			return `<article class="card-subtle card-interactive flex flex-col justify-between gap-sm card-p-sm">
				<div class="flex flex-col gap-xs">
					<div class="flex items-start justify-between gap-sm min-w-0">
						<div class="flex items-center gap-xs min-w-0">
							<div class="icon-box-accent icon-box-sm shrink-0" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg></div>
							<span class="badge badge-neutral break-words">${escapeHtml(certification.issuingOrganization)}</span>
						</div>
						${certification.issueDate ? `<span class="type-meta font-mono text-ink-subtle shrink-0">${escapeHtml(certification.issueDate)}</span>` : ''}
					</div>
					<h3 class="type-heading-sub ${currentPresentation.display} text-ink break-words min-w-0" data-theme="display">${escapeHtml(certification.name)}</h3>
					${certification.credentialId ? `<p class="type-label-micro font-mono text-ink-tertiary break-all">Credential ID: ${escapeHtml(certification.credentialId)}</p>` : ''}
					${certification.description ? `<p class="type-body-sm text-ink-muted leading-relaxed break-words">${escapeHtml(certification.description)}</p>` : ''}
				</div>
				${verifyLink}
			</article>`;
		})
		.join('');
	return section('certifications', 'Certifications & Licenses', 'grid grid-cols-1 gap-md md:grid-cols-2', cards);
}

function achievementsHtml(output: PortfolioOutput): string {
	if (output.achievements.length === 0) {
		return '';
	}
	const cards = output.achievements
		.map((achievement) => {
			const learnLink = achievement.link
				? `<div class="pt-xs border-t border-hairline-subtle"><a href="${escapeHtml(achievement.link)}" target="_blank" rel="noopener noreferrer" class="link-action group"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 icon-inline transition-transform duration-fast group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg><span>Learn more</span></a></div>`
				: '';
			return `<article class="card-subtle card-interactive flex flex-col justify-between gap-sm card-p-sm">
				<div class="flex flex-col gap-xs">
					<div class="flex items-start justify-between gap-xs min-w-0">
						<div class="flex flex-wrap items-center gap-xs">
							<div class="icon-box-accent icon-box-sm shrink-0" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></div>
							${achievement.organization ? `<span class="badge badge-neutral break-words">${escapeHtml(achievement.organization)}</span>` : ''}
							${achievement.category ? `<span class="badge badge-accent break-words">${escapeHtml(achievement.category)}</span>` : ''}
						</div>
						${achievement.date ? `<span class="type-meta font-mono text-ink-subtle shrink-0">${escapeHtml(achievement.date)}</span>` : ''}
					</div>
					<h3 class="type-heading-sub ${currentPresentation.display} text-ink break-words min-w-0" data-theme="display">${escapeHtml(achievement.title)}</h3>
					${achievement.description ? `<p class="type-body-sm text-ink-muted leading-relaxed break-words">${escapeHtml(achievement.description)}</p>` : ''}
				</div>
				${learnLink}
			</article>`;
		})
		.join('');
	return section('achievements', 'Honors & Achievements', 'grid grid-cols-1 gap-md md:grid-cols-2', cards);
}

function socialLinksHtml(output: PortfolioOutput): string {
	const links = resolveIdentityLinks(output);
	if (links.length === 0) {
		return '';
	}
	const buttons = links
		.map((entry) => {
			const trackType =
				entry.kind === 'linkedin'
					? ' data-analytics-click="linkedin_click"'
					: entry.kind === 'github'
						? ' data-analytics-click="github_click"'
						: '';
			const external = entry.href.startsWith('http')
				? ' target="_blank" rel="noopener noreferrer"'
				: '';
			return `<a href="${escapeHtml(entry.href)}"${external}${trackType} class="group btn ${currentPresentation.ghostButton}" data-theme="ghostButton">${HERO_ICON_SVG[entry.kind]}<span>${escapeHtml(entry.label)}</span></a>`;
		})
		.join('');
	return section('social', 'Find Me Online', 'flex flex-wrap items-center gap-xs sm:gap-sm', buttons, 'compact');
}

function contactHtml(output: PortfolioOutput): string {
	const resume = output.resume;
	const links = resolveIdentityLinks(output);
	const actions: string[] = [];
	for (const kind of ['email', 'linkedin', 'github'] as const) {
		const entry = links.find((link) => link.kind === kind);
		if (entry) {
			const isPrimary = actions.length === 0;
			const cls = `group btn ${isPrimary ? currentPresentation.button : currentPresentation.ghostButton}`;
			const themeKey = isPrimary ? 'button' : 'ghostButton';
			actions.push(link(entry.href, entry.label, cls, HERO_ICON_SVG[entry.kind], themeKey, ' data-analytics-click="contact_click"'));
		}
	}
	if (resume?.fileUrl) {
		const isPrimary = actions.length === 0;
		const cls = `group btn ${isPrimary ? currentPresentation.button : currentPresentation.ghostButton}`;
		const themeKey = isPrimary ? 'button' : 'ghostButton';
		actions.push(link(resume.fileUrl, 'Download Resume', cls, HERO_DOWNLOAD_SVG, themeKey, ' data-analytics-click="resume_click"'));
	}
	if (actions.length === 0 && !resume) {
		return '';
	}
	const note =
		resume && !resume.fileUrl
			? `<p class="type-meta text-ink-subtle pt-xxs break-all">Resume attached: ${escapeHtml(resume.fileName || 'resume')}</p>`
			: '';

	return `<section id="contact" aria-labelledby="contact-heading" data-reveal="scale-in" class="card-elevated edge-highlight rounded-2xl card-p md:card-p-lg flex flex-col md:flex-row md:items-center md:justify-between gap-lg ${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<div class="flex flex-col gap-xs w-full md:flex-1 max-w-2xl min-w-0">
			<p class="type-eyebrow">Next Step</p>
			<div class="flex items-center gap-sm">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5 ${currentPresentation.accent}" data-theme="accent" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
				<h2 id="contact-heading" class="type-heading-section ${currentPresentation.display} ${currentPresentation.heading}" data-theme="display heading">Let's Connect</h2>
			</div>
			<p class="type-body-sm text-ink-muted leading-relaxed">Interested in collaborating or discussing opportunities? Reach out directly via the channels below.</p>
			${note}
		</div>
		<div class="flex flex-wrap items-center gap-sm md:shrink-0">${actions.join('')}</div>
	</section>`;
}

function sectionNavHtml(output: PortfolioOutput): string {
	const items = resolveSectionNav(output);
	if (items.length === 0) {
		return '';
	}
	const links = items
		.map(
			(item) =>
				`<li class="shrink-0"><a href="#${item.id}" data-section-nav="${item.id}" class="inline-flex items-center py-xs text-body-sm font-medium text-ink-muted transition-colors duration-fast hover:text-ink">${escapeHtml(item.label)}</a></li>`,
		)
		.join('');
	return `<nav aria-label="Portfolio sections" class="sticky top-0 z-40 mb-lg border-b border-hairline surface-glass shadow-subtle"><ul class="flex flex-nowrap items-center gap-x-md overflow-x-auto py-xs sm:gap-x-lg">${links}</ul></nav>`;
}

function footerHtml(output: PortfolioOutput): string {
	const footer = resolveFooter(output);
	const year = new Date().getFullYear();

	const identity = `<div class="flex flex-col gap-xs">
		<p class="type-heading-sub ${currentPresentation.display} text-ink break-words">${escapeHtml(footer.name || 'Portfolio')}</p>
		${footer.headline ? `<p class="type-body-sm text-ink-muted break-words">${escapeHtml(footer.headline)}</p>` : ''}
	</div>`;
	const nav = footer.nav.length
		? `<nav aria-label="Footer sections"><ul class="flex flex-wrap gap-x-lg gap-y-xs">${footer.nav
				.map(
					(item) =>
						`<li><a href="#${item.id}" class="link-subtle inline-flex items-center py-xxs text-body-sm font-medium">${escapeHtml(item.label)}</a></li>`,
				)
				.join('')}</ul></nav>`
		: '';
	const links = footer.links.length
		? `<ul class="flex flex-wrap gap-sm" aria-label="Contact and social links">${footer.links
				.map((link) => {
					const trackType =
						link.kind === 'linkedin'
							? ' data-analytics-click="linkedin_click"'
							: link.kind === 'github'
								? ' data-analytics-click="github_click"'
								: '';
					const external = link.href.startsWith('http')
						? ' target="_blank" rel="noopener noreferrer"'
						: '';
					return `<li><a href="${escapeHtml(link.href)}"${external}${trackType} class="link-subtle group inline-flex items-center gap-xs py-xxs text-body-sm">${HERO_ICON_SVG[link.kind]}<span>${escapeHtml(link.label)}</span></a></li>`;
				})
				.join('')}</ul>`
		: '';
	const actions =
		footer.contactHref || footer.resumeHref
			? `<div class="flex flex-wrap items-center gap-sm">${footer.contactHref
					? `<a href="${escapeHtml(footer.contactHref)}"${footer.contactHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-analytics-click="contact_click" class="btn ${currentPresentation.ghostButton}" data-theme="ghostButton">${HERO_ICON_SVG.email}<span>Get in Touch</span></a>`
					: ''}${footer.resumeHref
					? `<a href="${escapeHtml(footer.resumeHref)}"${footer.resumeHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-analytics-click="resume_click" class="btn ${currentPresentation.ghostButton}" data-theme="ghostButton">${HERO_DOWNLOAD_SVG}<span>Download Resume</span></a>`
					: ''}</div>`
			: '';
	const ownership = footer.name
		? `<p class="type-meta border-t border-hairline-subtle pt-md text-caption text-ink-subtle break-words">© ${year} ${escapeHtml(footer.name)}</p>`
		: '';

	return `<footer id="portfolio-footer" aria-label="Portfolio footer" data-reveal="fade-in" class="border-t border-hairline-subtle pt-xl">
		<div class="flex flex-col gap-lg">
			${identity}
			${nav}
			${links}
			${actions}
			${ownership}
		</div>
	</footer>`;
}

/** Builds the full preview HTML for a normalized output using the active theme. */
function buildPreviewHTML(output: PortfolioOutput): string {
	return [
		sectionNavHtml(output),
		heroHtml(output),
		aboutHtml(output),
		projectsHtml(output),
		experienceHtml(output),
		educationHtml(output),
		skillsHtml(output),
		certificationsHtml(output),
		achievementsHtml(output),
		socialLinksHtml(output),
		contactHtml(output),
		footerHtml(output),
	]
		.filter(Boolean)
		.join('\n');
}

function renderFromData(data: PortfolioData): void {
	const { portfolio } = generatePortfolio(data);
	renderOutput(portfolio);
}

function mount(): HTMLElement | null {
	if (typeof document === 'undefined') {
		return null;
	}
	return document.querySelector<HTMLElement>(MOUNT_SELECTOR);
}

function setupCaseStudyModals(root: HTMLElement): void {
	const openBtns = root.querySelectorAll<HTMLButtonElement>('[data-open-case-study]');
	openBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			const targetId = btn.getAttribute('data-open-case-study');
			if (!targetId) return;
			const dialog = root.querySelector<HTMLDialogElement>(`#${targetId}`);
			if (dialog && typeof dialog.showModal === 'function') {
				dialog.showModal();
				document.body.style.overflow = 'hidden';
			}
		});
	});

	const closeBtns = root.querySelectorAll<HTMLButtonElement>('[data-close-case-study]');
	closeBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			const dialog = btn.closest('dialog');
			if (dialog) {
				dialog.close();
				document.body.style.overflow = '';
			}
		});
	});

	const dialogs = root.querySelectorAll<HTMLDialogElement>('dialog.case-study-dialog');
	dialogs.forEach((dialog) => {
		dialog.addEventListener('close', () => {
			document.body.style.overflow = '';
		});
		dialog.addEventListener('click', (e) => {
			const rect = dialog.getBoundingClientRect();
			const isInDialog =
				rect.top <= e.clientY &&
				e.clientY <= rect.top + rect.height &&
				rect.left <= e.clientX &&
				e.clientX <= rect.left + rect.width;
			if (!isInDialog) {
				dialog.close();
				document.body.style.overflow = '';
			}
		});
	});
}

function renderOutput(output: PortfolioOutput): void {
	const root = mount();
	if (!root) {
		return;
	}
	root.innerHTML = `<main id="portfolio-preview" class="mx-auto w-full ${currentPresentation.layout} px-md py-xl md:px-xl md:py-section ${currentPresentation.font}" data-theme="layout font">${buildPreviewHTML(output)}</main>`;
	setupCaseStudyModals(root);
	setupSectionNavActive();
	setupSectionReveal();
}

/**
 * Reuses the application-wide progressive-reveal system (components.css):
 * `data-reveal` targets are hidden and revealed one-shot via IntersectionObserver.
 * The `html.js-reveal` gate means content stays fully visible without JS, with
 * reduced motion, or without IntersectionObserver — SSR content is never
 * hidden. Re-run on every render so portfolio switches never carry old reveal
 * state or observers.
 */
function setupSectionReveal(): void {
	if (motionCleanup) {
		motionCleanup();
		motionCleanup = null;
	}
	const root = mount();
	if (!root) {
		return;
	}
	motionCleanup = initMotionEngine(root);
}

/**
 * Lightweight active-section indicator for the sticky section navigation.
 * A single IntersectionObserver watches only the sections the current
 * portfolio actually renders and flips `aria-current="location"` (plus
 * text/weight classes) on the matching nav link. The SSR markup carries no
 * active state — the browser enhances it. Re-run on every render so portfolio
 * switches never leak the previous portfolio's active link.
 */
function setupSectionNavActive(): void {
	if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined') {
		return;
	}
	if (sectionNavObserver) {
		sectionNavObserver.disconnect();
		sectionNavObserver = null;
	}
	const root = mount();
	if (!root) {
		return;
	}
	const nav = root.querySelector<HTMLElement>('nav[aria-label="Portfolio sections"]');
	const links = nav
		? Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[data-section-nav]'))
		: [];
	if (links.length === 0) {
		return;
	}

	const targets: HTMLElement[] = [];
	for (const link of links) {
		const id = link.dataset.sectionNav;
		if (!id) {
			continue;
		}
		const target = document.getElementById(id);
		if (target) {
			targets.push(target);
		}
	}
	if (targets.length === 0) {
		return;
	}

	const setActive = (id: string | null): void => {
		for (const link of links) {
			const active = link.dataset.sectionNav === id;
			link.classList.toggle('text-ink-muted', !active);
			link.classList.toggle('text-ink', active);
			link.classList.toggle('font-medium', !active);
			link.classList.toggle('font-semibold', active);
			if (active) {
				link.setAttribute('aria-current', 'location');
			} else {
				link.removeAttribute('aria-current');
			}
		}
	};

	// A single observer watches all navigable sections; the band is the middle
	// of the viewport, so only the section the visitor is actually reading wins.
	sectionNavObserver = new IntersectionObserver(
		(entries) => {
			const active = entries
				.filter((entry) => entry.isIntersecting)
				.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
			setActive(active ? active.target.id : null);
		},
		{ root: null, rootMargin: '-40% 0px -50% 0px', threshold: 0 },
	);
	for (const target of targets) {
		sectionNavObserver.observe(target);
	}
	setActive(null);
}

/**
 * Applies a new theme by swapping presentation classes on already-rendered
 * elements (`[data-theme]`), which leaves the DOM structure, scroll position,
 * focus state and any static classes intact. No deep DOM rebuild.
 */
function applyTheme(theme: PortfolioTheme): void {
	const next = theme.presentation;
	if (next === currentPresentation) {
		return;
	}
	const root = mount();
	if (root) {
		for (const el of Array.from(root.querySelectorAll<HTMLElement>('[data-theme]'))) {
			const keys = el.getAttribute('data-theme');
			if (!keys) {
				continue;
			}
			for (const key of keys.split(' ')) {
				const keyName = key as keyof ThemePresentation;
				const prevClass = currentPresentation[keyName];
				const nextClass = next[keyName];
				if (!prevClass || !nextClass || prevClass === nextClass) {
					continue;
				}
				el.classList.remove(...prevClass.split(' '));
				el.classList.add(...nextClass.split(' '));
			}
		}
	}
	currentPresentation = next;
}

function readPersistedData(): PortfolioData | null {
	if (typeof localStorage === 'undefined') {
		return null;
	}
	try {
		const raw = localStorage.getItem(PERSIST_KEY);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as { data?: PortfolioData };
		return parsed.data ?? null;
	} catch {
		return null;
	}
}

function handleStorage(event: StorageEvent): void {
	if (event.key !== PERSIST_KEY) {
		return;
	}
	const data = readPersistedData();
	if (data) {
		renderFromData(data);
	}
}

function handleThemeChange(theme: PortfolioTheme): void {
	applyTheme(theme);
}

function cleanup(): void {
	if (sectionNavObserver) {
		sectionNavObserver.disconnect();
		sectionNavObserver = null;
	}
	if (motionCleanup) {
		motionCleanup();
		motionCleanup = null;
	}
	if (unsubscribeData) {
		unsubscribeData();
		unsubscribeData = undefined;
	}
	if (unsubscribeTheme) {
		unsubscribeTheme();
		unsubscribeTheme = undefined;
	}
	window.removeEventListener('storage', handleStorage);
}

/**
 * Renders an existing managed portfolio (from the portfolio manager store) as
 * a read-only preview. Unlike `initLivePreview`, it never touches the wizard
 * store, never regenerates AI output, and never transforms data again — it only
 * renders the stored `PortfolioOutput` with the active theme, and keeps the
 * theme-selection swap behavior working. Returns an unsubscribe function for
 * the theme subscription, or null when `document` is unavailable.
 */
export function startManagedPortfolioPreview(output: PortfolioOutput): (() => void) | null {
	if (typeof document === 'undefined') {
		return null;
	}
	currentPresentation = themeStore.getTheme().presentation;
	renderOutput(output);
	return themeStore.subscribe((theme) => {
		applyTheme(theme);
	});
}

/**
 * Activates the live preview. Safe to call once; guards against duplicate
 * listeners and cleans up on `pagehide` to avoid leaks.
 */
export function initLivePreview(): void {
	if (mounted || typeof document === 'undefined') {
		return;
	}
	mounted = true;
	currentPresentation = themeStore.getTheme().presentation;

	const storeData = wizardStore.getState().data;
	const persisted = readPersistedData();
	renderFromData(persisted ?? storeData);

	unsubscribeData = wizardStore.subscribe((state) => {
		renderFromData(state.data);
	});
	unsubscribeTheme = themeStore.subscribe((theme) => {
		handleThemeChange(theme);
	});
	window.addEventListener('storage', handleStorage);
	window.addEventListener('pagehide', cleanup, { once: true });
}