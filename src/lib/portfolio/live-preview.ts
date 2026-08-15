import type { PortfolioOutput } from '../ai';
import { themeStore, type PortfolioTheme, type ThemePresentation } from '../themes';
import type { PortfolioData } from './types';
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
	return `<section id="${id}" aria-labelledby="${id}-heading" class="${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<h2 id="${id}-heading" class="${currentPresentation.display} text-headline ${currentPresentation.heading}" data-theme="display heading">${escapeHtml(heading)}</h2>
		<div class="${bodyClass}">${bodyHtml}</div>
	</section>`;
}

function heroHtml(output: PortfolioOutput): string {
	const title = escapeHtml(output.seo?.title ?? output.theme?.name ?? 'My Portfolio');
	const tagline = output.seo?.description ? escapeHtml(output.seo.description) : '';
	const keywords = output.seo?.keywords ?? [];
	const chips = keywords.length
		? `<ul class="flex flex-wrap gap-xs" aria-label="Portfolio keywords">${keywords.map(chip).join('')}</ul>`
		: '';
	return `<section id="hero" aria-labelledby="hero-heading" class="flex flex-col gap-lg ${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<p class="text-eyebrow ${currentPresentation.accent}" data-theme="accent">Portfolio</p>
		<h1 id="hero-heading" class="${currentPresentation.display} text-display-lg ${currentPresentation.heading}" data-theme="display heading">${title}</h1>
		${tagline ? `<p class="max-w-narrow text-body-lg text-ink-muted">${tagline}</p>` : ''}
		${chips}
	</section>`;
}

function aboutHtml(output: PortfolioOutput): string {
	const paragraphs = (output.seo?.description ?? '')
		.split(/\n+/)
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);
	if (paragraphs.length === 0) {
		return '';
	}
	const body = paragraphs
		.map((paragraph) => `<p class="max-w-narrow text-body text-ink-muted">${escapeHtml(paragraph)}</p>`)
		.join('');
	return `<section id="about" aria-labelledby="about-heading" class="${currentPresentation.sectionSpacing}" data-theme="sectionSpacing">
		<h2 id="about-heading" class="${currentPresentation.display} text-headline ${currentPresentation.heading}" data-theme="display heading">About</h2>
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
						${project.repositoryUrl ? link(project.repositoryUrl, 'Repository', 'inline-flex items-center gap-xs text-button text-primary hover:text-primary-hover', null, undefined, projectAttr) : ''}
						${project.liveUrl ? link(project.liveUrl, 'Live Demo', 'inline-flex items-center gap-xs text-button text-primary hover:text-primary-hover', null, undefined, projectAttr) : ''}
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
			${certification.credentialUrl ? link(certification.credentialUrl, 'View Credential', 'mt-xs inline-flex items-center gap-xs text-button text-primary hover:text-primary-hover', null) : ''}
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
			${achievement.link ? link(achievement.link, 'Learn more', 'mt-xs inline-flex items-center gap-xs text-primary hover:text-primary-hover', null) : ''}
		</article>`)
		.join('');
	return section('achievements', 'Achievements', 'grid grid-cols-1 gap-md md:grid-cols-2', cards);
}

function socialLinksHtml(output: PortfolioOutput): string {
	const social = output.social;
	if (!social) {
		return '';
	}
	const profiles: Array<[string, string, string | null]> = [
		['LinkedIn', social.linkedin, 'linkedin_click'],
		['GitHub', social.github, 'github_click'],
		['Website', social.website, null],
		['Twitter', social.twitter, null],
		['Instagram', social.instagram, null],
		['YouTube', social.youtube, null],
		['Other', social.other, null],
	];
	const buttons = profiles
		.filter(([, url]) => Boolean(url))
		.map(([label, url, clickType]) => {
			const trackAttr = clickType ? ` data-analytics-click="${clickType}"` : '';
			return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"${trackAttr} class="${currentPresentation.ghostButton}" data-theme="ghostButton">${escapeHtml(label)}</a>`;
		})
		.join('');
	return section('social', 'Find Me Online', 'flex flex-wrap gap-sm', buttons);
}

function contactHtml(output: PortfolioOutput): string {
	const social = output.social;
	const resume = output.resume;
	const actions: string[] = [];
	if (social?.linkedin) {
		actions.push(link(social.linkedin, 'LinkedIn', currentPresentation.button, null, 'button', ' data-analytics-click="contact_click"'));
	}
	if (social?.github) {
		actions.push(link(social.github, 'GitHub', currentPresentation.button, null, 'button', ' data-analytics-click="contact_click"'));
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

/** Builds the full preview HTML for a normalized output using the active theme. */
function buildPreviewHTML(output: PortfolioOutput): string {
	return [
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
	root.innerHTML = `<main id="portfolio-preview" class="mx-auto w-full ${currentPresentation.layout} px-md py-section md:px-xl ${currentPresentation.font}" data-theme="layout font">${buildPreviewHTML(output)}</main>`;
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