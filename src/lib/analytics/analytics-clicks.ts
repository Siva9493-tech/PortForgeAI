import { analyticsStore } from './analytics-store';
import type { AnalyticsEventMetadata } from './analytics-types';
import { isAnalyticsClickType, PROJECT_METADATA_KEY } from './analytics-types';

export { PROJECT_METADATA_KEY } from './analytics-types';

/** DOM attribute tagging a trackable clickable element. */
export const CLICK_ATTRIBUTE = 'data-analytics-click';

/** DOM attribute carrying the stable project identity for `project_click` targets. */
export const PROJECT_ATTRIBUTE = 'data-analytics-project';

/** Roots that already have a delegated click listener, preventing duplicates. */
const trackedRoots = new WeakSet<HTMLElement>();

/** A live click-tracking binding; dispose when it is no longer needed. */
export interface PortfolioClickTracking {
	/** Removes the delegated listener and releases the tracking binding. */
	dispose(): void;
}

/**
 * Enables click analytics for one portfolio by attaching a single delegated
 * `click` listener to the rendered portfolio root.
 *
 * Clickables are identified by a `data-analytics-click` attribute placed on
 * the existing markup; the listener walks up from the click target to find the
 * nearest tracked element, validates its type, resolves project metadata, and
 * records one event via the shared analytics store. The visitor token from
 * Task 3 is attached so clicks share the same analytics context as views.
 *
 * Delegation keeps listener count at exactly one per tracked root and never
 * attaches a second time to the same element (`trackedRoots` guard). It also
 * preserves native behavior — the click is never intercepted, so keyboard
 * activation and normal link navigation continue to work. Returns the binding,
 * or null when `root` is missing or already tracked.
 */
export function trackPortfolioClicks(
	portfolioId: string,
	root: HTMLElement | null
): PortfolioClickTracking | null {
	if (!root || typeof document === 'undefined' || trackedRoots.has(root)) {
		return null;
	}

	trackedRoots.add(root);

	const handleClick = (event: MouseEvent): void => {
		const target = event.target;
		if (!(target instanceof Element)) {
			return;
		}
		const tracked = target.closest<HTMLElement>(`[${CLICK_ATTRIBUTE}]`);
		if (!tracked) {
			return;
		}
		const rawType = tracked.getAttribute(CLICK_ATTRIBUTE);
		if (!isAnalyticsClickType(rawType)) {
			return;
		}

		let metadata: AnalyticsEventMetadata | undefined;
		if (rawType === 'project_click') {
			const project = tracked.getAttribute(PROJECT_ATTRIBUTE);
			if (project) {
				metadata = { [PROJECT_METADATA_KEY]: project };
			}
		}

		analyticsStore.recordPortfolioClick(portfolioId, rawType, metadata);
	};

	root.addEventListener('click', handleClick);

	return {
		dispose: () => {
			root.removeEventListener('click', handleClick);
			trackedRoots.delete(root);
		},
	};
}