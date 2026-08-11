/** Lifecycle state of a custom domain in the preparation layer. */
export type DomainStatusValue = 'configured' | 'pending' | 'unconfigured';

/** A single DNS record placeholder for a future deployment adapter. */
export interface DNSRecord {
	type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'NS' | 'MX';
	host: string;
	value: string;
	ttl: number;
	required: boolean;
}

/** A validated custom domain and its provider-independent DNS plan. */
export interface CustomDomain {
	domain: string;
	apex: boolean;
	www: boolean;
	verified: boolean;
	records: DNSRecord[];
	status: DomainStatusValue;
}

/** Result of validating a candidate custom domain. */
export interface DomainValidation {
	valid: boolean;
	normalizedDomain: string;
	errors: string[];
	warnings: string[];
}

/** A fully prepared domain configuration that integrates with the publish package. */
export interface DomainConfiguration {
	domain: CustomDomain;
	configuration: {
		primary: string;
		redirect: string | null;
		cdnEnabled: boolean;
		sslStatus: 'pending' | 'active';
		verificationToken: string;
		dns: DNSRecord[];
	};
	validation: DomainValidation;
}

/** A plain-language summary of where a domain currently stands. */
export interface DomainStatus {
	domain: string;
	status: DomainStatusValue;
	sslStatus: 'pending' | 'active';
	dnsReady: boolean;
	lastCheckedAt: string | null;
	message: string;
}

/** User-adjustable settings that shape the domain configuration. */
export interface DomainSettings {
	customDomain: string;
	redirectToApex: boolean;
	forceHttps: boolean;
	enableCDN: boolean;
	wwwSubdomain: 'www' | 'apex' | 'both' | 'none';
}