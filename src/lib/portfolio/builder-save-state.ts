import type { PortfolioData } from './types';

/**
 * User-facing save lifecycle for the Portfolio Builder.
 *
 * - `idle`     — nothing to save yet (fresh builder, nothing entered).
 * - `unsaved`  — the wizard data differs from the last-saved snapshot.
 * - `saving`   — a save/update is running.
 * - `saved`    — the current data matches the last-saved snapshot.
 * - `error`    — the last save/update failed; the data is still unsaved.
 */
export type BuilderSaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

/** Read-only view of the tracker used by the UI to render save state. */
export interface BuilderSaveSnapshot {
	status: BuilderSaveStatus;
	dirty: boolean;
	message: string | null;
}

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * Structural equality for builder wizard data. Wizard data is plain
 * JSON-serializable content, so a JSON comparison is a dependable deep
 * equality check (same strategy as the existing portfolio store).
 */
export function portfolioDataEquals(a: PortfolioData, b: PortfolioData): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Small shared save-state tracker for the Portfolio Builder.
 *
 * It deliberately is NOT a persistence layer and NOT a second store: it only
 * remembers the last-saved snapshot (the baseline) so the UI can distinguish
 * "saved", "unsaved changes", "saving", "saved successfully" and "save failed".
 * The existing PortfolioManagerStore remains the single source of truth for
 * saving, identity and version history.
 */
export class BuilderSaveTracker {
	private baseline: PortfolioData;
	private current: PortfolioData;
	private savedOnce: boolean;
	private status: BuilderSaveStatus;
	private message: string | null;

	constructor(baseline: PortfolioData, initialStatus: BuilderSaveStatus = 'idle') {
		this.baseline = clone(baseline);
		this.current = clone(baseline);
		this.savedOnce = initialStatus === 'saved';
		this.status = initialStatus;
		this.message = null;
	}

	/**
	 * Call whenever the wizard data changes. Recomputes whether the current
	 * data differs from the last-saved baseline and settles the status into
	 * `unsaved` / `saved` / `idle`. `saving` and `error` states are preserved
	 * until an explicit `beginSave` / `completeSave` / `fail` call.
	 */
	sync(current: PortfolioData): void {
		this.current = clone(current);
		const dirty = !portfolioDataEquals(this.baseline, this.current);

		if (dirty) {
			if (this.status === 'idle' || this.status === 'saved') {
				this.status = 'unsaved';
				this.message = null;
			}
		} else if (this.status === 'unsaved' || this.status === 'error') {
			// The user reverted to the exact saved content (or recovered from a
			// failure) — there is nothing left to save.
			this.status = this.savedOnce ? 'saved' : 'idle';
			this.message = null;
		}
	}

	beginSave(): void {
		this.status = 'saving';
		this.message = null;
	}

	completeSave(current: PortfolioData, message: string): void {
		this.baseline = clone(current);
		this.current = clone(current);
		this.savedOnce = true;
		this.status = 'saved';
		this.message = message;
	}

	fail(message: string): void {
		this.status = 'error';
		this.message = message;
	}

	/** Transient informational note (e.g. "No changes to save."). */
	note(message: string): void {
		this.message = message;
	}

	getSnapshot(): Readonly<BuilderSaveSnapshot> {
		return {
			status: this.status,
			dirty: !portfolioDataEquals(this.baseline, this.current),
			message: this.message,
		};
	}
}
