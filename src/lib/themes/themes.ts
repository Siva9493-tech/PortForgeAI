import type { PortfolioTheme, ThemeId } from './theme-types';

const PRIMARY_BUTTON =
	'inline-flex items-center gap-xs bg-primary px-md py-sm text-button font-medium text-on-primary transition duration-200 hover:bg-primary-hover';

const GHOST_BUTTON =
	'inline-flex items-center gap-xs border border-hairline bg-surface-2 px-md py-sm text-button font-medium text-ink transition duration-200 hover:bg-surface-3';

export const DEFAULT_THEME_ID: ThemeId = 'modern';

/**
 * The five built-in portfolio themes. These are metadata + presentation-class
 * definitions only; they describe how to style a portfolio without changing the
 * normalized portfolio data.
 */
export const THEMES: Record<ThemeId, PortfolioTheme> = {
	classic: {
		id: 'classic',
		name: 'Classic',
		description: 'A timeless, structured layout suited to corporate roles.',
		previewColor: '#828fff',
		fontPairing: { body: 'Sans-serif', heading: 'Sans-serif' },
		spacingProfile: 'spacious',
		cardStyle: 'Subtle rounded card',
		buttonStyle: 'Rounded primary',
		layoutStyle: 'Centered page column',
		sectionSpacing: 'Large section rhythm',
		presentation: {
			font: 'font-sans',
			display: 'font-sans',
			card: 'card rounded-sm',
			button: `${PRIMARY_BUTTON} rounded-md`,
			ghostButton: `${GHOST_BUTTON} rounded-md`,
layout: 'mx-auto w-full max-w-page',
			sectionSpacing: 'mb-xl md:mb-section',
			heading: 'text-ink',
			accent: 'text-primary-hover',
		},
	},
	modern: {
		id: 'modern',
		name: 'Modern',
		description: 'A contemporary, balanced layout with generous whitespace and cards.',
		previewColor: '#5e6ad2',
		fontPairing: { body: 'Inter', heading: 'Inter' },
		spacingProfile: 'balanced',
		cardStyle: 'Soft rounded card',
		buttonStyle: 'Rounded primary',
		layoutStyle: 'Centered page',
		sectionSpacing: 'Large section rhythm',
		presentation: {
			font: 'font-sans',
			display: 'font-sans',
			card: 'card rounded-xl',
			button: `${PRIMARY_BUTTON} rounded-lg`,
			ghostButton: `${GHOST_BUTTON} rounded-lg`,
layout: 'mx-auto w-full max-w-page',
			sectionSpacing: 'mb-xl md:mb-section',
			heading: 'text-ink',
			accent: 'text-primary',
		},
	},
	minimal: {
		id: 'minimal',
		name: 'Minimal',
		description: 'A sparse, typography-first layout that lets content lead.',
		previewColor: '#8a8f98',
		fontPairing: { body: 'Inter', heading: 'Inter' },
		spacingProfile: 'compact',
		cardStyle: 'Sharp, restrained card',
		buttonStyle: 'Square primary',
		layoutStyle: 'Narrow reading column',
		sectionSpacing: 'Moderate section rhythm',
		presentation: {
			font: 'font-sans',
			display: 'font-sans',
			card: 'card rounded-none',
			button: `${PRIMARY_BUTTON} rounded-none`,
			ghostButton: `${GHOST_BUTTON} rounded-none`,
layout: 'mx-auto w-full max-w-narrow',
			sectionSpacing: 'mb-md md:mb-xl',
			heading: 'text-ink',
			accent: 'text-ink',
		},
	},
	developer: {
		id: 'developer',
		name: 'Developer',
		description: 'A technical layout emphasizing projects, skills, and side work.',
		previewColor: '#f5a623',
		fontPairing: { body: 'Inter', heading: 'JetBrains Mono' },
		spacingProfile: 'balanced',
		cardStyle: 'Technical, bordered card',
		buttonStyle: 'Monospaced primary',
		layoutStyle: 'Wide technical grid',
		sectionSpacing: 'Large section rhythm',
		presentation: {
			font: 'font-sans',
			display: 'font-mono',
			card: 'card rounded-md font-mono border-hairline-strong',
			button: `${PRIMARY_BUTTON} rounded-md font-mono`,
			ghostButton: `${GHOST_BUTTON} rounded-md font-mono`,
layout: 'mx-auto w-full max-w-wide',
			sectionSpacing: 'mb-xl md:mb-section',
			heading: 'text-ink',
			accent: 'text-primary',
		},
	},
	creative: {
		id: 'creative',
		name: 'Creative',
		description: 'An expressive layout with bold accents for design and artistic roles.',
		previewColor: '#27a644',
		fontPairing: { body: 'Inter', heading: 'Inter' },
		spacingProfile: 'spacious',
		cardStyle: 'Expressive, pill-raised card',
		buttonStyle: 'Pill primary',
		layoutStyle: 'Centered page',
		sectionSpacing: 'Extra roomy rhythm',
		presentation: {
			font: 'font-sans',
			display: 'font-sans',
			card: 'card rounded-2xl border-primary-focus',
			button: `${PRIMARY_BUTTON} rounded-full`,
			ghostButton: `${GHOST_BUTTON} rounded-full`,
layout: 'mx-auto w-full max-w-page',
			sectionSpacing: 'mb-xl md:mb-xxl',
			heading: 'text-ink',
			accent: 'text-semantic-warning',
		},
	},
}
