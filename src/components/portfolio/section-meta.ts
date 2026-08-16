import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import {
	Award,
	Briefcase,
	FileText,
	FolderGit2,
	Github,
	GraduationCap,
	Link2,
	Linkedin,
	Sparkles,
	Trophy,
	User,
} from 'lucide-astro';
import { WIZARD_STEPS } from '../../lib/portfolio/steps';
import type { StepId } from '../../lib/portfolio/types';

export interface SectionMeta {
	stepId: StepId;
	number: number;
	title: string;
	shortLabel: string;
	icon: AstroComponentFactory;
}

const ICONS: Record<StepId, AstroComponentFactory> = {
	personalInformation: User,
	education: GraduationCap,
	experience: Briefcase,
	projects: FolderGit2,
	skills: Sparkles,
	certifications: Award,
	achievements: Trophy,
	socialLinks: Link2,
	resume: FileText,
	githubImport: Github,
	linkedinImport: Linkedin,
};

const SHORT_LABELS: Record<StepId, string> = {
	personalInformation: 'Personal',
	education: 'Education',
	experience: 'Experience',
	projects: 'Projects',
	skills: 'Skills',
	certifications: 'Certifications',
	achievements: 'Achievements',
	socialLinks: 'Social Links',
	resume: 'Resume',
	githubImport: 'GitHub',
	linkedinImport: 'LinkedIn',
};

export const SECTION_META: SectionMeta[] = WIZARD_STEPS.map((step) => ({
	stepId: step.id,
	number: step.number,
	title: step.title,
	shortLabel: SHORT_LABELS[step.id],
	icon: ICONS[step.id],
}));

export function getSectionMetaById(stepId: StepId): SectionMeta | undefined {
	return SECTION_META.find((meta) => meta.stepId === stepId);
}

export function getSectionMetaByNumber(number: number): SectionMeta | undefined {
	return SECTION_META.find((meta) => meta.number === number);
}
