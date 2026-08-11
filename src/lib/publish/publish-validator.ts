import type { PortfolioOutput } from '../ai';
import { estimateBuildSize, estimatePageCount } from './publish-utils';
import type {
	PublishCheckItem,
	PublishReadinessReport,
	PublishStatus,
} from './publish-types';

function hasValue(value: string | undefined | null): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates a normalized portfolio output and produces a readiness report
 * covering required metadata (title, personal info, projects, skills, theme,
 * SEO). Pure and provider-independent.
 */
export function validatePortfolio(output: PortfolioOutput): PublishReadinessReport {
	const items: PublishCheckItem[] = [];
	const warnings: string[] = [];
	const missing: string[] = [];

	const title = output.seo?.title ?? output.theme?.name ?? '';
	const hasTitle = hasValue(title);
	const hasPersonalInfo = hasValue(output.seo?.description) || hasValue(output.seo?.title);
	const hasProjects = (output.projects?.length ?? 0) > 0;
	const hasSkills = (output.skills?.length ?? 0) > 0;
	const hasTheme = output.theme !== null && output.theme !== undefined;
	const hasSeo = output.seo !== null && output.seo !== undefined && hasValue(output.seo.description);
	const hasSocial = output.social !== null && output.social !== undefined;

	const check = (label: string, passes: boolean, detail: string): void => {
		const status = passes ? ('ready' as const) : ('missing' as const);
		if (!passes) {
			missing.push(label);
		}
		items.push({ label, status, detail });
	};

	check(
		'Portfolio title',
		hasTitle,
		'Used as the site title and in search results.'
	);
	check(
		'Personal Information',
		hasPersonalInfo,
		'Provides the human context behind the portfolio.'
	);
	check(
		'Projects',
		hasProjects,
		'Project entries showcase your body of work.'
	);
	check('Skills', hasSkills, 'Skills communicate your areas of expertise.');
	check('Theme', hasTheme, 'A visual theme is selected for the presentation.');
	check(
		'SEO metadata',
		hasSeo,
		'Search and social sharing rely on SEO metadata.'
	);

	if (!hasSocial) {
		warnings.push('No social links provided — consider adding profiles for discoverability.');
	}
	if ((output.education?.length ?? 0) === 0) {
		warnings.push('Education section is empty — optional but recommended.');
	}
	if (output.resume === null) {
		warnings.push('No resume attached. Download availability is limited.');
	}

	const ready = missing.length === 0;
	const status: PublishStatus = ready ? 'ready' : 'not-ready';

	return {
		ready,
		status,
		items,
		warnings,
		missing,
		estimatedSizeBytes: estimateBuildSize(output),
		estimatedPages: estimatePageCount(output),
	};
}

/** Re-evaluates readiness for a portfolio (thin alias over validation). */
export function checkPublishReadiness(output: PortfolioOutput): PublishReadinessReport {
	return validatePortfolio(output);
}