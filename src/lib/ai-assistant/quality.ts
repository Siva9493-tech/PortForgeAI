import type { AssistantFeatureId } from './types';
import type { AssistantResult, AssistantResultMetadata } from './types';

/**
 * Safe, deterministic quality & safety layer for AI Assistant outputs.
 *
 * One shared layer guards every feature's result before it reaches the UI. It
 * normalizes text, redacts secret-like data, drops empty/duplicate items,
 * caps runaway output, validates result shape, and converts any internal error
 * into a safe user-facing message. It is synchronous, dependency-free, and
 * strictly read-only — it never touches portfolio data.
 */

/** Maximum number of characters a single assistant result may carry. */
export const MAX_OUTPUT_CHARS = 40_000;

/** Maximum number of suggestions (lines or blocks) a result may carry. */
export const MAX_SUGGESTION_ITEMS = 30;

/** Safe user-facing error shown instead of any internal error detail. */
export const SAFE_ERROR_MESSAGE =
	'Something went wrong while generating suggestions. Please try again.';

/** User-safe message when a successful result ends up with no usable output. */
const EMPTY_OUTPUT_MESSAGE =
	'No suggestions were generated. Please try again or add more portfolio content.';

/** Secret-like patterns redacted from any assistant output. */
const SECRET_PATTERNS: readonly RegExp[] = [
	/sk-[A-Za-z0-9_-]{16,}/g,
	/AKIA[0-9A-Z]{16}/g,
	/\bAIza[0-9A-Za-z_-]{35}\b/g,
	/\b(?:ghp|gho|github_pat)_[A-Za-z0-9_]{20,}\b/g,
	/(?:api[_-]?key|apikey|secret|access[_-]?token|refresh[_-]?token|password|bearer)\s*[:=]\s*["']?[A-Za-z0-9_\-./+=]{8,}/gi,
	/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
];

const NOISE_CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;
const ANSI_ESCAPES = /\u001b\[[0-9;]*m/g;

/**
 * Sanitizes arbitrary assistant text into user-safe, presentable content:
 * single CRLF/CR line endings, ANSI escapes and control characters removed,
 * secret-like tokens redacted, excessive blank lines collapsed, and trailing
 * whitespace trimmed per line. Line/block structure is preserved so the UI's
 * existing split logic keeps working.
 */
export function sanitizeAssistantText(text: unknown): string {
	let value = typeof text === 'string' ? text : '';
	value = value.replace(/\r\n?/g, '\n');
	value = value.replace(ANSI_ESCAPES, '');
	value = value.replace(NOISE_CONTROL_CHARS, '');
	for (const pattern of SECRET_PATTERNS) {
		value = value.replace(pattern, '[redacted]');
	}
	value = value.replace(/\n[^\S\n]*\n[^\S\n]*\n(?:[^\S\n]*\n)*/g, '\n\n');
	value = value
		.split('\n')
		.map((line) => line.replace(/\s+$/g, '').replace(/\t/g, '  '))
		.join('\n');
	return value.trim();
}

/** Case- and whitespace-insensitive key used to detect duplicate items. */
function dedupeKey(value: string): string {
	return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/** True when content uses the multi-line block format (blank-line separated). */
function usesBlockFormat(content: string): boolean {
	return content.includes('\n\n');
}

/**
 * Drops duplicate (case/whitespace-insensitive) suggestions and empty items.
 * Multi-line block features (skills, review, recommendations) are deduplicated
 * per block; single-line features (headline, bio, project descriptions) are
 * deduplicated per line and renumbered so the list stays sequential.
 */
function dedupeSuggestionItems(content: string): string {
	if (!content) {
		return '';
	}
	if (usesBlockFormat(content)) {
		const seen = new Set<string>();
		const kept: string[] = [];
		for (const block of content.split(/\n\s*\n/)) {
			const item = block.trim();
			const key = dedupeKey(item);
			if (!key || seen.has(key)) {
				continue;
			}
			seen.add(key);
			kept.push(item);
		}
		return kept.join('\n\n');
	}
	const seen = new Set<string>();
	const kept: string[] = [];
	for (const line of content.split('\n')) {
		const item = line.trim();
		const plain = item.replace(/^\d+\.\s*/, '');
		const key = dedupeKey(plain);
		if (!key || seen.has(key)) {
			continue;
		}
		seen.add(key);
		kept.push(plain);
	}
	return kept.map((item, index) => `${index + 1}. ${item}`).join('\n');
}

/**
 * Caps assistant output to reasonable limits without cutting inside an item:
 * first the total character budget, then the suggestion item count (by block
 * for block-format features, by line otherwise).
 */
export function limitAssistantOutput(content: string): string {
	let value = content;
	if (value.length > MAX_OUTPUT_CHARS) {
		value = value.slice(0, MAX_OUTPUT_CHARS);
	}
	if (usesBlockFormat(value)) {
		const blocks = value.split(/\n\s*\n/);
		if (blocks.length > MAX_SUGGESTION_ITEMS) {
			value = blocks.slice(0, MAX_SUGGESTION_ITEMS).join('\n\n');
		}
	} else {
		const lines = value.split('\n');
		if (lines.length > MAX_SUGGESTION_ITEMS) {
			value = lines.slice(0, MAX_SUGGESTION_ITEMS).join('\n');
		}
	}
	return value.trim();
}

/** Full output pass: sanitize, deduplicate, then cap. */
export function normalizeAssistantOutput(content: string): string {
	const safe = sanitizeAssistantText(content);
	return limitAssistantOutput(dedupeSuggestionItems(safe));
}

/**
 * Structural validation of an assistant result. Accepts `unknown` so the
 * layer can guard against malformed provider output at the runtime boundary.
 * Returns `true` when the result is shape-compatible with `AssistantResult`.
 */
export function validateAssistantResult(result: unknown): result is AssistantResult {
	if (result === null || result === undefined || typeof result !== 'object') {
		return false;
	}
	const candidate = result as Partial<AssistantResult>;
	if (typeof candidate.ok !== 'boolean') {
		return false;
	}
	if (typeof candidate.feature !== 'string') {
		return false;
	}
	if (typeof candidate.content !== 'string') {
		return false;
	}
	if (candidate.error !== null && typeof candidate.error !== 'string') {
		return false;
	}
	if (candidate.metadata !== null && typeof candidate.metadata !== 'object') {
		return false;
	}
	return true;
}

/** Safe failure result carrying only the user-facing error message. */
export function safeFailureResult(feature: AssistantFeatureId): AssistantResult {
	return {
		ok: false,
		feature,
		content: '',
		metadata: null,
		error: SAFE_ERROR_MESSAGE,
	};
}

/**
 * Normalizes a structurally valid result: sanitizes content, drops
 * empty/duplicate items, caps size, and turns a successful-but-empty output
 * into a safe failure instead of inventing filler content. Error messages are
 * sanitized and fall back to the safe message when empty.
 */
export function normalizeAssistantResult(result: AssistantResult): AssistantResult {
	if (!result.ok) {
		const safeError = sanitizeAssistantText(result.error);
		return {
			ok: false,
			feature: result.feature,
			content: '',
			metadata: null,
			error: safeError || SAFE_ERROR_MESSAGE,
		};
	}
	const content = normalizeAssistantOutput(result.content);
	if (!content) {
		return {
			ok: false,
			feature: result.feature,
			content: '',
			metadata: null,
			error: EMPTY_OUTPUT_MESSAGE,
		};
	}
	const metadata: AssistantResultMetadata | null =
		result.metadata && typeof result.metadata === 'object'
			? { ...result.metadata }
			: null;
	return {
		ok: true,
		feature: result.feature,
		content,
		metadata,
		error: null,
	};
}

/**
 * The shared guard for any engine/provider output. Validates the shape first —
 * malformed output becomes a safe failure rather than an unhandled breakage —
 * then normalizes. Internal details are logged only for development; the user
 * only ever sees safe messages.
 */
export function guardAssistantResult(
	result: unknown,
	feature: AssistantFeatureId
): AssistantResult {
	if (!validateAssistantResult(result)) {
		if (typeof console !== 'undefined') {
			console.error(
				`[ai-assistant] "${feature}" produced a malformed assistant result.`
			);
		}
		return safeFailureResult(feature);
	}
	return normalizeAssistantResult(result);
}