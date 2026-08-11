import type { PortfolioRecord, PortfolioStatus } from './portfolio-manager-types';

/** Filter status for the My Portfolios page: 'all' or a real portfolio status. */
export type PortfolioFilterStatus = 'all' | PortfolioStatus;

/**
 * Pure, non-mutating filter over the portfolio store records. `query` matches
 * the portfolio title case-insensitively after trimming whitespace; an empty
 * query matches everything. `status` of `'all'` matches every status.
 */
export function filterPortfolios(
	records: readonly PortfolioRecord[],
	query: string,
	status: PortfolioFilterStatus
): PortfolioRecord[] {
	const normalizedQuery = query.trim().toLowerCase();

	return records.filter((record) => {
		const matchesStatus = status === 'all' || record.status === status;
		const matchesQuery =
			normalizedQuery === '' || record.title.trim().toLowerCase().includes(normalizedQuery);
		return matchesStatus && matchesQuery;
	});
}

/** Pluralization-aware result count label. */
export function portfolioCountLabel(count: number): string {
	return count === 1 ? '1 portfolio' : `${count} portfolios`;
}

/** True when the given value is a supported filter status. */
export function isPortfolioFilterStatus(value: unknown): value is PortfolioFilterStatus {
	return value === 'all' || value === 'draft' || value === 'published';
}