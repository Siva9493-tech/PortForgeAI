import type { TemplateId } from '../ai';

/**
 * Theme identifiers reuse the AI `TemplateId` union — the same five identities
 * (classic, modern, minimal, developer, creative) drive both prompt copy and
 * presentation, so no duplicate id space is introduced.
 */
export type ThemeId = TemplateId;

/**
 * Class-level presentation facts applied by the renderer. Keeping these as
 * existing design-token utilities (never raw colors / inline CSS) lets the
 * theme switch purely swap classes without touching markup structure.
 */
export interface ThemePresentation {
	/** Root body font utility. */
	font: string;
	/** Font applied to headings. */
	display: string;
	/** Card element classes (includes the `card` primitive). */
	card: string;
	/** Primary call-to-action button classes. */
	button: string;
	/** Secondary / ghost button classes (e.g. social links). */
	ghostButton: string;
	/** Root layout width/centering utility. */
	layout: string;
	/** Spacing between sections. */
	sectionSpacing: string;
	/** Section heading color utility. */
	heading: string;
	/** Accent color for eyebrows and decorative icons. */
	accent: string;
}

/**
 * A selectable portfolio theme. Metadata is descriptive (font pairing, spacing
 * profile, card/button/layout styles) and `presentation` carries the exact
 * utility classes the renderer applies. Only the presentation layer changes —
 * the underlying portfolio data is untouched.
 */
export interface PortfolioTheme {
	id: ThemeId;
	name: string;
	description: string;
	previewColor: string;
	fontPairing: {
		body: string;
		heading: string;
	};
	spacingProfile: 'compact' | 'balanced' | 'spacious';
	cardStyle: string;
	buttonStyle: string;
	layoutStyle: string;
	sectionSpacing: string;
	presentation: ThemePresentation;
}