import type { PortfolioOutput } from '../ai';
import { themeStore, type PortfolioTheme, type ThemePresentation } from '../themes';
import type { PortfolioData } from './types';
import {
	resolveAbout,
	resolveFooter,
	resolveHero,
	resolveIdentityLinks,
	resolveSectionNav,
	type PublicHeroData,
	type PublicIdentityLink,
} from './public-data';
import { wizardStore } from './wizard-store';
import { generatePortfolio } from './generator';

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
let revealObserver: IntersectionObserver | null = null;
let revealFocusHandler: ((event: FocusEvent) => void) | null = null;
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
	bodyHtml: string
): string {
	return `<section id="${id}" aria-labelledby="${id}-heading" data-reveal class="${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<h2 id="${id}-heading" class="${currentPresentation.display} text-headline ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(heading)}</h2>
		<div class="${bodyClass}">${bodyHtml}</div>
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

function heroHtml(output: PortfolioOutput): string {
	const hero = resolveHero(output);
	const hasPhoto = Boolean(hero.photo?.dataUrl);

	const headline = hero.headline
		? `<p class="max-w-narrow break-words text-balance ${currentPresentation.display} text-headline font-medium ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(hero.headline)}</p>`
		: '';
	const introduction = hero.introduction
		? `<p class="max-w-narrow text-body-lg text-ink-muted">${escapeHtml(hero.introduction)}</p>`
		: '';
	const location = hero.location
		? `<p class="flex items-center gap-xs text-caption text-ink-subtle">${HERO_MAP_PIN_SVG}Based in ${escapeHtml(hero.location)}</p>`
		: '';
	const chips = hero.keywords.length
		? `<ul class="flex flex-wrap gap-xs" aria-label="Portfolio keywords">${hero.keywords.map(chip).join('')}</ul>`
		: '';
	const actions = hero.ctas.length
		? `<div class="flex flex-wrap items-center gap-sm">${hero.ctas
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
		? `<div class="flex justify-center md:justify-end"><img src="${escapeHtml(hero.photo?.dataUrl ?? '')}" alt="${escapeHtml(hero.name ? `${hero.name} profile photo` : 'Profile photo')}" class="size-40 rounded-full border border-hairline bg-surface-2 object-cover md:size-52" /></div>`
		: '';

	return `<section id="hero" aria-labelledby="hero-heading" class="grid grid-cols-1 gap-lg ${hasPhoto ? 'md:grid-cols-2 md:items-center md:gap-xl' : ''} ${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<div class="flex flex-col gap-md">
			<div class="flex items-center gap-sm">
				${HERO_SPARKLES_SVG}
				<p class="text-eyebrow ${currentPresentation.accent}" data-theme="accent">Portfolio</p>
			</div>
			<h1 id="hero-heading" class="text-balance break-words ${currentPresentation.display} text-display-lg ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(hero.name || 'Portfolio')}</h1>
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
			return `<li><a href="${escapeHtml(entry.href)}"${external} class="inline-flex items-center gap-xs py-xxs text-body-sm text-ink-muted transition-colors duration-200 hover:text-ink">${HERO_ICON_SVG[entry.kind]}${escapeHtml(entry.label)}</a></li>`;
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
		.map((paragraph) => `<p class="max-w-narrow text-body text-ink-muted">${escapeHtml(paragraph)}</p>`)
		.join('');
	return `<section id="about" aria-labelledby="about-heading" data-reveal class="grid grid-cols-1 gap-md md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-xl ${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<div class="flex flex-col gap-xs">
			<div class="flex items-center gap-sm">
				${ABOUT_USER_SVG}
				<h2 id="about-heading" class="${currentPresentation.display} text-headline ${currentPresentation.heading}" data-theme="display heading">About</h2>
			</div>
		</div>
		<div class="flex flex-col gap-md">${body}</div>
	</section>`;
}

function projectsHtml(output: PortfolioOutput): string {
	if (output.projects.length === 0) {
		return '';
	}
	const cards = output.projects
		.map((project) => {
			const highlights = project.highlights.length
				? `<ul class="flex flex-col gap-xs">${project.highlights
						.map((item) => `<li class="text-body-sm text-ink-muted">• ${escapeHtml(item)}</li>`)
						.join('')}</ul>`
				: '';
			const techs = project.technologies.length
				? `<ul class="flex flex-wrap gap-xs" aria-label="Technologies for ${escapeHtml(project.name)}">${project.technologies.map(chip).join('')}</ul>`
				: '';
			const projectToken = escapeHtml(project.id ?? project.name);
			const projectAttr = ` data-analytics-click="project_click" data-analytics-project="${projectToken}"`;
			const links =
				project.repositoryUrl || project.liveUrl
					? `<div class="mt-xs flex flex-wrap gap-sm">
						${project.repositoryUrl ? link(project.repositoryUrl, 'Repository', 'inline-flex items-center gap-xs py-xxs text-button text-primary hover:text-primary-hover', null, undefined, projectAttr) : ''}
						${project.liveUrl ? link(project.liveUrl, 'Live Demo', 'inline-flex items-center gap-xs py-xxs text-button text-primary hover:text-primary-hover', null, undefined, projectAttr) : ''}
					</div>`
					: '';
			return `<article class="${currentPresentation.card} flex flex-col gap-xs p-md" data-theme="card">
				<h3 class="text-card-title text-ink">${escapeHtml(project.name)}</h3>
				${project.role ? `<p class="text-caption text-ink-tertiary">${escapeHtml(project.role)}</p>` : ''}
				${project.description ? `<p class="text-body-sm text-ink-muted">${escapeHtml(project.description)}</p>` : ''}
				${highlights}
				${techs}
				${links}
			</article>`;
		})
		.join('');
	return section('projects', 'Projects', 'grid grid-cols-1 gap-md md:grid-cols-2', cards);
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
			const meta = [
				period ? `<span>${period}</span>` : '',
				entry.employmentType ? `<span>${escapeHtml(entry.employmentType)}</span>` : '',
				entry.location ? `<span>${escapeHtml(entry.location)}</span>` : '',
			]
				.filter(Boolean)
				.join('');
			return `<article class="${currentPresentation.card} flex flex-col gap-xs p-md" data-theme="card">
				<div class="flex flex-col gap-xxs">
					<h3 class="text-card-title text-ink">${escapeHtml(entry.role)}${entry.company ? `<span class="text-ink-subtle"> at ${escapeHtml(entry.company)}</span>` : ''}</h3>
					${meta ? `<div class="flex flex-wrap gap-sm text-caption text-ink-tertiary">${meta}</div>` : ''}
				</div>
				${entry.description ? `<p class="text-body-sm text-ink-muted">${escapeHtml(entry.description)}</p>` : ''}
			</article>`;
		})
		.join('');
	return section('experience', 'Experience', 'flex flex-col gap-md', entries);
}

function educationHtml(output: PortfolioOutput): string {
	if (output.education.length === 0) {
		return '';
	}
	const entries = output.education
		.map((entry) => {
			const years = [entry.startYear, entry.endYear].filter(Boolean).join(' — ');
			const meta = [
				years ? `<span>${escapeHtml(years)}</span>` : '',
				entry.cgpa ? `<span>CGPA: ${escapeHtml(entry.cgpa)}</span>` : '',
			]
				.filter(Boolean)
				.join('');
			return `<article class="${currentPresentation.card} flex flex-col gap-xs p-md" data-theme="card">
				<h3 class="text-card-title text-ink">${escapeHtml(entry.degree)}</h3>
				<p class="text-caption text-ink-tertiary">${escapeHtml(entry.institution)}${entry.fieldOfStudy ? ` • ${escapeHtml(entry.fieldOfStudy)}` : ''}</p>
				${meta ? `<div class="flex flex-wrap gap-sm text-caption text-ink-subtle">${meta}</div>` : ''}
				${entry.description ? `<p class="text-body-sm text-ink-muted">${escapeHtml(entry.description)}</p>` : ''}
			</article>`;
		})
		.join('');
	return section('education', 'Education', 'flex flex-col gap-md', entries);
}

function skillsHtml(output: PortfolioOutput): string {
	if (output.skills.length === 0) {
		return '';
	}
	const cards = output.skills
		.map(
			(skill) => `<div class="${currentPresentation.card} flex flex-col gap-xs p-sm" data-theme="card">
				<h3 class="text-eyebrow text-primary">${escapeHtml(skill.category)}</h3>
				<p class="text-body-sm text-ink-muted">${escapeHtml(skill.value)}</p>
			</div>`
		)
		.join('');
	return section('skills', 'Skills', 'grid grid-cols-1 gap-sm md:grid-cols-2', cards);
}

function certificationsHtml(output: PortfolioOutput): string {
	if (output.certifications.length === 0) {
		return '';
	}
	const cards = output.certifications
		.map((certification) => `<article class="${currentPresentation.card} flex flex-col gap-xs p-md" data-theme="card">
			<h3 class="text-card-title text-ink">${escapeHtml(certification.name)}</h3>
			<p class="text-caption text-ink-tertiary">${escapeHtml(certification.issuingOrganization)}${certification.issueDate ? ` • ${escapeHtml(certification.issueDate)}` : ''}</p>
			${certification.credentialId ? `<p class="text-caption text-ink-subtle">ID: ${escapeHtml(certification.credentialId)}</p>` : ''}
			${certification.description ? `<p class="text-body-sm text-ink-muted">${escapeHtml(certification.description)}</p>` : ''}
			${certification.credentialUrl ? link(certification.credentialUrl, 'View Credential', 'mt-xs inline-flex items-center gap-xs py-xxs text-button text-primary hover:text-primary-hover', null) : ''}
		</article>`)
		.join('');
	return section('certifications', 'Certifications', 'grid grid-cols-1 gap-md md:grid-cols-2', cards);
}

function achievementsHtml(output: PortfolioOutput): string {
	if (output.achievements.length === 0) {
		return '';
	}
	const cards = output.achievements
		.map((achievement) => `<article class="${currentPresentation.card} flex flex-col gap-xs p-md" data-theme="card">
			<h3 class="text-card-title text-ink">${escapeHtml(achievement.title)}</h3>
			<p class="text-caption text-ink-tertiary">${[achievement.organization, achievement.date, achievement.category].filter(Boolean).map(escapeHtml).join(' • ')}</p>
			${achievement.description ? `<p class="text-body-sm text-ink-muted">${escapeHtml(achievement.description)}</p>` : ''}
			${achievement.link ? link(achievement.link, 'Learn more', 'mt-xs inline-flex items-center gap-xs py-xxs text-primary hover:text-primary-hover', null) : ''}
		</article>`)
		.join('');
	return section('achievements', 'Achievements', 'grid grid-cols-1 gap-md md:grid-cols-2', cards);
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
			return `<a href="${escapeHtml(entry.href)}"${external}${trackType} class="${currentPresentation.ghostButton}" data-theme="ghostButton">${HERO_ICON_SVG[entry.kind]}${escapeHtml(entry.label)}</a>`;
		})
		.join('');
	return section('social', 'Find Me Online', 'flex flex-wrap gap-sm', buttons);
}

function contactHtml(output: PortfolioOutput): string {
	const resume = output.resume;
	const links = resolveIdentityLinks(output);
	const actions: string[] = [];
	for (const kind of ['linkedin', 'github', 'email'] as const) {
		const entry = links.find((link) => link.kind === kind);
		if (entry) {
			actions.push(link(entry.href, entry.label, currentPresentation.button, HERO_ICON_SVG[entry.kind], 'button', ' data-analytics-click="contact_click"'));
		}
	}
	if (resume?.fileUrl) {
		actions.push(link(resume.fileUrl, 'Download Resume', currentPresentation.button, null, 'button', ' data-analytics-click="resume_click"'));
	}
	if (actions.length === 0 && !resume) {
		return '';
	}
	const note =
		resume && !resume.fileUrl
			? `<p class="text-body-sm text-ink-muted">Resume attached: ${escapeHtml(resume.fileName || 'resume')}</p>`
			: '';
	return section('contact', 'Get in Touch', 'flex flex-wrap gap-sm', `${actions.join('')}${note}`);
}

function sectionNavHtml(output: PortfolioOutput): string {
	const items = resolveSectionNav(output);
	if (items.length === 0) {
		return '';
	}
	const links = items
		.map(
			(item) =>
				`<li class="shrink-0"><a href="#${item.id}" data-section-nav="${item.id}" class="inline-flex items-center py-xs text-body-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink">${escapeHtml(item.label)}</a></li>`,
		)
		.join('');
	return `<nav aria-label="Portfolio sections" class="sticky top-0 z-40 mb-lg border-b border-hairline surface-glass shadow-sm"><ul class="flex flex-nowrap items-center gap-x-lg overflow-x-auto py-xs">${links}</ul></nav>`;
}

function footerHtml(output: PortfolioOutput): string {
	const footer = resolveFooter(output);
	const year = new Date().getFullYear();

	const identity = `<div class="flex flex-col gap-xs">
		<p class="text-headline font-medium text-ink">${escapeHtml(footer.name || 'Portfolio')}</p>
		${footer.headline ? `<p class="text-body-sm text-ink-muted">${escapeHtml(footer.headline)}</p>` : ''}
	</div>`;
	const nav = footer.nav.length
		? `<nav aria-label="Footer sections"><ul class="flex flex-wrap gap-x-lg gap-y-xs">${footer.nav
				.map(
					(item) =>
						`<li><a href="#${item.id}" class="inline-flex items-center py-xxs text-body-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink">${escapeHtml(item.label)}</a></li>`,
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
					return `<li><a href="${escapeHtml(link.href)}"${external}${trackType} class="inline-flex items-center gap-xs py-xxs text-body-sm text-ink-muted transition-colors duration-200 hover:text-ink">${HERO_ICON_SVG[link.kind]}${escapeHtml(link.label)}</a></li>`;
				})
				.join('')}</ul>`
		: '';
	const actions =
		footer.contactHref || footer.resumeHref
			? `<div class="flex flex-wrap items-center gap-sm">${footer.contactHref
					? `<a href="${escapeHtml(footer.contactHref)}"${footer.contactHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-analytics-click="contact_click" class="${currentPresentation.ghostButton}" data-theme="ghostButton">${HERO_ICON_SVG.email}Get in Touch</a>`
					: ''}${footer.resumeHref
					? `<a href="${escapeHtml(footer.resumeHref)}"${footer.resumeHref.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''} data-analytics-click="resume_click" class="${currentPresentation.ghostButton}" data-theme="ghostButton">${HERO_DOWNLOAD_SVG}Download Resume</a>`
					: ''}</div>`
			: '';
	const ownership = footer.name
		? `<p class="text-caption text-ink-subtle">© ${year} ${escapeHtml(footer.name)}</p>`
		: '';

	return `<footer id="portfolio-footer" aria-label="Portfolio footer" class="border-t border-hairline pt-xl">
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

function renderOutput(output: PortfolioOutput): void {
	const root = mount();
	if (!root) {
		return;
	}
	root.innerHTML = `<main id="portfolio-preview" class="mx-auto w-full ${currentPresentation.layout} px-md py-xl md:px-xl md:py-section ${currentPresentation.font}" data-theme="layout font">${buildPreviewHTML(output)}</main>`;
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
	if (typeof IntersectionObserver === 'undefined' || typeof document === 'undefined') {
		return;
	}
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return;
	}
	if (revealObserver) {
		revealObserver.disconnect();
		revealObserver = null;
	}
	const root = mount();
	if (!root) {
		return;
	}
	document.documentElement.classList.add('js-reveal');
	revealObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					revealElement(entry.target as HTMLElement);
				}
			}
		},
		{ threshold: 0.08, rootMargin: '0px 0px -6% 0px' },
	);
	observeRevealTargets(root);

	// Keyboard safety: if focus lands inside an as-yet-hidden section (via Tab
	// or anchor navigation), reveal it immediately so nothing is focused while
	// invisible.
	if (!revealFocusHandler) {
		revealFocusHandler = (event) => {
			const target = event.target as HTMLElement | null;
			const revealRoot = target?.closest<HTMLElement>('[data-reveal]');
			if (revealRoot) {
				revealElement(revealRoot);
			}
		};
		document.addEventListener('focusin', revealFocusHandler, true);
	}
}

function revealElement(element: HTMLElement): void {
	if (!revealObserver) {
		return;
	}
	element.classList.add('is-revealed');
	revealObserver.unobserve(element);
}

/** Observes reveal targets in `scope`; skips already-revealed or hidden ones. */
function observeRevealTargets(scope: ParentNode): void {
	if (!revealObserver) {
		return;
	}
	for (const target of scope.querySelectorAll<HTMLElement>(
		'[data-reveal]:not(.is-revealed):not(.is-hidden)',
	)) {
		target.classList.add('is-hidden');
		revealObserver.observe(target);
	}
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
	if (revealObserver) {
		revealObserver.disconnect();
		revealObserver = null;
	}
	if (revealFocusHandler) {
		document.removeEventListener('focusin', revealFocusHandler, true);
		revealFocusHandler = null;
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