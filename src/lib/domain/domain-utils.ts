import { generatePublishSlug } from '../publish';
import type { DNSRecord } from './domain-types';

const RESERVED_WORDS = new Set([
	'www',
	'ftp',
	'mail',
	'admin',
	'api',
	'app',
	'dev',
	'test',
	'staging',
	'dns',
	'ns1',
	'ns2',
	'ns3',
	'webmail',
	'pop',
	'imap',
	'smtp',
	'localhost',
	'cdn',
	'static',
	'assets',
	'portal',
	'dashboard',
]);

/**
 * Lowercases, trims, strips scheme, port, path, query and fragment from a
 * candidate domain. Pure and deterministic.
 */
export function normalizeDomain(input: string): string {
	let value = String(input ?? '').trim().toLowerCase();
	value = value.replace(/^[a-z][a-z0-9+.-]*:\/\//, '');
	value = value.replace(/\/[^/]*$/, '');
	const hashIndex = value.indexOf('#');
	if (hashIndex !== -1) {
		value = value.slice(0, hashIndex);
	}
	const queryIndex = value.indexOf('?');
	if (queryIndex !== -1) {
		value = value.slice(0, queryIndex);
	}
	const portMatch = value.match(/^([^:]+):\d+$/);
	if (portMatch) {
		value = portMatch[1] ?? value;
	}
	value = value.replace(/\.+$/, '').trim();
	return value;
}

/**
 * Generates a default subdomain from a portfolio name/slug. Provider-neutral;
 * `base` is the product's own host, not a deployment provider.
 */
export function generateSubdomain(prefix: string, base = 'portforge.app'): string {
	const slug = generatePublishSlug(prefix);
	return base ? `${slug}.${base}` : slug;
}

/** Returns whether the first label of a hostname is a reserved word. */
export function checkReservedWords(value: string): { reserved: boolean; word: string | null } {
	const firstLabel = normalizeDomain(value).split('.')[0] ?? '';
	if (RESERVED_WORDS.has(firstLabel)) {
		return { reserved: true, word: firstLabel };
	}
	return { reserved: false, word: null };
}

/**
 * Generates a stable placeholder verification token derived from the domain.
 * Deterministic and free of I/O.
 */
export function generateVerificationToken(domain: string): string {
	let hash = 0;
	for (let index = 0; index < domain.length; index += 1) {
		hash = (hash * 31 + domain.charCodeAt(index)) >>> 0;
	}
	return `pf-${hash.toString(16).padStart(8, '0')}`;
}

/**
 * Generates placeholder DNS instructions for a future deployment adapter.
 * Records are illustrative only — no DNS provider is contacted.
 */
export function generateDNSInstructions(domain: string): DNSRecord[] {
	const token = generateVerificationToken(domain);
	return [
		{
			type: 'A',
			host: '@',
			value: '203.0.113.10',
			ttl: 3600,
			required: true,
		},
		{
			type: 'CNAME',
			host: 'www',
			value: 'cname.deploy.example.',
			ttl: 3600,
			required: false,
		},
		{
			type: 'TXT',
			host: '_portforge',
			value: `portforge-verify=${token}`,
			ttl: 3600,
			required: true,
		},
	];
}