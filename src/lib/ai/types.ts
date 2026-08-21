import type {
	GitHubImportData,
	LinkedInImportData,
	PortfolioData,
	ProfilePhotoData,
	SocialCustomLink,
} from '../portfolio/types';

/** Identifier of a supported portfolio template. */
export type TemplateId = 'classic' | 'modern' | 'minimal' | 'developer' | 'creative';

/** How the AI should adapt voice and length. */
export type GenerationMode = 'concise' | 'balanced' | 'detailed';

/**
 * Everything the portfolio generator needs to produce a portfolio.
 * Deliberately decoupled from external APIs; the wizard's collected data is
 * passed in through `data`.
 */
export interface PortfolioInput {
	/** Wizard data assembled by the portfolio builder. */
	data: PortfolioData;
	/** The template the generated portfolio should conform to. */
	templateId: TemplateId;
	/** Tone / verbosity preference. */
	mode?: GenerationMode;
	/** Optional target role to help tailor copy. */
	targetRole?: string;
}

/** A single structured section of a generated portfolio. */
export interface PortfolioSection {
	id: string;
	title: string;
	subtitle?: string;
	order: number;
}

/** Visual theme resolved for a generated portfolio. */
export interface PortfolioTheme {
	templateId: TemplateId;
	name: string;
	description: string;
	keywords: string[];
}

/** A single generated project entry. */
export interface PortfolioProject {
	id?: string;
	name: string;
	role: string;
	technologies: string[];
	repositoryUrl?: string;
	liveUrl?: string;
	description: string;
	highlights: string[];
}

/** A single generated work / experience entry. */
export interface PortfolioExperience {
	id?: string;
	role: string;
	company: string;
	employmentType: string;
	location: string;
	startDate: string;
	endDate: string;
	currentlyWorking: boolean;
	description: string;
}

/** A single generated skill entry. */
export interface PortfolioSkill {
	id?: string;
	category: string;
	value: string;
}

/** A single generated education entry. */
export interface PortfolioEducation {
	id?: string;
	degree: string;
	institution: string;
	fieldOfStudy: string;
	startYear: string;
	endYear: string;
	cgpa: string;
	description: string;
}

/** A single generated achievement entry. */
export interface PortfolioAchievement {
	id?: string;
	title: string;
	organization: string;
	date: string;
	category: string;
	description: string;
	link: string;
}

/** A single generated certification entry. */
export interface PortfolioCertification {
	id?: string;
	name: string;
	issuingOrganization: string;
	issueDate: string;
	credentialId: string;
	credentialUrl: string;
	description: string;
}

/** Social / external profile links. */
export interface PortfolioSocial {
	linkedin: string;
	github: string;
	website: string;
	twitter: string;
	instagram: string;
	youtube: string;
	other: string;
}

/** Resume attachment metadata carried through the output. */
export interface PortfolioResume {
	fileName: string;
	fileType: string;
	fileSize: number;
	fileUrl?: string;
}

/** Search-engine / social sharing metadata. */
export interface PortfolioSEO {
	title: string;
	description: string;
	keywords: string[];
	ogImage?: string;
	slug?: string;
	canonicalUrl?: string;
}

/** Generation metadata. */
export interface PortfolioMetadata {
	templateId: TemplateId;
	mode: GenerationMode;
	schemaVersion: string;
	generatedAt: string;
	source: 'mock' | 'ai';
	createdAt: string;
	updatedAt: string;
	version: string;
	template: TemplateId;
	language: string;
}

/**
 * Builder-origin data that the normalized output schema does not model
 * (contact details, full About text, custom links and import preferences).
 * Carried through the save → edit → save round-trip so the Portfolio Builder
 * never silently loses user-entered information. Optional. Renderers may read
 * select fields for presentation (the profile photo and the full About text
 * in the public Hero/Introduction sections); export/publish consumers ignore
 * the rest.
 */
export interface PortfolioBuilderExtras {
	email?: string;
	phone?: string;
	location?: string;
	/**
	 * The full "About Me" text, preserved so the public Introduction section
	 * can render the complete profile narrative (the normalized SEO
	 * description used by the Hero is truncated to a short teaser).
	 */
	about?: string;
	/**
	 * Photo metadata plus its data URL, preserved so the saved portfolio keeps
	 * the user's uploaded profile image across save → edit → save round-trips.
	 */
	profilePhoto?: ProfilePhotoData | null;
	customLinks?: SocialCustomLink[];
	githubImport?: GitHubImportData;
	linkedinImport?: LinkedInImportData;
}

/**
 * The normalized portfolio output. Every future AI response and every local
 * transform must finally conform to this shape.
 */
export interface PortfolioOutput {
	schemaVersion: string;
	theme: PortfolioTheme | null;
	sections: PortfolioSection[];
	projects: PortfolioProject[];
	experience: PortfolioExperience[];
	skills: PortfolioSkill[];
	education: PortfolioEducation[];
	achievements: PortfolioAchievement[];
	certifications: PortfolioCertification[];
	social: PortfolioSocial | null;
	resume: PortfolioResume | null;
	seo: PortfolioSEO | null;
	metadata: PortfolioMetadata;
	/** Optional builder-only data preserved across save/load (see above). */
	builder?: PortfolioBuilderExtras;
}