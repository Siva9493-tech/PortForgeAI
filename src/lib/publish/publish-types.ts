import type { PortfolioOutput, PortfolioSEO, PortfolioTheme } from '../ai';

/** Overall readiness of a portfolio for publishing. */
export type PublishStatus = 'ready' | 'not-ready' | 'error';

/** Status of a single validation check. */
export type PublishCheckStatus = 'ready' | 'warning' | 'missing';

/**
 * A generic deployment target placeholder. Provider-agnostic by design — real
 * adapters (static host, CDN, serverless) will be added later.
 */
export interface DeploymentTarget {
	key: string;
	name: string;
	description: string;
	supported: boolean;
}

/** One validation item surfaced in the readiness report. */
export interface PublishCheckItem {
	label: string;
	status: PublishCheckStatus;
	detail: string;
}

/** Human/machine-readable report describing how ready a portfolio is. */
export interface PublishReadinessReport {
	ready: boolean;
	status: PublishStatus;
	items: PublishCheckItem[];
	warnings: string[];
	missing: string[];
	estimatedSizeBytes: number;
	estimatedPages: number;
}

/** Options that shape the publish package without altering portfolio data. */
export interface PublishOptions {
	slug?: string;
	name?: string;
	baseUrl?: string;
	version?: string;
	language?: string;
	target?: DeploymentTarget;
	generatedAt?: string;
}

/** A deployable asset described as metadata (no file is generated here). */
export type PublishAssetType = 'html' | 'css' | 'js' | 'json' | 'image' | 'pdf' | 'font';

export interface PublishAsset {
	id: string;
	type: PublishAssetType;
	name: string;
	path: string;
	sizeBytes: number;
}

/** Metadata describing a prepared portfolio build. */
export interface PublishManifest {
	id: string;
	slug: string;
	name: string;
	theme: string;
	generatedAt: string;
	version: string;
	language: string;
	schemaVersion: string;
	seo: {
		title: string;
		description: string;
		keywords: string[];
	};
	sections: ReadonlyArray<{ id: string; title: string; order: number }>;
	assets: PublishAsset[];
	build: {
		schemaVersion: string;
		pages: number;
		estimatedSizeBytes: number;
	};
}

/**
 * A reusable, provider-independent publish package. This is the input that
 * future deployment adapters consume — it bundles the normalized output, its
 * SEO, theme, manifest, assets and publish settings.
 */
export interface PortfolioPackage {
	output: PortfolioOutput;
	theme: PortfolioTheme | null;
	seo: PortfolioSEO | null;
	manifest: PublishManifest;
	assets: PublishAsset[];
	settings: PublishOptions;
}

/** The finalized result of a publish preparation run. */
export interface PublishResult {
	ok: boolean;
	status: PublishStatus;
	slug: string;
	readiness: PublishReadinessReport;
	manifest: PublishManifest | null;
	package: PortfolioPackage | null;
}