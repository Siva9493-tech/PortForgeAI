import type { TemplateId } from './types';

/** Placeholder definition for a portfolio template. */
export interface PortfolioTemplate {
	id: TemplateId;
	name: string;
	description: string;
	keywords: string[];
}

/**
 * Registered portfolio templates. These are placeholder definitions only; no
 * actual rendering exists yet. They drive both the prompt builder (which
 * template to generate copy for) and the future renderer.
 */
export const TEMPLATES: Record<TemplateId, PortfolioTemplate> = {
	classic: {
		id: 'classic',
		name: 'Classic',
		description: 'A timeless, structured, professional layout suited to corporate roles.',
		keywords: ['professional', 'structured', 'corporate', 'timeline'],
	},
	modern: {
		id: 'modern',
		name: 'Modern',
		description: 'A contemporary, balanced layout with generous whitespace and cards.',
		keywords: ['contemporary', 'balanced', 'card-based', 'clean'],
	},
	minimal: {
		id: 'minimal',
		name: 'Minimal',
		description: 'A sparse, typography-first layout that lets content lead.',
		keywords: ['minimal', 'typography', 'sparse', 'elegant'],
	},
	developer: {
		id: 'developer',
		name: 'Developer',
		description: 'A technical layout emphasizing projects, skills, and side work.',
		keywords: ['technical', 'projects', 'open-source', 'developer'],
	},
	creative: {
		id: 'creative',
		name: 'Creative',
		description: 'An expressive layout with bold accents for design and artistic roles.',
		keywords: ['creative', 'bold', 'expressive', 'design'],
	},
};

export function getTemplate(id: TemplateId): PortfolioTemplate {
	return TEMPLATES[id];
}