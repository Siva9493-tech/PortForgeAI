import type { PortfolioOutput } from '../ai';
import { generatePortfolioPackage } from '../publish';
import type { PortfolioPackage } from '../publish';
import type { PortfolioRecord } from './portfolio-manager-types';
import { portfolioManagerStore } from './portfolio-manager-store';

/**
 * Export formats exposed by the existing application. The set intentionally
 * mirrors `PortfolioExport.astro` — no new formats are invented here.
 */
export type PortfolioExportFormat = 'html' | 'pdf' | 'json';

/** True when a value is a supported export format. */
export function isPortfolioExportFormat(value: unknown): value is PortfolioExportFormat {
	return value === 'html' || value === 'pdf' || value === 'json';
}

/**
 * One selectable export option. `supported` is the single source of truth for
 * whether the existing implementation can actually produce a file for this
 * format. Formats that are UI-only preserve that limitation explicitly rather
 * than pretending a file is generated.
 */
export interface PortfolioExportOption {
	format: PortfolioExportFormat;
	title: string;
	description: string;
	supported: boolean;
	/** User-readable note shown when `supported` is false. */
	unavailableNote: string;
}

/** The existing, application-wide export options in their display order. */
export const PORTFOLIO_EXPORT_OPTIONS: readonly PortfolioExportOption[] = [
	{
		format: 'html',
		title: 'Static HTML Export',
		description: 'Generate a standalone HTML portfolio.',
		supported: false,
		unavailableNote: 'Static HTML export is not implemented yet.',
	},
	{
		format: 'pdf',
		title: 'PDF Resume Export',
		description: 'Create a printable PDF version.',
		supported: false,
		unavailableNote: 'PDF export is not implemented yet.',
	},
	{
		format: 'json',
		title: 'JSON Portfolio Data',
		description: 'Export your structured portfolio information.',
		supported: true,
		unavailableNote: '',
	},
];

/**
 * A prepared export bundle for a single portfolio. Reuses the existing Day-8
 * publish pipeline (`generatePortfolioPackage`) to assemble the package from
 * the normalized output — no AI call, no regeneration of themes or SEO.
 */
export interface PortfolioExportBundle {
	/** The current version's normalized portfolio data. */
	output: PortfolioOutput;
	/** The existing publish package (manifest, assets, theme, SEO). */
	package: PortfolioPackage;
	/** Serialized portfolio data ready to save as a file. */
	json: string;
	/** Suggested download file name. */
	fileName: string;
}

export interface PreparePortfolioExportResult {
	ok: boolean;
	record: PortfolioRecord | undefined;
	bundle: PortfolioExportBundle | null;
	message: string;
}

/**
 * Prepares an export for the CURRENT version of a single managed portfolio by
 * stable id. Read-only with respect to lifecycle: status, version history and
 * the record itself are never mutated.
 */
export function preparePortfolioExport(id: string): PreparePortfolioExportResult {
	const record = portfolioManagerStore.getPortfolio(id);
	if (!record) {
		return {
			ok: false,
			record: undefined,
			bundle: null,
			message: 'Portfolio not found. It may have been removed.',
		};
	}

	const pkg = generatePortfolioPackage(record.data);
	const json = JSON.stringify(record.data, null, 2);

	return {
		ok: true,
		record,
		bundle: {
			output: record.data,
			package: pkg,
			json,
			fileName: exportFileName(record.title, 'json'),
		},
		message: 'Export ready.',
	};
}

export interface PortfolioExportDownloadResult {
	ok: boolean;
	format: PortfolioExportFormat | null;
	message: string;
}

/**
 * Downloads a single managed portfolio by stable id in the requested format.
 * Only `json` is backed by the existing implementation (`portfolio.json`
 * asset produced from the normalized output). `html` and `pdf` are UI-only —
 * no fake file is ever generated for them.
 */
export function downloadPortfolioExport(
	id: string,
	format: PortfolioExportFormat
): PortfolioExportDownloadResult {
	if (!isPortfolioExportFormat(format)) {
		return { ok: false, format: null, message: 'Unsupported export format.' };
	}
	if (format === 'html' || format === 'pdf') {
		return {
			ok: false,
			format,
			message: `${format.toUpperCase()} export is not implemented yet. No file was generated.`,
		};
	}

	const record = portfolioManagerStore.getPortfolio(id);
	if (!record) {
		return {
			ok: false,
			format,
			message: 'Portfolio not found. It may have been removed.',
		};
	}

	const json = JSON.stringify(record.data, null, 2);
	triggerFileDownload(new Blob([json], { type: 'application/json' }), exportFileName(record.title, 'json'));

	return {
		ok: true,
		format,
		message: `"${record.title}" exported as JSON. Version ${record.currentVersion} was exported.`,
	};
}

/** Suggested download file name derived from the portfolio title (never used as identity). */
export function exportFileName(title: string, format: PortfolioExportFormat): string {
	const slugified =
		title
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '') || 'portfolio';
	const extension = format === 'json' ? 'json' : format === 'pdf' ? 'pdf' : 'html';
	return `${slugified}.${extension}`;
}

/** Browser-only download helper. No-op outside a DOM environment (SSR/build). */
function triggerFileDownload(blob: Blob, fileName: string): void {
	if (typeof document === 'undefined' || typeof URL === 'undefined') {
		return;
	}
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}