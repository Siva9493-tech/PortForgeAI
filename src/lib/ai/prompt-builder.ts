import type { PortfolioData } from '../portfolio/types';
import { getTemplate } from './templates';
import type { GenerationMode, PortfolioInput, TemplateId } from './types';

/**
 * Structured prompt parts produced by `buildPrompt`. Every field is a plain
 * string ready to be pasted into a provider request payload.
 */
export interface PortfolioPrompt {
	role: string;
	system: string;
	template: string;
	personal: string;
	experience: string;
	projects: string;
	skills: string;
	education: string;
	certifications: string;
	achievements: string;
	social: string;
	instructions: string;
}

const MODE_GUIDANCE: Record<GenerationMode, string> = {
	concise: 'Keep every description short, punchy, and limited to one or two sentences.',
	balanced: 'Keep descriptions concise but complete; two to three sentences per entry.',
	detailed: 'Expand descriptions to three to four sentences with measurable impact where possible.',
};

/* -------------------------------------------------------------------------- */
/* Shared text helpers                                                         */
/* -------------------------------------------------------------------------- */

/** Trims whitespace and normalizes CRLF / CR line breaks to a single LF. */
function clean(value: string | undefined): string {
	if (!value) {
		return '';
	}
	return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

/** Splits a value into trimmed, non-empty lines (used for bullet lists). */
function cleanLines(value: string | undefined): string[] {
	return clean(value)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);
}

/** Joins non-empty parts with a separator, returning '' when all are empty. */
function joinParts(separator: string, ...parts: Array<string | undefined>): string {
	return parts.map(clean).filter(Boolean).join(separator);
}

/** Formats a single `- label: value` line, or '' when the value is empty. */
function fieldLine(label: string, value: string | undefined): string {
	const content = clean(value);
	return content ? `- ${label}: ${content}` : '';
}

/**
 * Builds a markdown `## Title` section from already-formatted lines.
 * Returns an empty string when every line is blank so callers can skip the
 * section automatically.
 */
function section(title: string, lines: string[]): string {
	const content = lines.filter(Boolean);
	return content.length > 0 ? `## ${title}\n${content.join('\n')}` : '';
}

/** Builds a markdown `## Title` section from a list of present values. */
function bulletSection(title: string, values: Array<string | undefined>): string {
	return section(title, values.map(clean));
}

/* -------------------------------------------------------------------------- */
/* Personal + summary                                                          */
/* -------------------------------------------------------------------------- */

/** `## Personal Information` — only non-empty contact fields are included. */
export function buildPersonalPrompt(input: PortfolioInput): string {
	const personal = input.data.personalInformation;
	return section('Personal Information', [
		fieldLine('Name', personal.fullName),
		fieldLine('Professional Title', personal.professionalTitle),
		fieldLine('Email', personal.email),
		fieldLine('Phone', personal.phone),
		fieldLine('Location', personal.location),
		fieldLine('Profile Photo', personal.profilePhoto?.name),
	]);
}

/** `## Professional Summary` — derived from the about text and title. */
function buildSummaryPrompt(input: PortfolioInput): string {
	const personal = input.data.personalInformation;
	return section('Professional Summary', [
		personal.about ? `- ${clean(personal.about)}` : '',
		fieldLine('Headline', personal.professionalTitle),
	]);
}

/* -------------------------------------------------------------------------- */
/* Education                                                                   */
/* -------------------------------------------------------------------------- */

/** `## Education` — one bullet group per entry, skipping empty fields. */
export function buildEducationPrompt(input: PortfolioInput): string {
	const rows: string[] = [];
	for (const entry of input.data.education) {
		const title = joinParts(' at ', entry.degree, entry.institution);
		if (!title) {
			continue;
		}
		const years = joinParts(' - ', entry.startYear, entry.endYear);
		rows.push(
			`- ${title}`,
			fieldLine('Field of Study', entry.fieldOfStudy),
			fieldLine('Years', years),
			fieldLine('CGPA', entry.cgpa),
			fieldLine('Description', entry.description)
		);
	}
	return section('Education', rows);
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                  */
/* -------------------------------------------------------------------------- */

/** `## Experience` — one bullet group per entry, skipping empty fields. */
export function buildExperiencePrompt(input: PortfolioInput): string {
	const rows: string[] = [];
	for (const entry of input.data.experience) {
		const title = joinParts(' at ', entry.jobTitle, entry.company);
		if (!title) {
			continue;
		}
		const years = entry.currentlyWorking
			? joinParts(' - ', entry.startDate, 'Present')
			: joinParts(' - ', entry.startDate, entry.endDate);
		rows.push(
			`- ${title}`,
			fieldLine('Employment Type', entry.employmentType),
			fieldLine('Location', entry.location),
			fieldLine('Period', years),
			fieldLine('Description', entry.description)
		);
	}
	return section('Experience', rows);
}

/* -------------------------------------------------------------------------- */
/* Projects                                                                    */
/* -------------------------------------------------------------------------- */

/** `## Projects` — one bullet group per entry, including highlights. */
export function buildProjectsPrompt(input: PortfolioInput): string {
	const rows: string[] = [];
	for (const entry of input.data.projects) {
		if (!clean(entry.projectName)) {
			continue;
		}
		const title = joinParts(' — ', entry.projectName, entry.projectRole);
		rows.push(
			`- ${title}`,
			fieldLine('Technologies', entry.technologies),
			fieldLine('Repository', entry.githubUrl),
			fieldLine('Live Demo', entry.demoUrl),
			fieldLine('Description', entry.description),
			...cleanLines(entry.highlights).map((highlight) => `  - Highlight: ${highlight}`)
		);
	}
	return section('Projects', rows);
}

/* -------------------------------------------------------------------------- */
/* Skills                                                                      */
/* -------------------------------------------------------------------------- */

/** `## Skills` — one `- Category: value` line per populated category. */
export function buildSkillsPrompt(input: PortfolioInput): string {
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
	return section(
		'Skills',
		categories.map(([label, value]) => fieldLine(label, value))
	);
}

/* -------------------------------------------------------------------------- */
/* Certifications                                                              */
/* -------------------------------------------------------------------------- */

/** `## Certifications` — one bullet group per entry. */
export function buildCertificationPrompt(input: PortfolioInput): string {
	const rows: string[] = [];
	for (const entry of input.data.certifications) {
		if (!clean(entry.certificationName)) {
			continue;
		}
		rows.push(
			`- ${clean(entry.certificationName)}`,
			fieldLine('Organization', entry.issuingOrganization),
			fieldLine('Issue Date', entry.issueDate),
			fieldLine('Credential ID', entry.credentialId),
			fieldLine('Credential URL', entry.credentialUrl),
			fieldLine('Description', entry.description)
		);
	}
	return section('Certifications', rows);
}

/* -------------------------------------------------------------------------- */
/* Achievements                                                                */
/* -------------------------------------------------------------------------- */

/** `## Achievements` — one bullet group per entry. */
export function buildAchievementPrompt(input: PortfolioInput): string {
	const rows: string[] = [];
	for (const entry of input.data.achievements) {
		if (!clean(entry.achievementTitle)) {
			continue;
		}
		rows.push(
			`- ${clean(entry.achievementTitle)}`,
			fieldLine('Organization', entry.organization),
			fieldLine('Date', entry.achievementDate),
			fieldLine('Category', entry.category),
			fieldLine('Description', entry.description),
			fieldLine('Supporting Link', entry.supportingLink)
		);
	}
	return section('Achievements', rows);
}

/* -------------------------------------------------------------------------- */
/* Social links                                                                */
/* -------------------------------------------------------------------------- */

/** `## Social Links` — populated profiles only. */
export function buildSocialPrompt(input: PortfolioInput): string {
	const social = input.data.socialLinks[0];
	return bulletSection('Social Links', [
		social ? `LinkedIn: ${social.linkedinProfile}` : undefined,
		social ? `GitHub: ${social.githubProfile}` : undefined,
		social ? `Website: ${social.portfolioWebsite}` : undefined,
		social ? `Twitter: ${social.twitterProfile}` : undefined,
		social ? `Instagram: ${social.instagram}` : undefined,
		social ? `YouTube: ${social.youtubeChannel}` : undefined,
		social ? `Other: ${social.otherWebsite}` : undefined,
	]);
}

/* -------------------------------------------------------------------------- */
/* Resume, GitHub, LinkedIn, preferences, missing information                  */
/* -------------------------------------------------------------------------- */

/** `## Resume Information` — attachment metadata only. */
function buildResumePrompt(input: PortfolioInput): string {
	const resume = input.data.resume;
	if (!resume.fileName && !resume.fileUrl) {
		return '';
	}
	const sizeKb = resume.fileSize > 0 ? `${Math.max(1, Math.round(resume.fileSize / 1024))} KB` : '';
	return section('Resume Information', [
		fieldLine('File Name', resume.fileName),
		fieldLine('File Type', resume.fileType),
		fieldLine('File Size', sizeKb),
		fieldLine('File URL', resume.fileUrl),
	]);
}

/** `## GitHub Information` — account details and imported repositories. */
function buildGitHubPrompt(input: PortfolioInput): string {
	const github = input.data.githubImport;
	if (!github.connected && !github.githubUsername && github.importedRepositories.length === 0) {
		return '';
	}
	const rows = [
		fieldLine('Connected', github.connected ? 'Yes' : 'No'),
		fieldLine('Username', github.githubUsername),
		fieldLine('Repository Visibility', github.repositoryVisibility),
	];
	for (const repo of github.importedRepositories) {
		if (!clean(repo.name)) {
			continue;
		}
		rows.push(
			`- Repository: ${clean(repo.name)}`,
			fieldLine('Description', repo.description),
			fieldLine('URL', repo.url),
			fieldLine('Technologies', repo.technologies.join(', '))
		);
	}
	return section('GitHub Information', rows);
}

/** `## LinkedIn Information` — profile URL and import mode. */
function buildLinkedInPrompt(input: PortfolioInput): string {
	const linkedin = input.data.linkedinImport;
	if (!linkedin.connected && !linkedin.linkedinProfileUrl && !linkedin.importMode) {
		return '';
	}
	return section('LinkedIn Information', [
		fieldLine('Profile URL', linkedin.linkedinProfileUrl),
		fieldLine('Import Mode', linkedin.importMode),
		fieldLine('Connected', linkedin.connected ? 'Yes' : 'No'),
	]);
}

/** `## Portfolio Preferences` — template, verbosity, and target role. */
function buildPreferencesPrompt(input: PortfolioInput): string {
	const template = getTemplate(input.templateId);
	return section('Portfolio Preferences', [
		fieldLine('Template', `${template.name} (${template.id})`),
		fieldLine('Verbosity', input.mode ?? 'balanced'),
		fieldLine('Target Role', input.targetRole),
	]);
}

/** `## Missing Information` — lists sections with no content, if any. */
function buildMissingPrompt(input: PortfolioInput): string {
	const data = input.data;
	const gaps: string[] = [];
	if (!hasPersonalContent(data)) {
		gaps.push('Personal Information');
	}
	if (data.education.length === 0 || data.education.every((entry) => !clean(entry.degree) && !clean(entry.institution))) {
		gaps.push('Education');
	}
	if (data.experience.length === 0 || data.experience.every((entry) => !clean(entry.jobTitle) && !clean(entry.company))) {
		gaps.push('Experience');
	}
	if (data.projects.length === 0 || data.projects.every((entry) => !clean(entry.projectName))) {
		gaps.push('Projects');
	}
	if (!hasSkills(data)) {
		gaps.push('Skills');
	}
	if (data.certifications.length === 0 || data.certifications.every((entry) => !clean(entry.certificationName))) {
		gaps.push('Certifications');
	}
	if (data.achievements.length === 0 || data.achievements.every((entry) => !clean(entry.achievementTitle))) {
		gaps.push('Achievements');
	}
	if (!hasSocial(data)) {
		gaps.push('Social Links');
	}
	const lines =
		gaps.length > 0
			? gaps.map((gap) => `- No ${gap} provided.`)
			: ['- All key sections are provided.'];
	return section('Missing Information', lines);
}

function hasPersonalContent(data: PortfolioData): boolean {
	const personal = data.personalInformation;
	return Boolean(clean(personal.fullName) || clean(personal.about) || clean(personal.professionalTitle));
}

function hasSkills(data: PortfolioData): boolean {
	const skills = data.skills;
	return Boolean(
		clean(skills.programmingLanguages) ||
			clean(skills.frameworks) ||
			clean(skills.databases) ||
			clean(skills.devTools) ||
			clean(skills.cloudPlatforms) ||
			clean(skills.softSkills) ||
			clean(skills.additionalSkills)
	);
}

function hasSocial(data: PortfolioData): boolean {
	const social = data.socialLinks[0];
	if (!social) {
		return false;
	}
	return Boolean(
		clean(social.linkedinProfile) ||
			clean(social.githubProfile) ||
			clean(social.portfolioWebsite) ||
			clean(social.twitterProfile) ||
			clean(social.instagram) ||
			clean(social.youtubeChannel) ||
			clean(social.otherWebsite)
	);
}

/* -------------------------------------------------------------------------- */
/* Portfolio goal + final assembly                                             */
/* -------------------------------------------------------------------------- */

/** `## Portfolio Goal` — a closing directive derived from the template. */
export function buildPortfolioGoal(input: PortfolioInput): string {
	const template = getTemplate(input.templateId);
	const targetRole = clean(input.targetRole);
	const roleSuffix = targetRole ? ` tailored to a ${targetRole}` : '';
	return section('Portfolio Goal', [
		`- Create a ${template.name.toLowerCase()} portfolio${roleSuffix} that presents all of the above information clearly and professionally.`,
	]);
}

/**
 * Builds one large, readable markdown prompt from the wizard data.
 * Empty sections are skipped automatically; whitespace is trimmed and line
 * breaks normalized. This is the entry point that callers (and future
 * providers) should use.
 */
export function buildFinalPrompt(input: PortfolioInput): string {
	return [
		'# Portfolio Information',
		buildPersonalPrompt(input),
		buildSummaryPrompt(input),
		buildEducationPrompt(input),
		buildExperiencePrompt(input),
		buildProjectsPrompt(input),
		buildSkillsPrompt(input),
		buildCertificationPrompt(input),
		buildAchievementPrompt(input),
		buildSocialPrompt(input),
		buildResumePrompt(input),
		buildGitHubPrompt(input),
		buildLinkedInPrompt(input),
		buildPreferencesPrompt(input),
		buildMissingPrompt(input),
		buildPortfolioGoal(input),
	]
		.filter(Boolean)
		.join('\n\n');
}

/* -------------------------------------------------------------------------- */
/* Task 1 API (kept for compatibility)                                          */
/* -------------------------------------------------------------------------- */

function joinOptional(...values: Array<string | undefined>): string {
	return values.filter((value): value is string => Boolean(value)).join(', ');
}

/**
 * Converts wizard data into a structured AI prompt.
 * Pure string generation; performs no networking.
 */
export function buildPrompt(input: PortfolioInput): PortfolioPrompt {
	const template = getTemplate(input.templateId);
	const mode = input.mode ?? 'balanced';
	const targetRole = input.targetRole?.trim();

	return {
		role: 'portfolio-copywriter',
		system:
			'You are a senior portfolio copywriter. You convert raw resume data into polished, ' +
			'professional portfolio copy that conforms exactly to the requested structure. ' +
			'Never invent facts that are not present in the source data. Return valid structured content.',
		template: `Template: ${template.name} (${template.description})`,
		personal: buildPersonalPrompt(input),
		experience: buildExperiencePrompt(input),
		projects: buildProjectsPrompt(input),
		skills: buildSkillsPrompt(input),
		education: buildEducationPrompt(input),
		certifications: buildCertificationPrompt(input),
		achievements: buildAchievementPrompt(input),
		social: buildSocialPrompt(input),
		instructions: joinOptional(
			`Target role: ${targetRole}`,
			MODE_GUIDANCE[mode],
			`Output style should match the "${template.name}" template.`
		),
	};
}

/**
 * Flattens a structured `PortfolioPrompt` into a single prompt string.
 */
export function buildPromptText(prompt: PortfolioPrompt): string {
	return [
		`System: ${prompt.system}`,
		`Template: ${prompt.template}`,
		'--- Personal ---',
		prompt.personal,
		'--- Experience ---',
		prompt.experience,
		'--- Projects ---',
		prompt.projects,
		'--- Skills ---',
		prompt.skills,
		'--- Education ---',
		prompt.education,
		'--- Certifications ---',
		prompt.certifications,
		'--- Achievements ---',
		prompt.achievements,
		'--- Social ---',
		prompt.social,
		'--- Instructions ---',
		prompt.instructions,
	].join('\n');
}

/** Resolves the canonical `TemplateId` for an input, defaulting when absent. */
export function resolveTemplateId(templateId: TemplateId | undefined): TemplateId {
	return templateId ?? 'modern';
}