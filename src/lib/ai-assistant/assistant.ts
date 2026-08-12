import { isPortfolioContextEmpty } from './context';
import { bioAssistantEngine } from './bio';
import { headlineAssistantEngine } from './headline';
import { projectDescriptionAssistantEngine } from './project-description';
import { skillsAssistantEngine } from './skills';
import { portfolioReviewAssistantEngine } from './portfolio-review';
import { recommendationsAssistantEngine } from './recommendations';
import { guardAssistantResult, safeFailureResult } from './quality';
import type { PortfolioContext } from './types';
import type { AssistantFeatureId, AssistantRequest, AssistantResult } from './types';

/**
 * The seam between the Assistant UI and the existing AI pipeline.
 *
 * A provider receives a typed `AssistantRequest` and returns a typed
 * `AssistantResult`. Later Day-10 tasks replace the default engine with
 * per-feature generators that reuse the existing prompt builder
 * (`buildPrompt` / `buildFinalPrompt`) and the existing generator abstraction
 * (`generatePortfolio`) — the Assistant UI and this request/result contract
 * stay unchanged, so the provider can be swapped without a UI rewrite.
 */
export type AssistantProvider = (
	request: AssistantRequest
) => Promise<AssistantResult> | AssistantResult;

/** Resolved portfolio context, or null when no portfolio is available. */
type PortfolioContextOrNull = PortfolioContext | null;

/**
 * The execution primitive behind a provider. It receives the resolved context
 * (or null when no portfolio is available) and is responsible for producing
 * user-safe assistant output.
 */
export type AssistantEngine = (
	request: AssistantRequest,
	context: PortfolioContextOrNull
) => Promise<AssistantResult> | AssistantResult;

/** User-safe message per feature while generators are not wired yet. */
const FEATURE_UNAVAILABLE_MESSAGE: Record<AssistantFeatureId, string> = {
	headline: 'Headline generation is not available yet.',
	bio: 'Bio generation is not available yet.',
	'project-description': 'Project description generation is not available yet.',
	skills: 'Skills suggestions are not available yet.',
	'portfolio-review': 'Portfolio review is not available yet.',
	recommendations: 'AI recommendations are not available yet.',
};

function unavailableResult(feature: AssistantFeatureId): AssistantResult {
	return {
		ok: false,
		feature,
		content: '',
		metadata: null,
		error: FEATURE_UNAVAILABLE_MESSAGE[feature],
	};
}

function emptyPortfolioResult(feature: AssistantFeatureId): AssistantResult {
	return {
		ok: false,
		feature,
		content: '',
		metadata: null,
		error: 'The selected portfolio has no content yet. Add content before asking the AI Assistant.',
	};
}

/**
 * Wraps any engine into a provider that first guards against an empty
 * portfolio context. Engines receive the resolved context (or null).
 */
export function createAssistantProvider(engine: AssistantEngine): AssistantProvider {
	return async (request) => {
		const context = request.context ?? null;
		if (context !== null && isPortfolioContextEmpty(context)) {
			return emptyPortfolioResult(request.feature);
		}
		return engine(request, context);
	};
}

/**
 * Registered per-feature engines. Day-10 tasks add one entry per implemented
 * feature; features without an engine report a user-safe "not available yet"
 * result instead of fabricating content.
 */
const FEATURE_ENGINES: Partial<Record<AssistantFeatureId, AssistantEngine>> = {
	headline: headlineAssistantEngine,
	bio: bioAssistantEngine,
	'project-description': projectDescriptionAssistantEngine,
	skills: skillsAssistantEngine,
	'portfolio-review': portfolioReviewAssistantEngine,
	recommendations: recommendationsAssistantEngine,
};

/**
 * The default engine for the app. Routes a request to the registered engine
 * for its feature, falling back to an honest, user-safe "not available yet"
 * result when the feature has no generator yet.
 */
const routedAssistantEngine: AssistantEngine = (request, context) => {
	const engine = FEATURE_ENGINES[request.feature];
	return engine ? engine(request, context) : unavailableResult(request.feature);
};

/** The default, application-wide assistant provider. */
export const defaultAssistantProvider: AssistantProvider =
	createAssistantProvider(routedAssistantEngine);

/**
 * Runs an assistant request through a provider (the default provider unless
 * another is supplied). This is the single entry point the Assistant UI (and
 * future tools) will call.
 *
 * Every result passes through the shared quality & safety layer here, so all
 * engines get identical validation/normalization: sanitized text, redacted
 * secrets, deduplicated and capped output, and safe user-facing errors. A
 * throwing provider is caught and converted into the safe error message —
 * internal details are logged only for development.
 */
export async function runAssistant(
	request: AssistantRequest,
	provider: AssistantProvider = defaultAssistantProvider
): Promise<AssistantResult> {
	let result: unknown;
	try {
		result = await provider(request);
	} catch (error) {
		if (typeof console !== 'undefined') {
			console.error(`[ai-assistant] "${request.feature}" provider failed.`, error);
		}
		return safeFailureResult(request.feature);
	}
	return guardAssistantResult(result, request.feature);
}
