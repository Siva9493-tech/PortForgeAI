export type StepId =
	| 'personalInformation'
	| 'education'
	| 'experience'
	| 'projects'
	| 'skills'
	| 'certifications'
	| 'achievements'
	| 'socialLinks'
	| 'resume'
	| 'githubImport'
	| 'linkedinImport';

export interface ProfilePhotoData {
	name: string;
	type: string;
	size: number;
	dataUrl?: string;
}

export interface PersonalInformationData {
	fullName: string;
	professionalTitle: string;
	email: string;
	phone: string;
	location: string;
	about: string;
	profilePhoto: ProfilePhotoData | null;
}

export interface EducationEntry {
	degree: string;
	institution: string;
	fieldOfStudy: string;
	startYear: string;
	endYear: string;
	cgpa: string;
	description: string;
}

export type EducationData = EducationEntry[];

export interface ExperienceEntry {
	jobTitle: string;
	company: string;
	employmentType: string;
	location: string;
	startDate: string;
	endDate: string;
	currentlyWorking: boolean;
	description: string;
}

export type ExperienceData = ExperienceEntry[];

export interface ProjectEntry {
	projectName: string;
	projectRole: string;
	technologies: string;
	githubUrl: string;
	demoUrl: string;
	description: string;
	highlights: string;
}

export type ProjectsData = ProjectEntry[];

export interface SkillsData {
	programmingLanguages: string;
	frameworks: string;
	databases: string;
	devTools: string;
	cloudPlatforms: string;
	softSkills: string;
	additionalSkills: string;
}

export interface CertificationEntry {
	certificationName: string;
	issuingOrganization: string;
	issueDate: string;
	credentialId: string;
	credentialUrl: string;
	description: string;
}

export type CertificationsData = CertificationEntry[];

export interface AchievementEntry {
	achievementTitle: string;
	organization: string;
	achievementDate: string;
	category: string;
	description: string;
	supportingLink: string;
}

export type AchievementsData = AchievementEntry[];

export interface SocialLinksData {
	linkedinProfile: string;
	githubProfile: string;
	portfolioWebsite: string;
	twitterProfile: string;
	instagram: string;
	youtubeChannel: string;
	otherWebsite: string;
}

export interface ResumeData {
	fileName: string;
	fileType: string;
	fileSize: number;
	fileUrl?: string;
}

export interface ImportedRepository {
	name: string;
	description: string;
	url: string;
	technologies: string[];
}

export interface GitHubImportData {
	githubUsername: string;
	repositoryVisibility: string;
	connected: boolean;
	importedRepositories: ImportedRepository[];
}

export interface LinkedInImportData {
	linkedinProfileUrl: string;
	importMode: string;
	connected: boolean;
}

export interface PortfolioData {
	personalInformation: PersonalInformationData;
	education: EducationData;
	experience: ExperienceData;
	projects: ProjectsData;
	skills: SkillsData;
	certifications: CertificationsData;
	achievements: AchievementsData;
	socialLinks: SocialLinksData;
	resume: ResumeData;
	githubImport: GitHubImportData;
	linkedinImport: LinkedInImportData;
}

export function createEmptyProfilePhoto(): ProfilePhotoData {
	return { name: '', type: '', size: 0 };
}

export function createEmptyPersonalInformation(): PersonalInformationData {
	return {
		fullName: '',
		professionalTitle: '',
		email: '',
		phone: '',
		location: '',
		about: '',
		profilePhoto: null,
	};
}

export function createEmptyEducationEntry(): EducationEntry {
	return {
		degree: '',
		institution: '',
		fieldOfStudy: '',
		startYear: '',
		endYear: '',
		cgpa: '',
		description: '',
	};
}

export function createEmptyExperienceEntry(): ExperienceEntry {
	return {
		jobTitle: '',
		company: '',
		employmentType: '',
		location: '',
		startDate: '',
		endDate: '',
		currentlyWorking: false,
		description: '',
	};
}

export function createEmptyProjectEntry(): ProjectEntry {
	return {
		projectName: '',
		projectRole: '',
		technologies: '',
		githubUrl: '',
		demoUrl: '',
		description: '',
		highlights: '',
	};
}

export function createEmptySkills(): SkillsData {
	return {
		programmingLanguages: '',
		frameworks: '',
		databases: '',
		devTools: '',
		cloudPlatforms: '',
		softSkills: '',
		additionalSkills: '',
	};
}

export function createEmptyCertificationEntry(): CertificationEntry {
	return {
		certificationName: '',
		issuingOrganization: '',
		issueDate: '',
		credentialId: '',
		credentialUrl: '',
		description: '',
	};
}

export function createEmptyAchievementEntry(): AchievementEntry {
	return {
		achievementTitle: '',
		organization: '',
		achievementDate: '',
		category: '',
		description: '',
		supportingLink: '',
	};
}

export function createEmptySocialLinks(): SocialLinksData {
	return {
		linkedinProfile: '',
		githubProfile: '',
		portfolioWebsite: '',
		twitterProfile: '',
		instagram: '',
		youtubeChannel: '',
		otherWebsite: '',
	};
}

export function createEmptyResume(): ResumeData {
	return { fileName: '', fileType: '', fileSize: 0 };
}

export function createEmptyGitHubImport(): GitHubImportData {
	return {
		githubUsername: '',
		repositoryVisibility: '',
		connected: false,
		importedRepositories: [],
	};
}

export function createEmptyLinkedInImport(): LinkedInImportData {
	return {
		linkedinProfileUrl: '',
		importMode: '',
		connected: false,
	};
}

export function createEmptyPortfolioData(): PortfolioData {
	return {
		personalInformation: createEmptyPersonalInformation(),
		education: [createEmptyEducationEntry()],
		experience: [createEmptyExperienceEntry()],
		projects: [createEmptyProjectEntry()],
		skills: createEmptySkills(),
		certifications: [createEmptyCertificationEntry()],
		achievements: [createEmptyAchievementEntry()],
		socialLinks: createEmptySocialLinks(),
		resume: createEmptyResume(),
		githubImport: createEmptyGitHubImport(),
		linkedinImport: createEmptyLinkedInImport(),
	};
}

export function isPortfolioSection(
	key: string
): key is keyof PortfolioData {
	return key in createEmptyPortfolioData();
}
