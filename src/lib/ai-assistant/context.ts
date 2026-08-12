import type { PortfolioOutput } from '../ai';
import type { PortfolioContext } from './types';

/**
 * Splits an SEO title (`Name — Headline`) into its parts. Deterministic and
 * pure; returns empty strings when the title is missing or has no separator.
 */
function splitSeoTitle(seoTitle: string | undefined): { name: string; headline: string } {
	const [name = '', ...rest] = (seoTitle ?? '').split(' — ');
	return { name: name.trim(), headline: rest.join(' — ').trim() };
}

/**
 * Derives the reusable assistant context from a normalized `PortfolioOutput`.
 *
 * Pure, deterministic, type-safe, and free of browser APIs, network calls and
 * localStorage. It never reads the portfolio builder wizard store and never
 * duplicates the transform pipeline — it is a thin read-only view over the
 * existing normalized output.
 */
export function createPortfolioContext(output: PortfolioOutput): PortfolioContext {
	const seo = output.seo;
	const { name, headline } = splitSeoTitle(seo?.title);

	return {
		name,
		headline,
		summary: seo?.description ?? '',
		keywords: seo?.keywords ?? [],
		themeName: output.theme?.name ?? '',
		templateId: output.theme?.templateId ?? output.metadata.templateId,
		sections: output.sections,
		projects: output.projects,
		experience: output.experience,
		skills: output.skills,
		education: output.education,
		certifications: output.certifications,
		achievements: output.achievements,
		social: output.social,
		resume: output.resume,
	};
}

/** True when the context carries no usable content for AI features. */
export function isPortfolioContextEmpty(context: PortfolioContext): boolean {
	return (
		context.name === '' &&
		context.headline === '' &&
		context.summary === '' &&
		context.projects.length === 0 &&
		context.experience.length === 0 &&
		context.skills.length === 0 &&
		context.education.length === 0 &&
		context.certifications.length === 0 &&
		context.achievements.length === 0 &&
		context.social === null
	);
}

/** Content counts of a context, used by the Assistant UI indicator. */
export interface PortfolioContextCounts {
	projects: number;
	experience: number;
	skills: number;
	education: number;
	certifications: number;
	achievements: number;
}

/** Aggregates the content counts of a context. Pure. */
export function portfolioContextCounts(context: PortfolioContext): PortfolioContextCounts {
	return {
		projects: context.projects.length,
		experience: context.experience.length,
		skills: context.skills.length,
		education: context.education.length,
		certifications: context.certifications.length,
		achievements: context.achievements.length,
	};
}

/**
 * Short human-readable summary of a context's content, e.g. "3 projects ·
 * 2 roles · 5 skills". Returns 'No content yet' when everything is empty.
 */
export function portfolioContextLabel(context: PortfolioContext): string {
	const counts = portfolioContextCounts(context);
	const parts: string[] = [];
	if (counts.projects > 0) {
		parts.push(`${counts.projects} project${counts.projects === 1 ? '' : 's'}`);
	}
	if (counts.experience > 0) {
		parts.push(`${counts.experience} role${counts.experience === 1 ? '' : 's'}`);
	}
	if (counts.skills > 0) {
		parts.push(`${counts.skills} skill${counts.skills === 1 ? '' : 's'}`);
	}
	return parts.length > 0 ? parts.join(' · ') : 'No content yet';
}
