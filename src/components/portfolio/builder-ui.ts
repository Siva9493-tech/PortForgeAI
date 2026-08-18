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

/** Shared base for every form control — consistent height, border, radius, focus. */
const builderControlBase =
	'w-full rounded-md border border-hairline bg-surface-2 text-body text-ink transition-colors duration-200 placeholder:text-ink-tertiary hover:border-hairline-strong focus:outline-none focus:border-primary-focus focus:ring-2 focus:ring-primary-focus/30';

/** Default field control (single-line input / select). */
export const builderInputClass = `${builderControlBase} min-h-10 px-md py-sm`;

/** Single-line control with a leading icon adornment (pair with BuilderField `icon`). */
export const builderInputWithIconClass = `${builderControlBase} min-h-10 py-sm pl-10 pr-md`;

/** Multi-line textarea control — comfortable height, vertical resize only. */
export const builderTextareaClass = `${builderControlBase} min-h-24 resize-y px-md py-sm leading-relaxed`;

/** Grouped inner panel for repeatable entries and info blocks inside a section card. */
export const builderPanelClass =
	'flex flex-col gap-md rounded-md border border-hairline bg-surface-2 p-md';

/** Field-group heading inside a section card (h3) — keeps the heading ladder. */
export const builderGroupLabelClass = 'text-subhead font-medium text-ink';

/** Contextual info block ("Why upload…", "What will be imported…"). */
export const builderInfoBlockClass =
	'flex flex-col gap-xs rounded-md border border-hairline bg-surface-2 p-md';

/** Contextual suggestion callout (Task 12) — subtle, distinct from errors. */
export const builderSuggestionClass =
	'flex min-w-0 items-start justify-between gap-sm rounded-md border border-primary/20 bg-surface-1 px-md py-sm';

/** Icon-only subtle button inside a suggestion row (dismiss). */
export const builderSuggestionDismissClass =
	'inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-tertiary transition-colors duration-200 hover:bg-surface-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1';

/** Empty-state block for a repeated section that has no entries yet. */
export const builderEmptyStateClass =
	'flex flex-col items-center gap-md rounded-md border border-dashed border-hairline-strong bg-surface-2 px-lg py-xl text-center';

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
