export type BugReportCategory =
	| 'Bug'
	| 'UI / Design Issue'
	| 'Feature Request'
	| 'Improvement'
	| 'Other';

export interface BugReportScreenshot {
	id: string;
	name: string;
	size: number;
	type: string;
	dataUrl: string;
}

export type BugReportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface BugReportInput {
	category: BugReportCategory;
	title: string;
	description: string;
	expectedBehavior: string;
	reproductionSteps?: string;
	additionalMessage?: string;
	screenshots?: BugReportScreenshot[];
}

export interface BugReportRecord {
	id: string;
	userId: string | null;
	userEmail?: string | null;
	category: BugReportCategory;
	title: string;
	description: string;
	expectedBehavior: string;
	reproductionSteps?: string;
	additionalMessage?: string;
	screenshots: BugReportScreenshot[];
	status: BugReportStatus;
	createdAt: string;
	deviceInfo?: {
		userAgent: string;
		screenWidth: number;
		screenHeight: number;
		pathname: string;
	};
}

export interface SubmitBugReportResult {
	success: boolean;
	reportId?: string;
	error?: string;
	persistedTo: 'supabase' | 'local_storage';
}
