import type { PortfolioOutput } from '../ai';

/**
 * Lifecycle status of a managed portfolio. The union is intentionally small
 * now and extensible — future states (e.g. `'archived'`) are added here only.
 */
export type PortfolioStatus = 'draft' | 'published';

/**
 * An immutable snapshot of a portfolio's content captured at a point in time.
 * Version history will be built on top of these; the latest snapshot is the
 * portfolio's current `data`.
 */
export interface PortfolioVersion {
	/** 1-based, monotonically increasing for a given portfolio. */
	version: number;
	/** Title this version was recorded under. */
	title: string;
	/** The existing normalized AI output. No schema is duplicated here. */
	data: PortfolioOutput;
	/** ISO-8601 timestamp of when this version was recorded. */
	createdAt: string;
}

/**
 * Central identity + lifecycle record for a generated portfolio. It owns
 * identity and lifecycle metadata only — content lives in `PortfolioOutput`
 * (and its snapshot `versions`), which existing systems own.
 */
export interface PortfolioRecord {
	/** Stable, unique identity. Never derived from `title`. */
	id: string;
	title: string;
	status: PortfolioStatus;
	/** ISO-8601 timestamp. Set once and never mutated after creation. */
	createdAt: string;
	/** ISO-8601 timestamp. Bumped on every successful update. */
	updatedAt: string;
	/** ISO-8601 timestamp when the portfolio was first published; null until then. */
	publishedAt: string | null;
	/** The current snapshot number (index into `versions` minus one). */
	currentVersion: number;
	/** Full snapshot history. `versions[currentVersion - 1]` is the current data. */
	versions: PortfolioVersion[];
	/** The current normalized portfolio output (alias of the latest version). */
	data: PortfolioOutput;
}

/** Input required to create a managed portfolio. */
export interface CreatePortfolioInput {
	title: string;
	data: PortfolioOutput;
	status?: PortfolioStatus;
}

/** Fields that may be changed on an existing managed portfolio. */
export interface UpdatePortfolioInput {
	title?: string;
	data?: PortfolioOutput;
	status?: PortfolioStatus;
}
