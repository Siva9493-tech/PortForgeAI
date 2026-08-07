const FOCUS_OFFSET = 16;

/**
 * Detects whether the user has requested reduced motion.
 */
export function prefersReducedMotion(): boolean {
	return (
		typeof window !== 'undefined' &&
		window.matchMedia('(prefers-reduced-motion: reduce)').matches
	);
}

/**
 * Returns the first visible (non-hidden) wizard step section within the container.
 */
export function getActiveSection(container: ParentNode): HTMLElement | null {
	const sections = container.querySelectorAll<HTMLElement>('[data-step-section-id]');
	for (const section of sections) {
		if (!section.hidden) return section;
	}
	return null;
}

/**
 * Determines the scrollable element that hosts the wizard workspace.
 */
export function getScrollContainer(): HTMLElement | null {
	return (
		document.querySelector<HTMLElement>('#portfolio-builder-main') ??
		((document.scrollingElement ?? document.documentElement) as HTMLElement)
	);
}

function isFullyVisible(el: HTMLElement, scroller: HTMLElement): boolean {
	const rect = el.getBoundingClientRect();
	const viewport = scroller.getBoundingClientRect();
	return (
		rect.top >= viewport.top + FOCUS_OFFSET &&
		rect.bottom <= viewport.bottom - FOCUS_OFFSET
	);
}

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], summary:not([disabled])';

/**
 * Moves focus into the active section after it is shown by focusing its first
 * interactive control. Interactive controls are natively focusable, so no
 * `tabindex` needs to be placed on non-interactive elements (per the Astro
 * audit: "Invalid tabindex on non-interactive element"). `preventScroll`
 * avoids a secondary scroll after the intentional scroll.
 */
function focusActiveSection(active: HTMLElement): void {
	const focusable = active.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
	focusable?.focus({ preventScroll: true });
}

/**
 * Scrolls the active wizard step into view (only when it is not already fully
 * visible) and moves focus into it. Reuses the shared wizard step change
 * subscription; it holds no navigation state of its own.
 */
export function scrollToActiveStep(stepContainer: ParentNode, scroller?: HTMLElement): void {
	const active = getActiveSection(stepContainer);
	if (!active) return;

	const scrollContainer = scroller ?? getScrollContainer();
	if (!scrollContainer) return;

	if (!isFullyVisible(active, scrollContainer)) {
		const rect = active.getBoundingClientRect();
		const viewport = scrollContainer.getBoundingClientRect();
		const delta = rect.top - viewport.top - FOCUS_OFFSET;
		const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
		scrollContainer.scrollTo({
			top: Math.max(0, scrollContainer.scrollTop + delta),
			behavior,
		});
	}

	focusActiveSection(active);
}