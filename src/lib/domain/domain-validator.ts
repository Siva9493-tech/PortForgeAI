import { normalizeDomain } from './domain-utils';
import type { DomainValidation } from './domain-types';

const MAX_DOMAIN_LENGTH = 253;
const MAX_LABEL_LENGTH = 63;

/**
 * Validates a candidate custom domain. Pure and provider-independent. Returns
 * a normalized result with collected errors and warnings.
 */
export function validateDomain(input: string): DomainValidation {
	const errors: string[] = [];
	const warnings: string[] = [];

	const raw = String(input ?? '').trim();
	if (!raw) {
		return { valid: false, normalizedDomain: '', errors: ['Domain is required.'], warnings };
	}

	const normalized = normalizeDomain(raw);
	if (!normalized) {
		errors.push('Domain is required after normalization.');
		return { valid: false, normalizedDomain: '', errors, warnings };
	}

	if (raw !== normalized && raw.includes('/')) {
		warnings.push('URL path (if any) was removed.');
	}

	if (normalized === 'localhost' || normalized.endsWith('.localhost')) {
		errors.push('"localhost" is not a valid custom domain.');
	}

	if (normalized.includes('..')) {
		errors.push('Consecutive dots are not allowed.');
	}

	if (normalized.length > MAX_DOMAIN_LENGTH) {
		errors.push('Domain exceeds 253 characters.');
	}

	if (!normalized.includes('.')) {
		warnings.push('A top-level domain is missing (e.g. .com).');
	}

	const labels = normalized.split('.');
	for (const label of labels) {
		if (label.length === 0) {
			errors.push('Domain contains an empty label.');
			continue;
		}
		if (!/^[a-z0-9-]+$/.test(label)) {
			errors.push(`Invalid characters in label "${label}".`);
		}
		if (label.startsWith('-') || label.endsWith('-')) {
			errors.push(`Label "${label}" cannot start or end with a hyphen.`);
		}
		if (label.length > MAX_LABEL_LENGTH) {
			errors.push(`Label "${label}" exceeds 63 characters.`);
		}
	}

	return { valid: errors.length === 0, normalizedDomain: normalized, errors, warnings };
}