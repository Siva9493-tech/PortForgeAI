import type {
	PortfolioAchievement,
	PortfolioCertification,
	PortfolioEducation,
	PortfolioExperience,
	PortfolioOutput,
	PortfolioProject,
	PortfolioResume,
	PortfolioSection,
	PortfolioSEO,
	PortfolioSkill,
	PortfolioSocial,
	PortfolioTheme,
} from './types';

/** Version of the normalized output schema. */
export const PORTFOLIO_SCHEMA_VERSION = '1.0.0';

/** The set of section ids recognized by the normalized schema. */
export const PORTFOLIO_SECTION_IDS = [
	'summary',
	'experience',
	'projects',
	'skills',
	'education',
	'certifications',
	'achievements',
	'social',
] as const;

export type PortfolioSectionId = (typeof PORTFOLIO_SECTION_IDS)[number];

/** Provides a fully typed, empty `PortfolioOutput` conforming to the schema. */
export function createEmptyPortfolioOutput(): PortfolioOutput {
	return {
		schemaVersion: PORTFOLIO_SCHEMA_VERSION,
		theme: null,
		sections: [],
		projects: [],
		experience: [],
		skills: [],
		education: [],
		achievements: [],
		certifications: [],
		social: null,
		resume: null,
		seo: null,
		metadata: {
			templateId: 'modern',
			mode: 'balanced',
			schemaVersion: PORTFOLIO_SCHEMA_VERSION,
			generatedAt: '',
			source: 'mock',
			createdAt: '',
			updatedAt: '',
			version: PORTFOLIO_SCHEMA_VERSION,
			template: 'modern',
			language: 'en',
		},
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
	return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every(isString);
}

function isBoolean(value: unknown): value is boolean {
	return typeof value === 'boolean';
}

function isNumber(value: unknown): value is number {
	return typeof value === 'number';
}

/** Normalizes an unknown payload into a valid `PortfolioOutput`. */
export function normalizePortfolioOutput(raw: unknown): PortfolioOutput {
	const fallback = createEmptyPortfolioOutput();

	if (!isRecord(raw)) {
		return fallback;
	}

	const sections = normalizeSections(raw.sections);

	return {
		schemaVersion: isString(raw.schemaVersion) ? raw.schemaVersion : PORTFOLIO_SCHEMA_VERSION,
		theme: normalizeTheme(raw.theme, fallback.theme),
		sections,
		projects: normalizeProjects(raw.projects),
		experience: normalizeExperience(raw.experience),
		skills: normalizeSkills(raw.skills),
		education: normalizeEducation(raw.education),
		achievements: normalizeAchievements(raw.achievements),
		certifications: normalizeCertifications(raw.certifications),
		social: normalizeSocial(raw.social),
		resume: normalizeResume(raw.resume),
		seo: normalizeSEO(raw.seo),
		metadata: normalizeMetadata(raw.metadata, fallback.metadata),
	};
}

function normalizeTheme(value: unknown, fallback: PortfolioTheme | null): PortfolioTheme | null {
	if (!isRecord(value)) {
		return fallback;
	}
	const theme: PortfolioTheme = {
		templateId: isString(value.templateId) ? (value.templateId as PortfolioOutput['metadata']['templateId']) : 'modern',
		name: isString(value.name) ? value.name : '',
		description: isString(value.description) ? value.description : '',
		keywords: isStringArray(value.keywords) ? value.keywords : [],
	};
	return theme;
}

function normalizeSections(value: unknown): PortfolioSection[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry, index): PortfolioSection => {
		const section: PortfolioSection = {
			id: isString(entry.id) ? entry.id : String(index),
			title: isString(entry.title) ? entry.title : '',
			order: isNumber(entry.order) ? entry.order : index,
		};
		if (isString(entry.subtitle)) {
			section.subtitle = entry.subtitle;
		}
		return section;
	});
}

function normalizeProjects(value: unknown): PortfolioProject[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry): PortfolioProject => ({
		id: isString(entry.id) ? entry.id : undefined,
		name: isString(entry.name) ? entry.name : '',
		role: isString(entry.role) ? entry.role : '',
		technologies: isStringArray(entry.technologies) ? entry.technologies : [],
		description: isString(entry.description) ? entry.description : '',
		highlights: isStringArray(entry.highlights) ? entry.highlights : [],
		repositoryUrl: isString(entry.repositoryUrl) ? entry.repositoryUrl : undefined,
		liveUrl: isString(entry.liveUrl) ? entry.liveUrl : undefined,
	}));
}

function normalizeExperience(value: unknown): PortfolioExperience[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry): PortfolioExperience => ({
		id: isString(entry.id) ? entry.id : undefined,
		role: isString(entry.role) ? entry.role : '',
		company: isString(entry.company) ? entry.company : '',
		employmentType: isString(entry.employmentType) ? entry.employmentType : '',
		location: isString(entry.location) ? entry.location : '',
		startDate: isString(entry.startDate) ? entry.startDate : '',
		endDate: isString(entry.endDate) ? entry.endDate : '',
		currentlyWorking: isBoolean(entry.currentlyWorking) ? entry.currentlyWorking : false,
		description: isString(entry.description) ? entry.description : '',
	}));
}

function normalizeSkills(value: unknown): PortfolioSkill[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry): PortfolioSkill => ({
		id: isString(entry.id) ? entry.id : undefined,
		category: isString(entry.category) ? entry.category : '',
		value: isString(entry.value) ? entry.value : '',
	}));
}

function normalizeEducation(value: unknown): PortfolioEducation[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry): PortfolioEducation => ({
		id: isString(entry.id) ? entry.id : undefined,
		degree: isString(entry.degree) ? entry.degree : '',
		institution: isString(entry.institution) ? entry.institution : '',
		fieldOfStudy: isString(entry.fieldOfStudy) ? entry.fieldOfStudy : '',
		startYear: isString(entry.startYear) ? entry.startYear : '',
		endYear: isString(entry.endYear) ? entry.endYear : '',
		cgpa: isString(entry.cgpa) ? entry.cgpa : '',
		description: isString(entry.description) ? entry.description : '',
	}));
}

function normalizeAchievements(value: unknown): PortfolioAchievement[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry): PortfolioAchievement => ({
		id: isString(entry.id) ? entry.id : undefined,
		title: isString(entry.title) ? entry.title : '',
		organization: isString(entry.organization) ? entry.organization : '',
		date: isString(entry.date) ? entry.date : '',
		category: isString(entry.category) ? entry.category : '',
		description: isString(entry.description) ? entry.description : '',
		link: isString(entry.link) ? entry.link : '',
	}));
}

function normalizeCertifications(value: unknown): PortfolioCertification[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter(isRecord).map((entry): PortfolioCertification => ({
		id: isString(entry.id) ? entry.id : undefined,
		name: isString(entry.name) ? entry.name : '',
		issuingOrganization: isString(entry.issuingOrganization) ? entry.issuingOrganization : '',
		issueDate: isString(entry.issueDate) ? entry.issueDate : '',
		credentialId: isString(entry.credentialId) ? entry.credentialId : '',
		credentialUrl: isString(entry.credentialUrl) ? entry.credentialUrl : '',
		description: isString(entry.description) ? entry.description : '',
	}));
}

function normalizeSocial(value: unknown): PortfolioSocial | null {
	if (!isRecord(value)) {
		return null;
	}
	const social: PortfolioSocial = {
		linkedin: isString(value.linkedin) ? value.linkedin : '',
		github: isString(value.github) ? value.github : '',
		website: isString(value.website) ? value.website : '',
		twitter: isString(value.twitter) ? value.twitter : '',
		instagram: isString(value.instagram) ? value.instagram : '',
		youtube: isString(value.youtube) ? value.youtube : '',
		other: isString(value.other) ? value.other : '',
	};
	return social;
}

function normalizeResume(value: unknown): PortfolioResume | null {
	if (!isRecord(value)) {
		return null;
	}
	const resume: PortfolioResume = {
		fileName: isString(value.fileName) ? value.fileName : '',
		fileType: isString(value.fileType) ? value.fileType : '',
		fileSize: isNumber(value.fileSize) ? value.fileSize : 0,
	};
	if (isString(value.fileUrl)) {
		resume.fileUrl = value.fileUrl;
	}
	return resume;
}

function normalizeSEO(value: unknown): PortfolioSEO | null {
	if (!isRecord(value)) {
		return null;
	}
	const seo: PortfolioSEO = {
		title: isString(value.title) ? value.title : '',
		description: isString(value.description) ? value.description : '',
		keywords: isStringArray(value.keywords) ? value.keywords : [],
	};
	if (isString(value.ogImage)) {
		seo.ogImage = value.ogImage;
	}
	if (isString(value.slug)) {
		seo.slug = value.slug;
	}
	if (isString(value.canonicalUrl)) {
		seo.canonicalUrl = value.canonicalUrl;
	}
	return seo;
}

function normalizeMetadata(value: unknown, fallback: PortfolioOutput['metadata']): PortfolioOutput['metadata'] {
	if (!isRecord(value)) {
		return fallback;
	}
	const metadata: PortfolioOutput['metadata'] = {
		templateId: isString(value.templateId) ? (value.templateId as PortfolioOutput['metadata']['templateId']) : fallback.templateId,
		mode: isString(value.mode) ? (value.mode as PortfolioOutput['metadata']['mode']) : fallback.mode,
		schemaVersion: isString(value.schemaVersion) ? value.schemaVersion : fallback.schemaVersion,
		generatedAt: isString(value.generatedAt) ? value.generatedAt : fallback.generatedAt,
		source: isString(value.source) ? (value.source as PortfolioOutput['metadata']['source']) : fallback.source,
		createdAt: isString(value.createdAt) ? value.createdAt : fallback.createdAt,
		updatedAt: isString(value.updatedAt) ? value.updatedAt : fallback.updatedAt,
		version: isString(value.version) ? value.version : fallback.version,
		template: isString(value.template) ? (value.template as PortfolioOutput['metadata']['template']) : fallback.template,
		language: isString(value.language) ? value.language : fallback.language,
	};
	return metadata;
}
