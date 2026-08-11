import { THEMES, DEFAULT_THEME_ID } from './themes';
import { isThemeId } from './theme-utils';
import type { PortfolioTheme, ThemeId } from './theme-types';

export type ThemeListener = (theme: PortfolioTheme) => void;

/** Session-scoped key so the active theme survives a Preview refresh. */
const SESSION_KEY = 'portforge:theme:v1';

/** Reads a persisted theme id (session only). Returns null when unavailable. */
function readSessionThemeId(): ThemeId | null {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return null;
	}
	try {
		const raw = sessionStorage.getItem(SESSION_KEY);
		if (!raw) {
			return null;
		}
		const parsed = JSON.parse(raw) as { id?: unknown };
		return typeof parsed.id === 'string' && isThemeId(parsed.id) ? parsed.id : null;
	} catch {
		return null;
	}
}

/** Persists the active theme id for the current browsing session. */
function writeSessionThemeId(id: ThemeId): void {
	if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
		return;
	}
	try {
		sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id }));
	} catch {
		// storage may be unavailable (e.g. sandboxed) — non-fatal
	}
}

/**
 * The theme store is the single source of truth for the active theme. It is
 * safe to construct in any environment (SSR/build leaves it at the default);
 * in a browser it restores the session's theme from `sessionStorage`.
 */
class ThemeStoreImpl {
	private current: PortfolioTheme = THEMES[readSessionThemeId() ?? DEFAULT_THEME_ID];
	private readonly listeners = new Set<ThemeListener>();

	getTheme(): Readonly<PortfolioTheme> {
		return this.current;
	}

	setTheme(id: ThemeId): void {
		const next = THEMES[id];
		if (!next || next === this.current) {
			return;
		}
		this.current = next;
		this.persist();
		this.notify();
	}

	subscribe(listener: ThemeListener): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	/** Removes a previously registered theme listener. */
	unsubscribe(listener: ThemeListener): void {
		this.listeners.delete(listener);
	}

	resetTheme(): void {
		if (this.current === THEMES[DEFAULT_THEME_ID]) {
			return;
		}
		this.current = THEMES[DEFAULT_THEME_ID];
		this.persist();
		this.notify();
	}

	getAvailableThemes(): readonly PortfolioTheme[] {
		return Object.values(THEMES);
	}

	private persist(): void {
		writeSessionThemeId(this.current.id);
	}

	private notify(): void {
		for (const listener of this.listeners) {
			listener(this.current);
		}
	}
}

export const themeStore = new ThemeStoreImpl();