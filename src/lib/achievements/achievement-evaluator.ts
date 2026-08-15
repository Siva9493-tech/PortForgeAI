import type {
	AchievementContext,
	AchievementEvaluation,
	AchievementProgress,
	AchievementResult,
} from './achievement-types';
import { ACHIEVEMENT_DEFINITIONS } from './achievement-definitions';
import { ACHIEVEMENT_RULES } from './achievement-rules';

/**
 * Evaluator for the achievement system (Day-11 Task 12).
 *
 * Pure and deterministic: it walks every known definition in stable order,
 * measures it through the matching rule against ONE prepared context, and
 * derives a REAL unlock timestamp from the underlying analytics events when
 * one exists. Missing rules are treated as locked (never thrown), and progress
 * is clamped so a value can never be displayed above its threshold.
 *
 * The evaluator never mutates anything — it only reads the context.
 */

/** Builds clamped, human-readable progress for threshold achievements. */
function buildProgress(
	current: number,
	threshold: number,
	unit: string
): AchievementProgress {
	const normalized = threshold > 0 ? Math.min(current / threshold, 1) : 0;
	const remaining = Math.max(threshold - current, 0);
	const clamped = Math.min(current, threshold);
	const unitLabel = unit && threshold > 1 ? `${unit}s` : unit;
	const label = unitLabel ? `${clamped} / ${threshold} ${unitLabel}` : `${clamped} / ${threshold}`;
	return { current, threshold, normalized, remaining, label };
}

/** Evaluates every known achievement for one prepared context. */
export function evaluateAchievements(context: AchievementContext): AchievementEvaluation {
	const results: AchievementResult[] = ACHIEVEMENT_DEFINITIONS.map((definition) => {
		const rule = ACHIEVEMENT_RULES[definition.id];
		if (!rule) {
			return { definition, unlocked: false, unlockedAt: null, progress: null };
		}

		const current = rule.measure(context);
		const unlocked = current >= definition.threshold;
		const unlockedAt = unlocked ? (rule.unlockedAt?.(context) ?? null) : null;
		const progress = definition.binary
			? null
			: buildProgress(current, definition.threshold, definition.unit);

		return { definition, unlocked, unlockedAt, progress };
	});

	return {
		portfolioId: context.portfolioId,
		results,
		unlockedCount: results.filter((result) => result.unlocked).length,
		totalCount: results.length,
	};
}