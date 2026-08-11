import type { PortfolioOutput } from '../ai';

export const PUBLISH_SCHEMA_VERSION = '1.0.0';

const SLUG_MAX_LENGTH = 60;

/**
 * Generates a URL-safe slug from any name. Pure and deterministic; falls back
 * to `fallback` when the result would be empty.
 */
export function generatePublishSlug(name: string, fallback = 'portfolio'): string {
	const slug = name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, SLUG_MAX_LENGTH);
	return slug || fallback;
}

/**
 * Estimates the number of static pages a build would produce. A portfolio is
 * a single page by default, plus one detail page per project.
 */
export function estimatePageCount(output: PortfolioOutput): number {
	const projectPages = (output.projects?.length ?? 0) > 0 ? output.projects.length : 0;
	return 1 + projectPages;
}

const BYTES = {
	overhead: 28_000,
	section: 2_200,
	perProject: 900,
	perExperience: 700,
	perSkill: 400,
	perEducation: 500,
	perAchievement: 600,
	perCertification: 500,
	perSocial: 600,
} as const;

/**
 * Rough byte estimate of the rendered portfolio. A small constant per part,
 * consistent with the renderer — deterministic and free of I/O.
 */
export function estimateBuildSize(output: PortfolioOutput, includeAssets = true): number {
	let bytes = BYTES.overhead;
	bytes += (output.sections?.length ?? 0) * BYTES.section;
	bytes += (output.projects?.length ?? 0) * BYTES.perProject;
	bytes += (output.experience?.length ?? 0) * BYTES.perExperience;
	bytes += (output.skills?.length ?? 0) * BYTES.perSkill;
	bytes += (output.education?.length ?? 0) * BYTES.perEducation;
	bytes += (output.achievements?.length ?? 0) * BYTES.perAchievement;
	bytes += (output.certifications?.length ?? 0) * BYTES.perCertification;
	bytes += output.social ? BYTES.perSocial : 0;

	if (includeAssets && output.resume) {
		bytes += output.resume.fileSize ?? 0;
	}
	return bytes;
}

/** Derives a stable portfolio id from a slug. */
export function buildPortfolioId(slug: string): string {
	return `p-${slug}`;
}