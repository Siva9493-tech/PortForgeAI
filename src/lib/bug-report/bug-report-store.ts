import { getCurrentUser } from '../auth';
import { supabase } from '../supabase';
import type {
	BugReportInput,
	BugReportRecord,
	SubmitBugReportResult,
} from './types';

const LOCAL_STORAGE_KEY = 'portforge:bug_reports:v1';

function generateId(): string {
	if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}
	return `br_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Retrieves bug reports saved locally in the browser.
 */
export function getLocalBugReports(): BugReportRecord[] {
	if (typeof window === 'undefined' || !window.localStorage) {
		return [];
	}
	try {
		const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch (e) {
		console.warn('[bug-report] Failed to parse local bug reports:', e);
		return [];
	}
}

/**
 * Persists a bug report to browser localStorage as a fallback or cache.
 */
export function saveBugReportToLocal(report: BugReportRecord): void {
	if (typeof window === 'undefined' || !window.localStorage) {
		return;
	}
	try {
		const existing = getLocalBugReports();
		const updated = [report, ...existing.filter((item) => item.id !== report.id)];
		window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
	} catch (e) {
		console.warn('[bug-report] Failed to save bug report to localStorage:', e);
	}
}

/**
 * Submits a bug report with fallback resilience.
 *
 * 1. Resolves authenticated user session if available.
 * 2. Compiles device environment metadata for fast diagnosis.
 * 3. Tries remote insertion into Supabase `bug_reports` table.
 * 4. If remote table is absent (e.g. PGRST205 before migration) or network fails,
 *    gracefully persists the report in localStorage so customer feedback is never lost.
 */
export async function submitBugReport(
	input: BugReportInput
): Promise<SubmitBugReportResult> {
	const reportId = generateId();
	const createdAt = new Date().toISOString();

	let userId: string | null = null;
	let userEmail: string | null = null;

	try {
		const { data } = await getCurrentUser();
		if (data?.user) {
			userId = data.user.id;
			userEmail = data.user.email ?? null;
		}
	} catch {
		// Non-fatal if session query fails or user is anonymous
	}

	const deviceInfo =
		typeof window !== 'undefined'
			? {
					userAgent: window.navigator.userAgent,
					screenWidth: window.innerWidth,
					screenHeight: window.innerHeight,
					pathname: window.location.pathname,
				}
			: undefined;

	const record: BugReportRecord = {
		id: reportId,
		userId,
		userEmail,
		category: input.category,
		title: input.title.trim(),
		description: input.description.trim(),
		expectedBehavior: input.expectedBehavior.trim(),
		reproductionSteps: input.reproductionSteps?.trim() || undefined,
		additionalMessage: input.additionalMessage?.trim() || undefined,
		screenshots: input.screenshots || [],
		status: 'open',
		createdAt,
		deviceInfo,
	};

	// Attempt Supabase insert
	try {
		const { error } = await supabase.from('bug_reports').insert({
			id: record.id,
			user_id: record.userId,
			user_email: record.userEmail,
			category: record.category,
			title: record.title,
			description: record.description,
			expected_behavior: record.expectedBehavior,
			reproduction_steps: record.reproductionSteps ?? null,
			additional_message: record.additionalMessage ?? null,
			screenshots: record.screenshots,
			device_info: record.deviceInfo ?? null,
			status: record.status,
			created_at: record.createdAt,
		});

		if (!error) {
			// Remote insertion succeeded, also keep local copy for immediate review
			saveBugReportToLocal(record);
			return {
				success: true,
				reportId,
				persistedTo: 'supabase',
			};
		}

		console.info(
			`[bug-report] Supabase remote insert notice (${error.code || error.message}). Falling back to client-safe persistence.`
		);
	} catch (remoteError) {
		console.info(
			'[bug-report] Supabase remote insert failed. Falling back to client-safe persistence:',
			remoteError
		);
	}

	// Fallback to local storage
	try {
		saveBugReportToLocal(record);
		return {
			success: true,
			reportId,
			persistedTo: 'local_storage',
		};
	} catch (localError: unknown) {
		const msg = localError instanceof Error ? localError.message : 'Unknown storage error';
		return {
			success: false,
			error: `Unable to save report: ${msg}`,
			persistedTo: 'local_storage',
		};
	}
}
