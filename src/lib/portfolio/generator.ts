import {
	buildPrompt,
	generatePortfolio as generateAiPortfolio,
	type PortfolioInput,
	type PortfolioOutput,
	type PortfolioSEO,
} from '../ai';
import { themeStore, type PortfolioTheme } from '../themes';
import {
	generateManifest,
	generatePortfolioPackage,
	prepareAssets,
	validatePortfolio,
	type PublishResult,
} from '../publish';
import type { PortfolioData } from './types';
import { wizardStore } from './wizard-store';

/** The single object produced by the full generation pipeline. */
export interface GeneratedPortfolioResult {
	portfolio: PortfolioOutput;
	seo: PortfolioSEO | null;
	theme: PortfolioTheme;
	publish: PublishResult;
}

/**
 * Reuses the publish module's functions to build a `PublishResult` directly
 * from an already-generated output — avoiding a second portfolio transform.
 */
function buildPublishResult(portfolio: PortfolioOutput): PublishResult {
	const readiness = validatePortfolio(portfolio);
	const assets = prepareAssets(portfolio);
	const manifest = generateManifest(portfolio, assets);
	const pkg = readiness.ready ? generatePortfolioPackage(portfolio) : null;
	return {
		ok: readiness.ready,
		status: readiness.status,
		slug: manifest.slug,
		readiness,
		manifest,
		package: pkg,
	};
}

/**
 * The one public entry point of the generation pipeline. Reads the wizard
 * store (or an explicit override), threads the active theme through, builds
 * the AI prompt, runs the mocked AI engine, and prepares the publish payload —
 * all by reusing the existing modules. No duplicated logic or transforms.
 *
 * Flow:
 *   wizardStore ─► PortfolioInput ─► buildPrompt ─► AI engine ─► PortfolioOutput
 *        themeStore ──────────────────────────────┘            ─► SEO
 *                                                        publish ─► PublishResult
 */
export function generatePortfolio(data?: PortfolioData): GeneratedPortfolioResult {
	const source = data ?? wizardStore.getState().data;
	const theme = themeStore.getTheme();

	const input: PortfolioInput = {
		data: source,
		templateId: theme.id,
		mode: 'balanced',
	};

	const prompt = buildPrompt(input);
	const portfolio = generateAiPortfolio(input, prompt);
	const publish = buildPublishResult(portfolio);

	return {
		portfolio,
		seo: portfolio.seo,
		theme,
		publish,
	};
}