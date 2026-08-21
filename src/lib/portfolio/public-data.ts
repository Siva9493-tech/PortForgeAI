import type { PortfolioOutput, PortfolioSocial } from '../ai';
import type { ProfilePhotoData } from './types';

/** Every social platform the saved data model supports, plus Email. */
export type PublicSocialKind =
	| 'linkedin'
	| 'github'
	| 'email'
	| 'website'
	| 'twitter'
	| 'instagram'
	| 'youtube'
	| 'other';

/** A single professional identity link shown on the public portfolio. */
export interface PublicIdentityLink {
	label: string;
	href: string;
	kind: PublicSocialKind;
}

/** A content-aware visitor call-to-action resolved for the public Hero. */
export interface PublicCta {
	/** Visible button label. */
	label: string;
	/** Real destination — `#projects`, a `mailto:` target, or a resume URL. */
	href: string;
	/** Visual emphasis: exactly one primary, the rest secondary. */
	variant: 'primary' | 'secondary';
	/** Existing analytics click type to attach, or null when none applies. */
	analytics: 'contact_click' | 'resume_click' | null;
	/** Small inline icon to render, or null. */
	icon: 'arrow' | 'download' | null;
}

/** Fully resolved Hero content, derived only from the saved portfolio output. */
export interface PublicHeroData {
	/** The person's name (from the SEO title's name part). */
	name: string;
	/** The professional headline / role (from the SEO title's role part). */
	headline: string;
	/** Short profile summary (from the SEO description). */
	introduction: string;
	/** Professional location from builder extras (empty when absent). */
	location: string;
	/** Keywords derived from skills. */
	keywords: string[];
	/** Saved profile photo, or null when absent. */
	photo: ProfilePhotoData | null;
	/** Whether a Projects section will exist (drives the primary CTA). */
	hasProjects: boolean;
	/** Best available contact destination, or null when nothing exists. */
	contactHref: string | null;
	/** Content-aware call-to-action buttons, ordered primary → secondary. */
	ctas: PublicCta[];
	/** Primary professional identity links that actually exist in the saved data. */
	links: PublicIdentityLink[];
}

/** Fully resolved Introduction/About content, derived only from the saved output. */
export interface PublicAboutData {
	/** Full About Me text preserved via builder extras (empty when absent). */
	introduction: string;
}

function splitSeoTitle(seoTitle: string): { name: string; headline: string } {
	if (!seoTitle || seoTitle === 'Portfolio') {
		return { name: '', headline: '' };
	}
	const [candidateName, ...roleParts] = seoTitle.split(' — ');
	return { name: candidateName, headline: roleParts.join(' — ') };
}

/** The four primary professional identity platforms shown in the Hero row. */
const PRIMARY_KINDS: ReadonlySet<PublicSocialKind> = new Set([
	'linkedin',
	'github',
	'email',
	'website',
]);

const SOCIAL_FIELDS: ReadonlyArray<{
	key: keyof PortfolioSocial;
	kind: PublicSocialKind;
	label: string;
}> = [
	{ key: 'linkedin', kind: 'linkedin', label: 'LinkedIn' },
	{ key: 'github', kind: 'github', label: 'GitHub' },
	{ key: 'website', kind: 'website', label: 'Website' },
	{ key: 'twitter', kind: 'twitter', label: 'Twitter' },
	{ key: 'instagram', kind: 'instagram', label: 'Instagram' },
	{ key: 'youtube', kind: 'youtube', label: 'YouTube' },
	{ key: 'other', kind: 'other', label: 'Other' },
];

/** True when a link is safe to render as an anchor href. */
function isSafeHref(value: string): boolean {
	return /^https?:\/\//i.test(value) || value.startsWith('mailto:');
}

/**
 * Resolves every legitimate professional identity link from a single
 * `PortfolioOutput`. This is the ONE interpretation of the saved social data —
 * every renderer (Hero row, "Find Me Online" section, Contact section, and
 * both the SSR and live-preview pipelines) reads from this function, so a
 * portfolio can never show a link another renderer would hide. Empty and
 * whitespace-only values are ignored, only http(s)/mailto hrefs are kept, and
 * Email is always a single `mailto:` target (never `mailto:mailto:`).
 */
export function resolveIdentityLinks(output: PortfolioOutput): PublicIdentityLink[] {
	const links: PublicIdentityLink[] = [];
	const social = output.social;

	const push = (raw: string | undefined, kind: PublicSocialKind, label: string): void => {
		const href = (raw ?? '').trim();
		if (href && isSafeHref(href)) {
			links.push({ label, href, kind });
		}
	};

	push(social?.linkedin, 'linkedin', 'LinkedIn');
	push(social?.github, 'github', 'GitHub');

	const email = (output.builder?.email ?? '').trim();
	if (email) {
		const href = email.startsWith('mailto:') ? email : `mailto:${email}`;
		if (href !== 'mailto:') {
			links.push({ label: 'Email', href, kind: 'email' });
		}
	}

	for (const field of SOCIAL_FIELDS) {
		if (field.kind === 'linkedin' || field.kind === 'github') {
			continue;
		}
		push(social?.[field.key], field.kind, field.label);
	}

	return links;
}

/** A single destination in the public section navigation. */
export interface PublicSectionNavItem {
	/** Stable anchor id of the target section (`#${id}`). */
	id: string;
	/** Short, visitor-facing link label. */
	label: string;
}

/** Page order of the navigable content sections. Hero and the social strip are excluded. */
const SECTION_NAV_ORDER: ReadonlyArray<{ id: string; label: string }> = [
	{ id: 'about', label: 'About' },
	{ id: 'projects', label: 'Projects' },
	{ id: 'experience', label: 'Experience' },
	{ id: 'education', label: 'Education' },
	{ id: 'skills', label: 'Skills' },
	{ id: 'certifications', label: 'Certifications' },
	{ id: 'achievements', label: 'Achievements' },
	{ id: 'contact', label: 'Contact' },
];

/**
 * Resolves the visitor-facing section navigation from a single
 * `PortfolioOutput`. The visibility rules mirror each renderer's own guard
 * conditions exactly, so a navigation item only ever appears when the section
 * it points to is actually rendered. No item is ever emitted for a section
 * that does not exist, so there are no dead anchors and no navigation to empty
 * sections. The Hero is the entry point (not a destination) and the social
 * strip is a compact utility directly above Contact, so neither is listed.
 */
export function resolveSectionNav(output: PortfolioOutput): PublicSectionNavItem[] {
	const items: PublicSectionNavItem[] = [];

	const hasAny = (value: unknown[] | undefined): boolean => (value?.length ?? 0) > 0;
	const hasAbout = (output.builder?.about ?? '')
		.split(/\n+/)
		.some((paragraph) => paragraph.trim() !== '');
	const hasContact =
		Boolean(output.resume) ||
		resolveIdentityLinks(output).some(
			(link) => link.kind === 'linkedin' || link.kind === 'github' || link.kind === 'email',
		);

	for (const { id, label } of SECTION_NAV_ORDER) {
		let present = false;
		switch (id) {
			case 'about':
				present = hasAbout;
				break;
			case 'projects':
				present = hasAny(output.projects);
				break;
			case 'experience':
				present = hasAny(output.experience);
				break;
			case 'education':
				present = hasAny(output.education);
				break;
			case 'skills':
				present = hasAny(output.skills);
				break;
			case 'certifications':
				present = hasAny(output.certifications);
				break;
			case 'achievements':
				present = hasAny(output.achievements);
				break;
			case 'contact':
				present = hasContact;
				break;
		}
		if (present) {
			items.push({ id, label });
		}
	}

	return items;
}

/** True when a resume file URL is safe to expose as a public action. */
function isSafeResumeHref(value: string): boolean {
	return value !== '' && value !== '#' && !/^javascript:/i.test(value);
}

/**
 * Fully resolved public footer content, derived only from the saved output.
 * Reuses the existing identity, section-nav and contact resolvers so the
 * footer can never show a name, link, section or destination that another
 * renderer would hide.
 */
export interface PublicFooterData {
	/** The person's name (empty when the saved portfolio has none). */
	name: string;
	/** The professional headline (empty when absent). */
	headline: string;
	/** Navigation items for sections that actually render. */
	nav: PublicSectionNavItem[];
	/** Every validated professional identity link. */
	links: PublicIdentityLink[];
	/** Best available contact destination, or null. */
	contactHref: string | null;
	/** Validated resume file URL, or null. */
	resumeHref: string | null;
}

/** Resolves the public portfolio footer from a single `PortfolioOutput`. */
export function resolveFooter(output: PortfolioOutput): PublicFooterData {
	const hero = resolveHero(output);
	const resumeHref = (output.resume?.fileUrl ?? '').trim();
	return {
		name: hero.name,
		headline: hero.headline,
		nav: resolveSectionNav(output),
		links: resolveIdentityLinks(output),
		contactHref: hero.contactHref,
		resumeHref: isSafeResumeHref(resumeHref) ? resumeHref : null,
	};
}

/**
 * Resolves everything the public Hero renders from a single `PortfolioOutput`.
 * Shared by the SSR component and the client-side live preview so both render
 * the exact same content from the exact same data. Never fabricates values —
 * name/headline/introduction come from the saved SEO data, links and contact
 * only appear when the saved portfolio actually contains them.
 */
export function resolveHero(output: PortfolioOutput): PublicHeroData {
	const { name, headline } = splitSeoTitle(output.seo?.title ?? '');
	const links = resolveIdentityLinks(output).filter((link) => PRIMARY_KINDS.has(link.kind));

	const contactHref =
		links.find((link) => link.kind === 'email')?.href ??
		links.find((link) => link.kind === 'linkedin')?.href ??
		links.find((link) => link.kind === 'github')?.href ??
		links.find((link) => link.kind === 'website')?.href ??
		null;

	const hasProjects = (output.projects?.length ?? 0) > 0;

	// Content-aware CTA set. Every destination is real and only appears when
	// the saved portfolio actually supports it; the first entry is promoted to
	// primary so the single most valuable action always carries the emphasis.
	const ctas: PublicCta[] = [];
	if (hasProjects) {
		ctas.push({ label: 'View My Work', href: '#projects', variant: 'primary', analytics: null, icon: 'arrow' });
	}
	if (contactHref) {
		ctas.push({
			label: 'Get in Touch',
			href: contactHref,
			variant: 'secondary',
			analytics: 'contact_click',
			icon: null,
		});
	}
	const resumeHref = (output.resume?.fileUrl ?? '').trim();
	if (isSafeResumeHref(resumeHref)) {
		ctas.push({
			label: 'Download Resume',
			href: resumeHref,
			variant: 'secondary',
			analytics: 'resume_click',
			icon: 'download',
		});
	}
	if (ctas.length > 0) {
		ctas[0].variant = 'primary';
	}

	return {
		name,
		headline,
		introduction: output.seo?.description ?? '',
		location: (output.builder?.location ?? '').trim(),
		keywords: (output.seo?.keywords ?? []).filter((keyword) => keyword.trim() !== ''),
		photo: output.builder?.profilePhoto ?? null,
		hasProjects,
		contactHref,
		ctas,
		links,
	};
}

/**
 * Resolves the public Introduction/About section from a single
 * `PortfolioOutput`. Uses the full About Me text preserved in builder extras
 * (the SEO description in the Hero is a truncated teaser). Location lives in
 * the Hero identity, so the section never repeats Hero content and never
 * shows an empty location label. Deliberately does NOT fall back to the
 * Hero's SEO description so the section never repeats the Hero intro verbatim.
 */
export function resolveAbout(output: PortfolioOutput): PublicAboutData {
	return {
		introduction: (output.builder?.about ?? '').trim(),
	};
}