/**
 * motion-engine.ts — Scroll Reveal & Motion Engine (Day 15)
 * ---------------------------------------------------------
 * Progressive-enhancement scroll reveal system driven by a single lightweight
 * IntersectionObserver. Content remains 100% visible and functional when:
 *  - JavaScript is disabled / absent (SSR output)
 *  - prefers-reduced-motion is active
 *  - IntersectionObserver is unsupported
 *
 * Ensures 100% parity between public SSR pages and live preview.
 */

let sharedObserver: IntersectionObserver | null = null;
let timelineObserver: IntersectionObserver | null = null;
let counterObserver: IntersectionObserver | null = null;
let focusHandler: ((event: FocusEvent) => void) | null = null;
let scrollHandler: (() => void) | null = null;

export function isReducedMotion(): boolean {
	if (typeof window === 'undefined' || !window.matchMedia) {
		return false;
	}
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function revealElement(element: HTMLElement): void {
	element.classList.remove('is-hidden');
	element.classList.add('is-revealed');
	if (sharedObserver) {
		sharedObserver.unobserve(element);
	}
}

export function observeTargets(scope: ParentNode): void {
	if (!sharedObserver) {
		return;
	}

	const selector = [
		'[data-reveal]:not(.is-revealed):not(.is-hidden)',
		'[data-reveal-hero]:not(.is-revealed):not(.is-hidden)',
		'[data-reveal-about]:not(.is-revealed):not(.is-hidden)',
		'[data-reveal-projects]:not(.is-revealed):not(.is-hidden)',
		'[data-reveal-timeline]:not(.is-revealed):not(.is-hidden)',
		'[data-reveal-group]:not(.is-revealed):not(.is-hidden)',
	].join(', ');

	const targets = scope.querySelectorAll<HTMLElement>(selector);
	for (const target of targets) {
		target.classList.add('is-hidden');
		sharedObserver.observe(target);
	}
}

/** Animate real numeric metrics smoothly when scrolled into view. */
function initCounters(scope: ParentNode): void {
	const counterTargets = scope.querySelectorAll<HTMLElement>('[data-counter]:not([data-counter-done])');
	if (counterTargets.length === 0) return;

	if (isReducedMotion()) {
		for (const target of counterTargets) {
			target.setAttribute('data-counter-done', 'true');
		}
		return;
	}

	counterObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const el = entry.target as HTMLElement;
					counterObserver?.unobserve(el);
					el.setAttribute('data-counter-done', 'true');

					const raw = el.dataset.counter ?? '';
					const targetVal = parseFloat(raw);
					if (Number.isNaN(targetVal)) continue;

					const decimals = parseInt(el.dataset.counterDecimals ?? '0', 10);
					const startTime = performance.now();
					const duration = 500; // ms

					const step = (now: number) => {
						const elapsed = now - startTime;
						const progress = Math.min(1, elapsed / duration);
						// ease-out cubic: 1 - (1 - t)^3
						const eased = 1 - Math.pow(1 - progress, 3);
						const current = eased * targetVal;
						el.textContent = current.toFixed(decimals);

						if (progress < 1) {
							requestAnimationFrame(step);
						} else {
							el.textContent = targetVal.toFixed(decimals);
						}
					};

					requestAnimationFrame(step);
				}
			}
		},
		{ threshold: 0.2 }
	);

	for (const el of counterTargets) {
		counterObserver.observe(el);
	}
}

/** Coordinated subtle hero parallax depth on desktop viewports. */
function initHeroParallax(scope: ParentNode): () => void {
	if (isReducedMotion() || typeof window === 'undefined') {
		return () => {};
	}

	const parallaxHero = scope.querySelector<HTMLElement>('[data-parallax-hero]');
	if (!parallaxHero) {
		return () => {};
	}

	let ticking = false;

	const updateParallax = () => {
		if (window.innerWidth < 768) {
			parallaxHero.style.removeProperty('--parallax-hero-y');
			return;
		}
		const scrollY = window.scrollY || document.documentElement.scrollTop;
		if (scrollY > 900) {
			return;
		}
		// Maximum 12px subtle shift
		const offset = Math.min(12, Math.max(0, scrollY * 0.035));
		parallaxHero.style.setProperty('--parallax-hero-y', `${offset.toFixed(1)}px`);
	};

	scrollHandler = () => {
		if (!ticking) {
			requestAnimationFrame(() => {
				updateParallax();
				ticking = false;
			});
			ticking = true;
		}
	};

	window.addEventListener('scroll', scrollHandler, { passive: true });
	window.addEventListener('resize', scrollHandler, { passive: true });
	updateParallax();

	return () => {
		if (scrollHandler) {
			window.removeEventListener('scroll', scrollHandler);
			window.removeEventListener('resize', scrollHandler);
			scrollHandler = null;
		}
	};
}

/** Experience timeline progression coordinator using IntersectionObserver. */
function initTimelineProgress(scope: ParentNode): () => void {
	if (isReducedMotion() || typeof window === 'undefined') {
		return () => {};
	}

	const timelineContainer = scope.querySelector<HTMLElement>('[data-timeline-container]');
	if (!timelineContainer) {
		return () => {};
	}

	const items = Array.from(timelineContainer.querySelectorAll<HTMLElement>('[data-timeline-item]'));
	if (items.length === 0) {
		return () => {};
	}

	const itemIndexMap = new Map<HTMLElement, number>();
	items.forEach((item, index) => itemIndexMap.set(item, index));

	let highestPassedIndex = -1;

	timelineObserver = new IntersectionObserver(
		(entries) => {
			const viewportThreshold = window.innerHeight * 0.65;

			for (const entry of entries) {
				const idx = itemIndexMap.get(entry.target as HTMLElement);
				if (idx === undefined) continue;

				if (entry.boundingClientRect.top <= viewportThreshold) {
					if (idx > highestPassedIndex) {
						highestPassedIndex = idx;
					}
				} else if (!entry.isIntersecting && entry.boundingClientRect.top > viewportThreshold) {
					if (highestPassedIndex >= idx) {
						highestPassedIndex = idx - 1;
					}
				}
			}

			for (let i = 0; i < items.length; i++) {
				const item = items[i];
				item.classList.toggle('is-passed', i <= highestPassedIndex);
				item.classList.toggle('is-current', i === highestPassedIndex);
			}

			const progressPercent =
				highestPassedIndex >= 0
					? Math.min(100, Math.round(((highestPassedIndex + 1) / items.length) * 100))
					: 0;

			timelineContainer.style.setProperty('--timeline-progress', `${progressPercent}%`);
		},
		{
			rootMargin: '-10% 0px -30% 0px',
			threshold: [0, 0.25, 0.5, 0.75, 1],
		}
	);

	for (const item of items) {
		timelineObserver.observe(item);
	}

	return () => {
		if (timelineObserver) {
			timelineObserver.disconnect();
			timelineObserver = null;
		}
	};
}

export function initMotionEngine(scope?: ParentNode): () => void {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return () => {};
	}

	if (typeof IntersectionObserver === 'undefined' || isReducedMotion()) {
		// Progressive enhancement: do not add js-reveal class; all content stays fully visible
		return () => {};
	}

	document.documentElement.classList.add('js-reveal');

	if (sharedObserver) {
		sharedObserver.disconnect();
		sharedObserver = null;
	}

	sharedObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					revealElement(entry.target as HTMLElement);
				}
			}
		},
		{
			threshold: 0.08,
			rootMargin: '0px 0px -6% 0px',
		},
	);

	const root = scope || document;
	observeTargets(root);
	initCounters(root);
	const cleanupParallax = initHeroParallax(root);
	const cleanupTimeline = initTimelineProgress(root);

	if (!focusHandler) {
		focusHandler = (event: FocusEvent) => {
			const target = event.target as HTMLElement | null;
			const revealRoot = target?.closest<HTMLElement>(
				'[data-reveal], [data-reveal-hero], [data-reveal-about], [data-reveal-projects], [data-reveal-timeline], [data-reveal-group]',
			);
			if (revealRoot && !revealRoot.classList.contains('is-revealed')) {
				revealElement(revealRoot);
			}
		};
		document.addEventListener('focusin', focusHandler, true);
	}

	return () => {
		if (sharedObserver) {
			sharedObserver.disconnect();
			sharedObserver = null;
		}
		if (counterObserver) {
			counterObserver.disconnect();
			counterObserver = null;
		}
		cleanupParallax();
		cleanupTimeline();
	};
}
