import type { PortfolioPackage } from '../publish';
import {
	checkReservedWords,
	generateDNSInstructions,
	generateSubdomain,
	generateVerificationToken,
} from './domain-utils';
import { validateDomain } from './domain-validator';
import type {
	DomainConfiguration,
	DomainSettings,
	DomainStatus,
	DomainStatusValue,
} from './domain-types';

/** Sensible defaults for domain settings before the user customizes them. */
export const DEFAULT_DOMAIN_SETTINGS: DomainSettings = {
	customDomain: '',
	redirectToApex: true,
	forceHttps: true,
	enableCDN: true,
	wwwSubdomain: 'both',
};

function isApex(domain: string): boolean {
	return (domain.match(/\./g)?.length ?? 0) === 1;
}

function hasWwwPrefix(domain: string): boolean {
	return domain.startsWith('www.');
}

/**
 * Builds a complete, provider-independent domain configuration for a publish
 * package. If no custom domain is supplied, a default subdomain is derived
 * from the package's manifest slug.
 */
export function generateDomainConfiguration(
	pkg: PortfolioPackage,
	settings: DomainSettings = DEFAULT_DOMAIN_SETTINGS
): DomainConfiguration {
	const fallback = pkg.manifest.slug || pkg.output.seo?.slug || 'portfolio';
	const candidate = settings.customDomain || generateSubdomain(fallback);

	const validation = validateDomain(candidate);
	const normalized = validation.normalizedDomain || candidate;

	const reserved = checkReservedWords(normalized);
	if (reserved.reserved) {
		validation.warnings.push(`"${reserved.word}" is a reserved name and should be avoided.`);
	}

	const records = generateDNSInstructions(normalized);
	const token = generateVerificationToken(normalized);
	const apex = isApex(normalized);
	const www = hasWwwPrefix(normalized);

	const redirect =
		settings.redirectToApex && !apex && normalized.startsWith('www.') ? normalized : null;

	return {
		domain: {
			domain: normalized,
			apex,
			www,
			verified: false,
			records,
			status: validation.valid ? ('pending' as const) : ('unconfigured' as const),
		},
		configuration: {
			primary: normalized,
			redirect,
			cdnEnabled: settings.enableCDN,
			sslStatus: 'pending',
			verificationToken: token,
			dns: records,
		},
		validation,
	};
}

/** Prepares a domain and returns a plain-language status summary. */
export function prepareDomain(
	pkg: PortfolioPackage,
	settings: DomainSettings = DEFAULT_DOMAIN_SETTINGS
): DomainStatus {
	const config = generateDomainConfiguration(pkg, settings);
	const { valid } = config.validation;
	const status: DomainStatusValue = valid ? 'configured' : 'unconfigured';
	return {
		domain: config.domain.domain,
		status,
		sslStatus: valid ? 'pending' : 'pending',
		dnsReady: valid && config.domain.records.length > 0,
		lastCheckedAt: null,
		message: valid
			? 'Domain configuration is ready for a future deployment adapter.'
			: 'Fix validation errors before configuring this domain.',
	};
}