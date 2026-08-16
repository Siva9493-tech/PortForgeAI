/**
 * builder-ui.ts — Shared Portfolio Builder UI primitives
 * ------------------------------------------------------
 * Single source of class strings for controls and panels used across the 11
 * builder sections. Centralizing them keeps every section visually consistent
 * and gives the Day-12 workspace upgrades one place to evolve the pattern.
 *
 * All classes are composed from the existing design tokens (theme.css) and
 * the `.card` / `.card-hover` components (components.css) — nothing new here.
 * Tailwind v4 scans these literals from source, so they are emitted normally.
 */

/** Default field control (input / select / textarea). */
export const builderInputClass =
	'w-full rounded-md border border-hairline bg-surface-2 px-md py-sm text-body text-ink transition-colors duration-200 placeholder:text-ink-tertiary focus:border-primary-focus';

/** Grouped inner panel for repeatable entries and info blocks inside a section card. */
export const builderPanelClass =
	'flex flex-col gap-md rounded-md border border-hairline bg-surface-2 p-md';

/** Upload / connect target — dashed border, used by resume + imports. */
export const builderDropzoneClass =
	'flex flex-col items-center gap-sm rounded-md border border-dashed border-hairline-strong bg-surface-2 px-lg py-xl text-center transition-colors duration-200 hover:bg-surface-3 focus-within:border-primary-focus focus-within:bg-surface-2';

/** Primary CTA — reserved for the few decisive actions in the builder. */
export const builderButtonPrimary =
	'inline-flex items-center justify-center gap-xs rounded-md bg-primary px-md py-sm text-button font-medium text-on-primary transition-colors duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

/** Secondary action — the default builder action button. */
export const builderButtonSecondary =
	'inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-ink transition-colors duration-200 hover:bg-surface-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

/** Destructive action (remove / delete). */
export const builderButtonDanger =
	'inline-flex items-center justify-center gap-xs rounded-md border border-hairline bg-surface-1 px-md py-sm text-button font-medium text-semantic-danger transition-colors duration-200 hover:bg-surface-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
