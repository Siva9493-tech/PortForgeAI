import {
	createEmptyAchievementEntry,
	createEmptyCertificationEntry,
	createEmptyEducationEntry,
	createEmptyExperienceEntry,
	createEmptyProjectEntry,
	createEmptySocialLinks,
} from './types';
import type { PortfolioData } from './types';

export type BindingMode = 'object' | 'list';

export interface SectionBindingConfig {
	storeKey: keyof PortfolioData;
	mode: BindingMode;
}

export const SECTION_BINDINGS: Record<keyof PortfolioData, SectionBindingConfig> = {
	personalInformation: { storeKey: 'personalInformation', mode: 'object' },
	education: { storeKey: 'education', mode: 'list' },
	experience: { storeKey: 'experience', mode: 'list' },
	projects: { storeKey: 'projects', mode: 'list' },
	skills: { storeKey: 'skills', mode: 'object' },
	certifications: { storeKey: 'certifications', mode: 'list' },
	achievements: { storeKey: 'achievements', mode: 'list' },
	socialLinks: { storeKey: 'socialLinks', mode: 'list' },
	resume: { storeKey: 'resume', mode: 'object' },
	githubImport: { storeKey: 'githubImport', mode: 'object' },
	linkedinImport: { storeKey: 'linkedinImport', mode: 'object' },
};

export const EMPTY_ENTRY_FACTORIES: Partial<
	Record<keyof PortfolioData, () => object>
> = {
	education: () => createEmptyEducationEntry(),
	experience: () => createEmptyExperienceEntry(),
	projects: () => createEmptyProjectEntry(),
	certifications: () => createEmptyCertificationEntry(),
	achievements: () => createEmptyAchievementEntry(),
	socialLinks: () => createEmptySocialLinks(),
};