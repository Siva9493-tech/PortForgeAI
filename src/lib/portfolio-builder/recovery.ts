import { isMeaningful } from '../portfolio/completion';
import { createEmptyPortfolioData, type PortfolioData } from '../portfolio/types';
import { wizardStore } from '../portfolio/wizard-store';
import { isThemeId, themeStore } from '../themes';

const STORAGE_KEY = 'portforge:builder-recovery:v1';
const SNAPSHOT_VERSION = 1;
const WRITE_DEBOUNCE_MS = 600;

/** Which builder session a recovery snapshot belongs to. */
export type BuilderRecoveryContext =
	| { type: 'new' }
	| { type: 'edit'; portfolioId: string };

export interface BuilderRecoverySnapshot {
	version: 1;
	context: BuilderRecoveryContext;
	savedAt: string;
	themeId?: string;
	data: PortfolioData;
}

function contextKeyFor(context: BuilderRecoveryContext): string {
	return context.type === 'edit' ? `edit:${context.portfolioId}` : 'new';
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Structural check for recovered builder data. Every section of the current
 * schema must be present with a matching container shape (lists are arrays of
 * objects, objects are plain objects, the photo field is null/string/object).
 * It deliberately does not require the exact field set: the wizard field
 * binding only reads/writes named fields, so a snapshot written against a
 * slightly older schema is still safe to apply.
 */
function isValidPortfolioData(value: unknown): value is PortfolioData {
	if (!isRecord(value)) return false;
	const empty = createEmptyPortfolioData();
	for (const key of Object.keys(empty) as (keyof PortfolioData)[]) {
		const section = value[key];
		const expected = empty[key];
		if (section === undefined) return false;
		if (Array.isArray(expected)) {
			if (!Array.isArray(section)) return false;
			if (!section.every((entry) => isRecord(entry))) return false;
		} else if (expected === null) {
			if (section !== null && typeof section !== 'string' && !isRecord(section)) return false;
		} else if (!isRecord(section)) {
			return false;
		}
	}
	return true;
}

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

function readRaw(): string | null {
	if (typeof window === 'undefined') return null;
	try {
		return window.localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

function writeRaw(payload: unknown): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
	} catch {
		// Storage may be unavailable (e.g. sandboxed) — recovery is best-effort.
	}
}

function removeRaw(): void {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.removeItem(STORAGE_KEY);
	} catch {
		// Non-fatal.
	}
}

/**
 * Builder auto-save & recovery.
 *
 * Lightweight, debounced, context-scoped temporary storage of unsaved builder
 * work so a lost refresh, tab close or crash never destroys hours of input. It
 * is explicitly NOT a portfolio store and NOT a version layer: a single slot
 * holds only the newest meaningful draft, and it is cleared the moment the
 * work is successfully saved (or explicitly discarded). It complements the
 * always-on wizard draft store (which is context-blind) by pinning the
 * snapshot to the exact builder context (`new` or `edit:<id>`) so recovery can
 * never leak one portfolio's work into another.
 */
class BuilderRecovery {
	private enabled = false;
	private context: BuilderRecoveryContext | null = null;
	private baseline: PortfolioData | null = null;
	private lastWrittenData: PortfolioData | null = null;
	private debounceTimer: number | null = null;
	private unsubscribeWizard: (() => void) | null = null;

	private readonly handlePageHide = (): void => {
		this.flush();
	};

	/**
	 * Returns the stored snapshot for `context`, or null when there is nothing
	 * recoverable. Malformed or unrecognized storage is removed; a well-formed
	 * snapshot that belongs to a different builder context is left untouched
	 * (the slot is shared, so ownership is decided by the context tag).
	 */
	readRecoveryFor(context: BuilderRecoveryContext): BuilderRecoverySnapshot | null {
		const raw = readRaw();
		if (!raw) return null;

		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			removeRaw();
			return null;
		}

		if (!isRecord(parsed) || parsed.version !== SNAPSHOT_VERSION) {
			removeRaw();
			return null;
		}

		const { context: snapshotContext, savedAt, themeId, data } = parsed;
		if (
			!isRecord(snapshotContext) ||
			contextKeyFor(snapshotContext as BuilderRecoveryContext) !== contextKeyFor(context)
		) {
			// Belongs to another builder context — keep it in place.
			return null;
		}

		if (typeof savedAt !== 'string' || !isValidPortfolioData(data)) {
			removeRaw();
			return null;
		}

		return {
			version: SNAPSHOT_VERSION,
			context,
			savedAt,
			themeId: typeof themeId === 'string' ? themeId : undefined,
			data: clone(data),
		};
	}

	/**
	 * Removes the stored snapshot, but only if it belongs to `context`. A
	 * snapshot from another context is never disturbed.
	 */
	clearRecoveryFor(context: BuilderRecoveryContext): void {
		if (this.readRecoveryFor(context)) {
			removeRaw();
		}
	}

	/**
	 * Starts recovery tracking for a builder session. `baseline` is the last
	 * persisted content (the saved record in edit mode, empty data in create
	 * mode); a snapshot is only written once the current data is meaningful and
	 * actually differs from it.
	 */
	enable(context: BuilderRecoveryContext, baseline: PortfolioData): void {
		this.destroy();

		this.enabled = true;
		this.context = context;
		this.baseline = clone(baseline);
		this.lastWrittenData = null;

		this.unsubscribeWizard = wizardStore.subscribe(() => {
			this.scheduleWrite(wizardStore.getState().data);
		});
		window.addEventListener('pagehide', this.handlePageHide);
	}

	/**
	 * Called after a successful save (or a save that had nothing to save).
	 * Cancels any pending write, clears the stored snapshot for the active
	 * context and re-baselines tracking to the just-saved data. Never call this
	 * on a failed save — the unsaved work must stay recoverable.
	 */
	markSaved(data: PortfolioData): void {
		if (this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
		if (this.context) {
			this.clearRecoveryFor(this.context);
		}
		this.baseline = clone(data);
		this.lastWrittenData = null;
	}

	/**
	 * Applies a recovered snapshot back into the wizard and theme stores (used
	 * by "Continue with recovered work"). The snapshot is deliberately NOT
	 * cleared here: until the user saves or discards, the work stays
	 * recoverable across further reloads.
	 */
	restoreSnapshot(snapshot: BuilderRecoverySnapshot): void {
		if (!this.enabled || !this.context) return;
		if (contextKeyFor(snapshot.context) !== contextKeyFor(this.context)) return;

		for (const key of Object.keys(snapshot.data) as (keyof PortfolioData)[]) {
			wizardStore.setSectionData(key, clone(snapshot.data[key]));
		}
		if (snapshot.themeId && isThemeId(snapshot.themeId)) {
			themeStore.setTheme(snapshot.themeId);
		}
		this.lastWrittenData = clone(snapshot.data);
	}

	/** Writes a pending debounced snapshot immediately (used on `pagehide`). */
	flush(): void {
		if (this.debounceTimer === null) return;
		clearTimeout(this.debounceTimer);
		this.debounceTimer = null;
		if (this.enabled && this.context) {
			this.write(wizardStore.getState().data);
		}
	}

	/** Stops tracking and unregisters the page-lifetime listeners. */
	destroy(): void {
		if (this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
			this.debounceTimer = null;
		}
		this.unsubscribeWizard?.();
		this.unsubscribeWizard = null;
		window.removeEventListener('pagehide', this.handlePageHide);
		this.enabled = false;
		this.context = null;
		this.baseline = null;
		this.lastWrittenData = null;
	}

	private scheduleWrite(data: PortfolioData): void {
		if (this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
		}
		this.debounceTimer = window.setTimeout(() => {
			this.debounceTimer = null;
			this.write(data);
		}, WRITE_DEBOUNCE_MS);
	}

	private write(data: PortfolioData): void {
		if (!this.enabled || !this.context) return;

		const serialized = JSON.stringify(data);
		if (
			!isMeaningful(data) ||
			(this.baseline && serialized === JSON.stringify(this.baseline)) ||
			(this.lastWrittenData && serialized === JSON.stringify(this.lastWrittenData))
		) {
			return;
		}

		this.lastWrittenData = clone(data);
		writeRaw({
			version: SNAPSHOT_VERSION,
			context: this.context,
			savedAt: new Date().toISOString(),
			themeId: themeStore.getTheme().id,
			data,
		});
	}
}

export const builderRecovery = new BuilderRecovery();
