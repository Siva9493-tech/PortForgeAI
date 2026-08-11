import type { PortfolioRecord } from './portfolio-manager-types';
import { portfolioManagerStore } from './portfolio-manager-store';

/** Outcome of a single explicit restore attempt for a managed portfolio. */
export interface RestorePortfolioResult {
	ok: boolean;
	/** The updated record after a successful restore, or the untouched record. */
	record: PortfolioRecord | undefined;
	/** The version number that was restored, when a snapshot was used. */
	restoredVersion: number | null;
	/** User-readable feedback for the restore action. */
	message: string;
}

/**
 * Restores an older portfolio snapshot by creating a brand-new current version.
 * This is the only explicit restore entry point. Reuses the existing version
 * architecture — the historical snapshot is never mutated, the version count
 * advances sequentially, and the full version history is preserved.
 *
 * Flow:
 *   1. Look up the record by its stable id (never title/index/position).
 *   2. Look up the snapshot by its portfolio-scoped version number.
 *   3. Guard: only an older version may be restored — never the current one.
 *   4. The store deep-clones the snapshot, appends a new version, bumps the
 *      version number and updates the live data + updatedAt.
 */
export function restorePortfolio(id: string, versionNumber: number): RestorePortfolioResult {
	const record = portfolioManagerStore.getPortfolio(id);
	if (!record) {
		return {
			ok: false,
			record: undefined,
			restoredVersion: null,
			message: 'Portfolio not found. It may have been removed.',
		};
	}

	const snapshot = record.versions.find((version) => version.version === versionNumber);
	if (!snapshot) {
		return {
			ok: false,
			record,
			restoredVersion: null,
			message: `Version ${versionNumber} does not exist.`,
		};
	}

	if (versionNumber >= record.currentVersion) {
		return {
			ok: false,
			record,
			restoredVersion: null,
			message: 'Only an older version can be restored.',
		};
	}

	const updated = portfolioManagerStore.restorePortfolioVersion(id, versionNumber);
	if (!updated) {
		return {
			ok: false,
			record,
			restoredVersion: null,
			message: 'Could not restore the version. The portfolio may have been removed.',
		};
	}

	return {
		ok: true,
		record: updated,
		restoredVersion: versionNumber,
		message: `Version ${versionNumber} restored.`,
	};
}