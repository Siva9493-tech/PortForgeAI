import { generatePortfolioPackage, validatePortfolio } from '../publish';
import type { PortfolioPackage, PublishReadinessReport } from '../publish';
import type { PortfolioRecord } from './portfolio-manager-types';
import { portfolioManagerStore } from './portfolio-manager-store';

/** Outcome of a single explicit publish attempt for a managed portfolio. */
export interface PublishPortfolioResult {
	ok: boolean;
	/** True when the portfolio was already published and nothing changed. */
	alreadyPublished: boolean;
	record: PortfolioRecord | undefined;
	readiness: PublishReadinessReport | null;
	/** Prepared publish payload, present when the record is ready. */
	package: PortfolioPackage | null;
	/** User-readable feedback for the publish action. */
	message: string;
}

/**
 * Publishes a single managed portfolio by stable id. This is the only explicit
 * publish entry point — a portfolio is never published implicitly.
 *
 * Flow:
 *   1. Look up the record by its stable id (never title/index/position).
 *   2. Idempotency guard: an already-published portfolio returns unchanged —
 *      no new version, no timestamp bump, no re-run of the pipeline.
 *   3. Validate readiness with the existing Day-8 validator. On failure the
 *      status stays `draft` and a user-readable report is returned.
 *   4. Prepare the existing publish payload exactly once, reusing the Day-8
 *      package builder (assets + manifest). No regeneration of AI output,
 *      themes or SEO.
 *   5. Flip status to `published` through the existing store update, which
 *      preserves id/createdAt/data and sets publishedAt + updatedAt.
 */
export function publishPortfolio(id: string): PublishPortfolioResult {
	const record = portfolioManagerStore.getPortfolio(id);
	if (!record) {
		return {
			ok: false,
			alreadyPublished: false,
			record: undefined,
			readiness: null,
			package: null,
			message: 'Portfolio not found. It may have been removed.',
		};
	}

	if (record.status === 'published') {
		return {
			ok: true,
			alreadyPublished: true,
			record,
			readiness: null,
			package: null,
			message: 'This portfolio is already published.',
		};
	}

	const readiness = validatePortfolio(record.data);
	if (!readiness.ready) {
		return {
			ok: false,
			alreadyPublished: false,
			record,
			readiness,
			package: null,
			message: `Cannot publish yet. Missing: ${readiness.missing.join(', ')}.`,
		};
	}

	const pkg = generatePortfolioPackage(record.data);

	const updated = portfolioManagerStore.updatePortfolio(id, { status: 'published' });

	return {
		ok: true,
		alreadyPublished: false,
		record: updated ?? record,
		readiness,
		package: pkg,
		message: 'Portfolio published.',
	};
}