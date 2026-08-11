import { THEMES } from './themes';
import type { PortfolioTheme, ThemeId, ThemePresentation } from './theme-types';

/** Type guard for a theme id. */
export function isThemeId(value: string): value is ThemeId {
	return value in THEMES;
}

/** Resolves a theme by id (falls back to the first available theme). */
export function getThemeById(id: ThemeId): PortfolioTheme {
	return THEMES[id] ?? THEMES[Object.keys(THEMES)[0] as ThemeId];
}

/** Returns the class-level presentation for a theme. */
export function getThemePresentation(theme: PortfolioTheme): ThemePresentation {
	return theme.presentation;
}

/**
 * A token-based swatch class for the theme selector. Returns an existing
 * design-token utility (never raw hex), so no inline colors are introduced.
 */
export function previewSwatchClass(themeId: ThemeId): string {
	const swatches: Record<ThemeId, string> = {
		classic: 'bg-primary-hover',
		modern: 'bg-primary',
		minimal: 'bg-ink-subtle',
		developer: 'bg-semantic-warning',
		creative: 'bg-semantic-success',
	};
	return swatches[themeId];
}