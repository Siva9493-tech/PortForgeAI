import type { PortfolioInput, PortfolioOutput } from './types';
import type { PortfolioPrompt } from './prompt-builder';
import { transformPortfolio } from './transformer';

/**
 * Orchestrates generation. Until a real provider is wired up, it transforms
 * the wizard data into the normalized output directly — no external calls are
 * made. The optional `prompt` is the prepared AI instruction threaded through
 * the pipeline for the future provider; the mock engine does not consume it yet.
 */
export function generatePortfolio(input: PortfolioInput, prompt?: PortfolioPrompt): PortfolioOutput {
	void prompt;
	return transformPortfolio(input);
}