import type { AssistantFeatureId } from './types';

/** Display metadata for a single AI Assistant tool. */
export interface AssistantFeatureInfo {
	id: AssistantFeatureId;
	title: string;
	description: string;
}

/**
 * Metadata describing the future AI Assistant tools. Task 1 registers the full
 * set so the interface can present them; the generators themselves are
 * implemented by later Day-10 tasks.
 */
export const ASSISTANT_FEATURES: readonly AssistantFeatureInfo[] = [
	{
		id: 'headline',
		title: 'Headline Generator',
		description: 'Craft a compelling professional headline from your portfolio.',
	},
	{
		id: 'bio',
		title: 'Bio Generator',
		description: 'Write a concise, engaging profile summary.',
	},
	{
		id: 'project-description',
		title: 'Project Descriptions',
		description: 'Improve how your projects are described.',
	},
	{
		id: 'skills',
		title: 'Skills Suggestions',
		description: 'Get suggestions to strengthen your skills section.',
	},
	{
		id: 'portfolio-review',
		title: 'Portfolio Review',
		description: 'Get an overall review of your portfolio.',
	},
	{
		id: 'recommendations',
		title: 'AI Recommendations',
		description: 'Receive tailored improvements for your portfolio.',
	},
];

/** Looks up display metadata for a feature, or undefined when unknown. */
export function getAssistantFeature(
	feature: AssistantFeatureId
): AssistantFeatureInfo | undefined {
	return ASSISTANT_FEATURES.find((item) => item.id === feature);
}
