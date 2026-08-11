import type { PortfolioOutput } from '../ai';
import {
	PUBLISH_SCHEMA_VERSION,
	buildPortfolioId,
	estimateBuildSize,
	estimatePageCount,
	generatePublishSlug,
} from './publish-utils';
import type { PublishAsset, PublishManifest, PublishOptions } from './publish-types';

/**
 * Builds a full publish manifest for a portfolio. Metadata only — no files are
 * generated. The result is deterministic given the same inputs.
 */
export function generateManifest(
	output: PortfolioOutput,
	assets: PublishAsset[],
	options: PublishOptions = {}
): PublishManifest {
	const seoTitle = output.seo?.title ?? output.theme?.name ?? 'Portfolio';
	const slug =
		options.slug ??
		output.seo?.slug ??
		generatePublishSlug(seoTitle);
	const name = options.name ?? seoTitle;
	const generatedAt = options.generatedAt ?? new Date().toISOString();
	const version = options.version ?? output.metadata?.version ?? PUBLISH_SCHEMA_VERSION;
	const language = options.language ?? output.metadata?.language ?? 'en';

	return {
		id: buildPortfolioId(slug),
		slug,
		name,
		theme: output.theme?.name ?? output.theme?.templateId ?? 'none',
		generatedAt,
		version,
		language,
		schemaVersion: PUBLISH_SCHEMA_VERSION,
		seo: {
			title: seoTitle,
			description: output.seo?.description ?? '',
			keywords: output.seo?.keywords ?? [],
		},
		sections: (output.sections ?? []).map((section) => ({
			id: section.id,
			title: section.title,
			order: section.order,
		})),
		assets,
		build: {
			schemaVersion: output.schemaVersion ?? PUBLISH_SCHEMA_VERSION,
			pages: estimatePageCount(output),
			estimatedSizeBytes: estimateBuildSize(output),
		},
	};
}