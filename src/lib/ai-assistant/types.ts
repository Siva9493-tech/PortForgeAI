import type {
	GenerationMode,
	PortfolioAchievement,
	PortfolioCertification,
	PortfolioEducation,
	PortfolioExperience,
	PortfolioMetadata,
	PortfolioProject,
	PortfolioResume,
	PortfolioSection,
	PortfolioSkill,
	PortfolioSocial,
	TemplateId,
} from '../ai';

/**
 * Identifiers of the AI Assistant features. Task 1 defines the full future set
 * so later Day-10 tasks can implement each feature without rewriting the
 * Assistant request/result architecture.
 */
export type AssistantFeatureId =
	| 'headline'
	| 'bio'
	| 'project-description'
	| 'skills'
	| 'portfolio-review'
	| 'recommendations';

/** The complete set of known AI Assistant features. */
export const ASSISTANT_FEATURE_IDS: readonly AssistantFeatureId[] = [
	'headline',
	'bio',
	'project-description',
	'skills',
	'portfolio-review',
	'recommendations',
];

/** True when a value is a known assistant feature id. */
export function isAssistantFeatureId(value: unknown): value is AssistantFeatureId {
	return ASSISTANT_FEATURE_IDS.includes(value as AssistantFeatureId);
}

/**
 * Reusable, UI-independent view of a portfolio for AI features. Derived from a
 * normalized `PortfolioOutput`; the assistant never reads the wizard store or
 * individual wizard fields directly.
 */
export interface PortfolioContext {
	/** Person's name, derived from the SEO title when present. */
	name: string;
	/** Professional headline, derived from the SEO title when present. */
	headline: string;
	/** Bio / profile summary. */
	summary: string;
	keywords: readonly string[];
	themeName: string;
	templateId: TemplateId;
	sections: readonly PortfolioSection[];
	projects: readonly PortfolioProject[];
	experience: readonly PortfolioExperience[];
	skills: readonly PortfolioSkill[];
	education: readonly PortfolioEducation[];
	certifications: readonly PortfolioCertification[];
	achievements: readonly PortfolioAchievement[];
	social: PortfolioSocial | null;
	resume: PortfolioResume | null;
}

/** Generation options accepted by an assistant request. */
export interface AssistantRequestOptions {
	/** Tone / verbosity preference, aligned with the existing generation modes. */
	mode?: GenerationMode;
}

/**
 * A typed request for an AI Assistant feature. The portfolio context is passed
 * explicitly so future generators have everything they need without touching
 * the wizard store or portfolio manager internals.
 */
export interface AssistantRequest {
	/** The AI feature the user is asking for. */
	feature: AssistantFeatureId;
	/** Stable id of the portfolio the request applies to, when known. */
	portfolioId?: string;
	/** The normalized portfolio content the feature should work against. */
	context?: PortfolioContext | null;
	/** Optional target content (e.g. a project name or skill category). */
	target?: string;
	/** Optional free-form user instruction. */
	instruction?: string;
	options?: AssistantRequestOptions;
}

/** Metadata describing a completed assistant run. */
export interface AssistantResultMetadata {
	feature: AssistantFeatureId;
	generatedAt: string;
	source: PortfolioMetadata['source'];
}

/**
 * Typed result produced by the assistant. `ok: false` carries a user-safe
 * message in `error`; raw technical errors are never surfaced to the user.
 */
export interface AssistantResult {
	ok: boolean;
	feature: AssistantFeatureId;
	/** Generated content for the requested feature, empty when the run failed. */
	content: string;
	metadata: AssistantResultMetadata | null;
	error: string | null;
}

/** The states the Assistant UI can represent (foundation only). */
export type AssistantRunStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty';

/** Discriminated state model future Assistant UI work can render against. */
export type AssistantState =
	| { status: 'idle' }
	| { status: 'loading'; request: AssistantRequest }
	| { status: 'success'; result: AssistantResult }
	| { status: 'error'; message: string }
	| { status: 'empty' };
