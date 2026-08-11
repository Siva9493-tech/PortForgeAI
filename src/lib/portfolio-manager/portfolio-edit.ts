import type { PortfolioData } from '../portfolio';
import { createEmptyPortfolioData, createEmptySkills } from '../portfolio';
import type { PortfolioOutput, PortfolioSkill } from '../ai';
import { transformPortfolio, type PortfolioInput } from '../ai';
import { themeStore } from '../themes';
import type { PortfolioRecord } from './portfolio-manager-types';
import { portfolioManagerStore } from './portfolio-manager-store';

const SKILL_CATEGORY_FIELDS: Array<[string, keyof ReturnType<typeof createEmptySkills>]> = [
	['Programming Languages', 'programmingLanguages'],
	['Frameworks', 'frameworks'],
	['Databases', 'databases'],
	['Developer Tools', 'devTools'],
	['Cloud Platforms', 'cloudPlatforms'],
	['Soft Skills', 'softSkills'],
	['Additional Skills', 'additionalSkills'],
];

function skillsFromOutput(skills: PortfolioSkill[]): ReturnType<typeof createEmptySkills> {
	const result = createEmptySkills();
	for (const skill of skills) {
		const field = SKILL_CATEGORY_FIELDS.find(
			([label]) => label.toLowerCase() === skill.category.toLowerCase()
		)?.[1];
		if (field) {
			result[field] = skill.value;
		}
	}
	return result;
}

/**
 * Reverses a normalized `PortfolioOutput` back into builder wizard data so the
 * existing field-binding system can populate the Portfolio Builder in edit
 * mode. This is a read-only adapter over the stored content — it does not
 * create a second transformation pipeline. Fields that the output schema does
 * not carry (email, phone, location, profile photo, custom links, import
 * metadata) fall back to their empty builder defaults.
 */
export function portfolioOutputToData(output: PortfolioOutput): PortfolioData {
	const base = createEmptyPortfolioData();
	const seo = output.seo;
	const social = output.social;
	const resume = output.resume;

	const seoTitle = seo?.title ?? '';
	const isFallbackTitle = seoTitle === 'Portfolio';
	const [candidateName, ...roleParts] = seoTitle.split(' — ');
	const professionalTitle = roleParts.join(' — ');

	base.personalInformation = {
		fullName: isFallbackTitle ? '' : candidateName,
		professionalTitle,
		email: '',
		phone: '',
		location: '',
		about: seo?.description ?? '',
		profilePhoto: null,
	};

	base.education = output.education.map((entry) => ({
		degree: entry.degree,
		institution: entry.institution,
		fieldOfStudy: entry.fieldOfStudy,
		startYear: entry.startYear,
		endYear: entry.endYear,
		cgpa: entry.cgpa,
		description: entry.description,
	}));

	base.experience = output.experience.map((entry) => ({
		jobTitle: entry.role,
		company: entry.company,
		employmentType: entry.employmentType,
		location: entry.location,
		startDate: entry.startDate,
		endDate: entry.endDate,
		currentlyWorking: entry.currentlyWorking,
		description: entry.description,
	}));

	base.projects = output.projects.map((entry) => ({
		projectName: entry.name,
		projectRole: entry.role,
		technologies: entry.technologies.join(', '),
		githubUrl: entry.repositoryUrl ?? '',
		demoUrl: entry.liveUrl ?? '',
		description: entry.description,
		highlights: entry.highlights.join('\n'),
	}));

	base.certifications = output.certifications.map((entry) => ({
		certificationName: entry.name,
		issuingOrganization: entry.issuingOrganization,
		issueDate: entry.issueDate,
		credentialId: entry.credentialId,
		credentialUrl: entry.credentialUrl,
		description: entry.description,
	}));

	base.achievements = output.achievements.map((entry) => ({
		achievementTitle: entry.title,
		organization: entry.organization,
		achievementDate: entry.date,
		category: entry.category,
		description: entry.description,
		supportingLink: entry.link ?? '',
	}));

	base.skills = skillsFromOutput(output.skills);

	base.socialLinks = social
		? [
				{
					linkedinProfile: social.linkedin ?? '',
					githubProfile: social.github ?? '',
					portfolioWebsite: social.website ?? '',
					twitterProfile: social.twitter ?? '',
					instagram: social.instagram ?? '',
					youtubeChannel: social.youtube ?? '',
					otherWebsite: social.other ?? '',
					customLinks: [],
				},
			]
		: [];

	base.resume = resume
		? {
				fileName: resume.fileName,
				fileType: resume.fileType,
				fileSize: resume.fileSize,
				fileUrl: resume.fileUrl,
			}
		: { fileName: '', fileType: '', fileSize: 0 };

	return base;
}

/**
 * Loads a managed portfolio's stored content into builder form data.
 * Identity and lifecycle are untouched — this is a read-only view for editing.
 */
export function portfolioRecordToData(record: PortfolioRecord): PortfolioData {
	return portfolioOutputToData(record.data);
}

/**
 * Transforms builder wizard data into the normalized `PortfolioOutput` exactly
 * once, using the existing transformer and the currently selected theme — no
 * AI call and no secondary transformation pipeline. Both the create and update
 * save operations share this single path.
 */
function transformBuilderData(data: PortfolioData): PortfolioOutput {
	const input: PortfolioInput = {
		data,
		templateId: themeStore.getTheme().id,
		mode: 'balanced',
	};
	return transformPortfolio(input);
}

/**
 * Saves builder data as a brand-new managed portfolio (create mode). The
 * wizard data is transformed into the normalized `PortfolioOutput` exactly
 * once via the existing transformer, then the existing store create operation
 * assigns a stable unique id, a default draft status and fresh timestamps.
 */
export function createPortfolioFromBuilder(data: PortfolioData): PortfolioRecord {
	const output = transformBuilderData(data);
	const fullName = data.personalInformation.fullName.trim();
	const professionalTitle = data.personalInformation.professionalTitle.trim();
	const seoTitle = output.seo?.title && output.seo.title !== 'Portfolio' ? output.seo.title : '';
	const title = fullName || professionalTitle || seoTitle;
	return portfolioManagerStore.createPortfolio({ title, data: output });
}

/**
 * Saves edited builder data back to an existing managed portfolio. The wizard
 * data is transformed into the normalized `PortfolioOutput` exactly once via
 * the existing transformer (no AI call, no duplicate pipeline), then the
 * existing store update mechanism replaces the stored data while preserving
 * the portfolio id, createdAt, status and version behavior. Identical data is
 * detected structurally and left untouched.
 */
export function savePortfolioFromBuilder(id: string, data: PortfolioData): PortfolioRecord | undefined {
	const output = transformBuilderData(data);
	return portfolioManagerStore.updatePortfolio(id, { data: output });
}