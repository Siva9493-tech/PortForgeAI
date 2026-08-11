import { transformPortfolio, type PortfolioInput, type PortfolioOutput } from '../ai';
import { generateManifest } from './publish-manifest';
import { estimateBuildSize, generatePublishSlug } from './publish-utils';
import { validatePortfolio } from './publish-validator';
import type {
	PortfolioPackage,
	PublishAsset,
	PublishOptions,
	PublishResult,
} from './publish-types';

/**
 * Resolves the slug for a portfolio, preferring the explicit option, then the
 * output's SEO slug, then a slug derived from the title.
 */
function resolveSlug(output: PortfolioOutput, options: PublishOptions = {}): string {
	return (
		options.slug ?? output.seo?.slug ?? generatePublishSlug(output.seo?.title ?? 'Portfolio')
	);
}

/**
 * Describes the deployable assets for a portfolio as pure metadata. No files
 * are created — this is the contract future adapters will build against.
 */
export function prepareAssets(
	output: PortfolioOutput,
	options: PublishOptions = {}
): PublishAsset[] {
	const slug = resolveSlug(output, options);
	const assets: PublishAsset[] = [];

	assets.push({
		id: 'home',
		type: 'html',
		name: 'index.html',
		path: '/index.html',
		sizeBytes: estimateBuildSize(output, false),
	});

	const jsonSize = JSON.stringify(output).length;
	assets.push({
		id: 'data',
		type: 'json',
		name: 'portfolio.json',
		path: `/p/${slug}/portfolio.json`,
		sizeBytes: jsonSize,
	});

	if (output.seo?.ogImage) {
		assets.push({
			id: 'og-image',
			type: 'image',
			name: `${slug}-og.png`,
			path: `/og/${slug}.png`,
			sizeBytes: 0,
		});
	}

	if (output.resume?.fileUrl || output.resume?.fileName) {
		assets.push({
			id: 'resume',
			type: 'pdf',
			name: output.resume?.fileName ?? 'resume.pdf',
			path: output.resume?.fileUrl ?? `/resume/${slug}.pdf`,
			sizeBytes: output.resume?.fileSize ?? 0,
		});
	}

	return assets;
}

/**
 * Assembles a complete, reusable publish package from a normalized output.
 * The package is the input for future deployment adapters.
 */
export function generatePortfolioPackage(
	output: PortfolioOutput,
	options: PublishOptions = {}
): PortfolioPackage {
	const assets = prepareAssets(output, options);
	const manifest = generateManifest(output, assets, options);
	return {
		output,
		theme: output.theme,
		seo: output.seo,
		manifest,
		assets,
		settings: options,
	};
}

/**
 * Full publish preparation pipeline. Consumes a `PortfolioInput`, produces the
 * normalized output via `transformPortfolio`, validates readiness, prepares
 * assets and returns a manifest and package. No deployment happens here.
 */
export function preparePublish(
	input: PortfolioInput,
	options: PublishOptions = {}
): PublishResult {
	const output = transformPortfolio(input);
	const readiness = validatePortfolio(output);
	const assets = prepareAssets(output, options);
	const manifest = generateManifest(output, assets, options);
	const pkg: PortfolioPackage | null = readiness.ready
		? generatePortfolioPackage(output, options)
		: null;

	return {
		ok: readiness.ready,
		status: readiness.status,
		slug: manifest.slug,
		readiness,
		manifest,
		package: pkg,
	};
}