import type { AnalyticsCounts, AnalyticsScores, PortfolioAnalyticsMetrics } from './analytics-types';
import { analyticsStore } from './analytics-store';
import { analyzePortfolioCompletion } from './analytics-completion';
import { evaluatePortfolioQuality } from './analytics-quality';
import { getEventsInWindow, getPortfolioClicks, getPortfolioUniqueVisitors, getPortfolioViews } from './analytics-queries';
import { getTimeWindow, type AnalyticsTimeRange } from './analytics-time';
import { portfolioManagerStore } from '../portfolio-manager';

/**
 * Analytics Summary aggregation for a single managed portfolio.
 *
 * This is the single read path the Analytics Summary Cards consume. It resolves
 * the portfolio record once, narrows that portfolio's events to the selected
 * time range ONCE at the query layer, and derives views / unique visitors /
 * clicks from the filtered set (never re-scanning all events per card). The
 * existing pure completion and quality analyzers are reused for the score
 * cards — those scores describe the portfolio's CURRENT state and are computed
 * from the live `PortfolioOutput`, independent of the analytics period; no
 * historical scores are invented.
 *
 * Scores are never shared across portfolios: every call is keyed by the stable
 * portfolio id. Returns the existing `PortfolioAnalyticsMetrics` contract, or
 * null when the portfolio does not exist. Read-only: it never mutates portfolio
 * content, lifecycle metadata, or analytics records.
 */
export function getPortfolioAnalyticsMetrics(
	portfolioId: string,
	range: AnalyticsTimeRange = 'all_time'
): PortfolioAnalyticsMetrics | null {
	const record = portfolioManagerStore.getPortfolio(portfolioId);
	if (!record) {
		return null;
	}

	const portfolioEvents = analyticsStore.getPortfolioEvents(portfolioId);
	const window = getTimeWindow(range);
	const filteredEvents = window
		? getEventsInWindow(portfolioEvents, window)
		: portfolioEvents;

	const counts: AnalyticsCounts = {
		views: getPortfolioViews(filteredEvents, portfolioId),
		uniqueVisitors: getPortfolioUniqueVisitors(filteredEvents, portfolioId),
		clicks: getPortfolioClicks(filteredEvents, portfolioId),
	};

	const completion = analyzePortfolioCompletion(record.data);
	const quality = evaluatePortfolioQuality(record.data);

	const scores: AnalyticsScores = {
		completionScore: completion.score,
		aiQualityScore: quality.score,
	};

	return {
		portfolioId,
		counts,
		scores,
	};
}
