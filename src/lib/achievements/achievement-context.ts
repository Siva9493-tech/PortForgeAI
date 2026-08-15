import type { AchievementContext } from './achievement-types';
import { analyticsStore, getPortfolioAnalyticsMetrics } from '../analytics';
import { portfolioManagerStore } from '../portfolio-manager';

/**
 * Context builder for the achievement system (Day-11 Task 12).
 *
 * Prepares ONE read-only `AchievementContext` snapshot for a single stable
 * portfolio id so the evaluator measures every achievement against a
 * consistent view without issuing per-achievement queries. Every value comes
 * from the EXISTING data layer:
 *
 *   - the portfolio record + creation timestamp from the portfolio manager;
 *   - completion / quality scores from the existing `getPortfolioAnalyticsMetrics`;
 *   - counts (views, unique visitors, clicks) from the same aggregation;
 *   - export interactions counted directly from the portfolio-scoped events;
 *   - the portfolio-scoped analytics event log for honest unlock timestamps.
 *
 * Nothing here is fabricated: there are no seeded events, no sample portfolios,
 * and no invented scores. Read-only — the context never mutates any store.
 */
export function buildAchievementContext(portfolioId: string): AchievementContext | null {
	const record = portfolioManagerStore.getPortfolio(portfolioId);
	if (!record) {
		return null;
	}

	const events = analyticsStore.getPortfolioEvents(portfolioId);
	const metrics = getPortfolioAnalyticsMetrics(portfolioId, 'all_time');

	const exportClicks = events.filter((event) => event.eventType === 'export_click').length;

	return {
		portfolioId,
		record,
		createdAt: record.createdAt,
		events,
		counts: {
			views: metrics?.counts.views ?? 0,
			uniqueVisitors: metrics?.counts.uniqueVisitors ?? 0,
			clicks: metrics?.counts.clicks ?? 0,
			exportClicks,
		},
		completionScore: metrics?.scores.completionScore ?? 0,
		qualityScore: metrics?.scores.aiQualityScore ?? 0,
	};
}