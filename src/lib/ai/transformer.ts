import type { PortfolioData } from '../portfolio/types';
import { getTemplate } from './templates';
import { PORTFOLIO_SCHEMA_VERSION } from './portfolio-schema';
import type {
	PortfolioAchievement,
	PortfolioBuilderExtras,
	PortfolioCertification,
	PortfolioEducation,
	PortfolioExperience,
	PortfolioInput,
	PortfolioMetadata,
	PortfolioOutput,
	PortfolioProject,
	PortfolioResume,
	PortfolioSEO,
	PortfolioSection,
	PortfolioSkill,
	PortfolioSocial,
} from './types';

/* -------------------------------------------------------------------------- */
/* Text + collection normalizers                                               */
/* -------------------------------------------------------------------------- */

/** Trims whitespace and normalizes CRLF / CR line breaks to a single LF. */
export function normalizeText(value: string | undefined): string {
	if (!value) {
		return '';
	}
	return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

/**
 * Splits a value on the given separator, trims each part, drops empty items
 * and removes case-insensitive duplicates.
 */
export function normalizeArray(value: string | undefined, separator: RegExp | string = /[,;\n]/): string[] {
	if (!value) {
		return [];
	}
	const seen = new Set<string>();
	const result: string[] = [];
	for (const item of value.split(separator)) {
		const normalized = normalizeText(item);
		if (!normalized) {
			continue;
		}
		const key = normalized.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		result.push(normalized);
	}
	return result;
}

/**
 * Returns a shallow copy of a record with empty entries removed
 * (undefined / null / blank strings / empty arrays).
 */
export function removeEmptyFields<T extends object>(value: T): Partial<T> {
	const result: Record<string, unknown> = {};
	const source = value as Record<string, unknown>;
	for (const key of Object.keys(source)) {
		const entry = source[key];
		const isBlank =
			entry === undefined ||
			entry === null ||
			(typeof entry === 'string' && normalizeText(entry) === '') ||
			(Array.isArray(entry) && entry.length === 0);
		if (!isBlank) {
			result[key] = entry;
		}
	}
	return result as Partial<T>;
}

/* -------------------------------------------------------------------------- */
/* Slug + metadata + SEO                                                       */
/* -------------------------------------------------------------------------- */

/** Generates a URL-safe slug from any text (falls back to "portfolio"). */
export function generateSlug(value: string): string {
	const slug = normalizeText(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return slug || 'portfolio';
}

/** Builds generation metadata (createdAt, updatedAt, version, template, language). */
export function generateMetadata(input: PortfolioInput): PortfolioMetadata {
	const now = new Date().toISOString();
	return {
		templateId: input.templateId,
		mode: input.mode ?? 'balanced',
		schemaVersion: PORTFOLIO_SCHEMA_VERSION,
		generatedAt: now,
		source: 'mock',
		createdAt: now,
		updatedAt: now,
		version: PORTFOLIO_SCHEMA_VERSION,
		template: input.templateId,
		language: 'en',
	};
}

/** Builds default SEO (title, description, keywords, slug, canonical, og placeholder). */
export function generateSEO(data: PortfolioData): PortfolioSEO {
	const personal = data.personalInformation;
	const fullName = normalizeText(personal.fullName);
	const titleText = normalizeText(personal.professionalTitle);
	const slug = generateSlug(fullName || titleText);
	const description = normalizeText(personal.about) || (titleText ? `${titleText} portfolio` : '');
	const keywords = [
		titleText,
		...Object.values(removeEmptyFields(data.skills)).flatMap((value) => normalizeArray(value)),
	];

	return {
		title: [fullName, titleText].filter(Boolean).join(' — ') || 'Portfolio',
		description: description.slice(0, 160),
		keywords,
		slug,
		canonicalUrl: `/p/${slug}`,
		ogImage: `/og/${slug}.png`,
	};
}

/* -------------------------------------------------------------------------- */
/* Per-section transformers                                                    */
/* -------------------------------------------------------------------------- */

/** Transforms wizard experience entries into normalized output entries. */
export function transformExperience(input: PortfolioInput): PortfolioExperience[] {
	return input.data.experience
		.map((entry, index): PortfolioExperience => ({
			id: `exp-${index + 1}`,
			role: normalizeText(entry.jobTitle),
			company: normalizeText(entry.company),
			employmentType: normalizeText(entry.employmentType),
			location: normalizeText(entry.location),
			startDate: normalizeText(entry.startDate),
			endDate: entry.currentlyWorking ? '' : normalizeText(entry.endDate),
			currentlyWorking: entry.currentlyWorking,
			description: normalizeText(entry.description),
		}))
		.filter((entry) => entry.role !== '' || entry.company !== '');
}

/** Transforms wizard projects, deduping technologies and highlights. */
export function transformProjects(input: PortfolioInput): PortfolioProject[] {
	return input.data.projects
		.map((entry, index): PortfolioProject => ({
			id: `prj-${index + 1}`,
			name: normalizeText(entry.projectName),
			role: normalizeText(entry.projectRole),
			technologies: normalizeArray(entry.technologies),
			repositoryUrl: normalizeText(entry.githubUrl) || undefined,
			liveUrl: normalizeText(entry.demoUrl) || undefined,
			description: normalizeText(entry.description),
			highlights: normalizeArray(entry.highlights, /\n/),
		}))
		.filter((entry) => entry.name !== '');
}

/** Transforms wizard education entries into normalized output entries. */
export function transformEducation(input: PortfolioInput): PortfolioEducation[] {
	return input.data.education
		.map((entry, index): PortfolioEducation => ({
			id: `edc-${index + 1}`,
			degree: normalizeText(entry.degree),
			institution: normalizeText(entry.institution),
			fieldOfStudy: normalizeText(entry.fieldOfStudy),
			startYear: normalizeText(entry.startYear),
			endYear: normalizeText(entry.endYear),
			cgpa: normalizeText(entry.cgpa),
			description: normalizeText(entry.description),
		}))
		.filter((entry) => entry.degree !== '' || entry.institution !== '');
}

/** Transforms wizard skills into deduplicated category/value pairs. */
export function transformSkills(input: PortfolioInput): PortfolioSkill[] {
	const skills = input.data.skills;
	const categories: Array<[string, string]> = [
		['Programming Languages', skills.programmingLanguages],
		['Frameworks', skills.frameworks],
		['Databases', skills.databases],
		['Developer Tools', skills.devTools],
		['Cloud Platforms', skills.cloudPlatforms],
		['Soft Skills', skills.softSkills],
		['Additional Skills', skills.additionalSkills],
	];
	const seen = new Set<string>();
	const result: PortfolioSkill[] = [];
	for (const [category, value] of categories) {
		const normalized = normalizeArray(value);
		if (normalized.length === 0) {
			continue;
		}
		const combined = normalized.join(', ');
		const key = combined.toLowerCase();
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);
		result.push({ category, value: combined });
	}
	return result;
}

/** Transforms wizard certifications into normalized output entries. */
export function transformCertifications(input: PortfolioInput): PortfolioCertification[] {
	return input.data.certifications
		.map((entry, index): PortfolioCertification => ({
			id: `cert-${index + 1}`,
			name: normalizeText(entry.certificationName),
			issuingOrganization: normalizeText(entry.issuingOrganization),
			issueDate: normalizeText(entry.issueDate),
			credentialId: normalizeText(entry.credentialId),
			credentialUrl: normalizeText(entry.credentialUrl),
			description: normalizeText(entry.description),
		}))
		.filter((entry) => entry.name !== '');
}

/** Transforms wizard achievements into normalized output entries. */
export function transformAchievements(input: PortfolioInput): PortfolioAchievement[] {
	return input.data.achievements
		.map((entry, index): PortfolioAchievement => ({
			id: `ach-${index + 1}`,
			title: normalizeText(entry.achievementTitle),
			organization: normalizeText(entry.organization),
			date: normalizeText(entry.achievementDate),
			category: normalizeText(entry.category),
			description: normalizeText(entry.description),
			link: normalizeText(entry.supportingLink),
		}))
		.filter((entry) => entry.title !== '');
}

/** Transforms the first social links row into a normalized object (null when empty). */
export function transformSocialLinks(input: PortfolioInput): PortfolioSocial | null {
	const social = input.data.socialLinks[0];
	if (!social) {
		return null;
	}
	const links = removeEmptyFields({
		linkedin: normalizeText(social.linkedinProfile),
		github: normalizeText(social.githubProfile),
		website: normalizeText(social.portfolioWebsite),
		twitter: normalizeText(social.twitterProfile),
		instagram: normalizeText(social.instagram),
		youtube: normalizeText(social.youtubeChannel),
		other: normalizeText(social.otherWebsite),
	});
	return Object.keys(links).length > 0 ? (links as PortfolioSocial) : null;
}

/** Transforms resume attachment metadata (null when empty). */
export function transformResume(input: PortfolioInput): PortfolioResume | null {
	const resume = input.data.resume;
	if (!normalizeText(resume.fileName) && !normalizeText(resume.fileUrl) && resume.fileSize <= 0) {
		return null;
	}
	return {
		fileName: normalizeText(resume.fileName),
		fileType: normalizeText(resume.fileType),
		fileSize: resume.fileSize,
		fileUrl: normalizeText(resume.fileUrl) || undefined,
	};
}

/**
 * Collects builder-only data that the normalized output does not model so it
 * survives a save → edit → save round-trip. The profile photo (name, type,
 * size and its data URL) is preserved so the stored portfolio can keep and
 * re-render the user's uploaded image. Returns undefined when nothing needs
 * preserving.
 */
function transformBuilderExtras(input: PortfolioInput): PortfolioBuilderExtras | undefined {
	const personal = input.data.personalInformation;
	const social = input.data.socialLinks[0];
	const github = input.data.githubImport;
	const linkedin = input.data.linkedinImport;

	const extras: PortfolioBuilderExtras = {};

	const email = normalizeText(personal.email);
	if (email) extras.email = email;
	const phone = normalizeText(personal.phone);
	if (phone) extras.phone = phone;
	const location = normalizeText(personal.location);
	if (location) extras.location = location;

	const about = normalizeText(personal.about);
	if (about) extras.about = about;

	const profilePhoto = personal.profilePhoto;
	if (profilePhoto && profilePhoto.dataUrl) {
		extras.profilePhoto = {
			name: profilePhoto.name,
			type: profilePhoto.type,
			size: profilePhoto.size,
			dataUrl: profilePhoto.dataUrl,
		};
	}

	if (social?.customLinks?.length) {
		const links = social.customLinks
			.map((link) => ({
				label: normalizeText(link.label),
				url: normalizeText(link.url),
			}))
			.filter((link) => link.label !== '' || link.url !== '');
		if (links.length > 0) extras.customLinks = links;
	}

	if (
		github &&
		(github.connected ||
			normalizeText(github.githubUsername) !== '' ||
			normalizeText(github.repositoryVisibility) !== '' ||
			(github.importedRepositories ?? []).length > 0)
	) {
		extras.githubImport = {
			githubUsername: normalizeText(github.githubUsername),
			repositoryVisibility: normalizeText(github.repositoryVisibility),
			connected: github.connected,
			importedRepositories: (github.importedRepositories ?? [])
				.map((repository) => ({
					name: normalizeText(repository.name),
					description: normalizeText(repository.description),
					url: normalizeText(repository.url),
					technologies: (repository.technologies ?? [])
						.map((technology) => normalizeText(technology))
						.filter((technology) => technology !== ''),
				}))
				.filter((repository) => repository.name !== '' || repository.url !== ''),
		};
	}

	if (
		linkedin &&
		(linkedin.connected ||
			normalizeText(linkedin.linkedinProfileUrl) !== '' ||
			normalizeText(linkedin.importMode) !== '')
	) {
		extras.linkedinImport = {
			linkedinProfileUrl: normalizeText(linkedin.linkedinProfileUrl),
			importMode: normalizeText(linkedin.importMode),
			connected: linkedin.connected,
		};
	}

	return Object.keys(extras).length > 0 ? extras : undefined;
}

/* -------------------------------------------------------------------------- */
/* Section order + orchestrator                                                */
/* -------------------------------------------------------------------------- */

interface SectionState {
	summary: boolean;
	experience: number;
	projects: number;
	skills: number;
	education: number;
	certifications: number;
	achievements: number;
	social: boolean;
}

function buildSections(data: PortfolioData, state: SectionState): PortfolioSection[] {
	const hasSummary = Boolean(
		normalizeText(data.personalInformation.fullName) ||
			normalizeText(data.personalInformation.about) ||
			normalizeText(data.personalInformation.professionalTitle)
	);
	const definitions: Array<{ id: string; title: string; present: boolean }> = [
		{ id: 'summary', title: 'Summary', present: hasSummary },
		{ id: 'experience', title: 'Experience', present: state.experience > 0 },
		{ id: 'projects', title: 'Projects', present: state.projects > 0 },
		{ id: 'skills', title: 'Skills', present: state.skills > 0 },
		{ id: 'education', title: 'Education', present: state.education > 0 },
		{ id: 'certifications', title: 'Certifications', present: state.certifications > 0 },
		{ id: 'achievements', title: 'Achievements', present: state.achievements > 0 },
		{ id: 'social', title: 'Social', present: state.social },
	];
	return definitions
		.filter((definition) => definition.present)
		.map((definition, index): PortfolioSection => ({
			id: definition.id,
			title: definition.title,
			order: index,
		}));
}

/**
 * Single source of truth for every future renderer: converts raw wizard data
 * into a clean, normalized, strongly typed `PortfolioOutput`.
 */
export function transformPortfolio(input: PortfolioInput): PortfolioOutput {
	const data = input.data;
	const template = getTemplate(input.templateId);

	const experience = transformExperience(input);
	const projects = transformProjects(input);
	const education = transformEducation(input);
	const skills = transformSkills(input);
	const certifications = transformCertifications(input);
	const achievements = transformAchievements(input);
	const social = transformSocialLinks(input);
	const resume = transformResume(input);

	const sections = buildSections(data, {
		summary: true,
		experience: experience.length,
		projects: projects.length,
		skills: skills.length,
		education: education.length,
		certifications: certifications.length,
		achievements: achievements.length,
		social: social !== null,
	});

	return {
		schemaVersion: PORTFOLIO_SCHEMA_VERSION,
		theme: {
			templateId: template.id,
			name: template.name,
			description: template.description,
			keywords: template.keywords,
		},
		sections,
		projects: projects,
		experience: experience,
		skills: skills,
		education: education,
		achievements: achievements,
		certifications: certifications,
		social: social,
		resume: resume,
		seo: generateSEO(data),
		metadata: generateMetadata(input),
		builder: transformBuilderExtras(input),
	};
}