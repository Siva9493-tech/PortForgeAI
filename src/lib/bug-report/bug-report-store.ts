import { getCurrentUser } from '../auth';
import { supabase } from '../supabase';
import type {
	BugReportInput,
	BugReportRecord,
	SubmitBugReportResult,
} from './types';
import { generateId } from './bug-report-utils.ts';

const LOCAL_STORAGE_KEY = 'portforge:bug_reports:v1';

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
 * Persists a bug report to browser localStorage as a fallback draft or cache.
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
 * Dispatches a background request to the server-side developer notification endpoint.
 * Private credentials (RESEND_API_KEY / SMTP) stay on the server and are never exposed.
 */
async function notifyDeveloper(record: BugReportRecord): Promise<void> {
	if (typeof window === 'undefined') return;

	try {
		await fetch('/api/notify-bug-report', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				reportId: record.id,
				category: record.category,
				title: record.title,
				description: record.description,
				expectedBehavior: record.expectedBehavior,
				reproductionSteps: record.reproductionSteps,
				additionalMessage: record.additionalMessage,
				userEmail: record.userEmail,
				userId: record.userId,
				createdAt: record.createdAt,
				deviceInfo: record.deviceInfo,
				screenshotCount: record.screenshots.length,
				screenshots: record.screenshots.slice(0, 3).map((s) => ({
					name: s.name,
					type: s.type,
					size: s.size,
					dataUrl: s.size < 1024 * 1024 ? s.dataUrl : undefined,
				})),
			}),
		});
	} catch (e) {
		console.warn('[bug-report] Failed to dispatch developer notification:', e);
	}
}

/**
 * Submits a bug report with Supabase as the single authoritative source of truth.
 *
 * 1. Resolves authenticated user session if available.
 * 2. Compiles device environment metadata for fast diagnosis.
 * 3. Inserts the record into the Supabase `public.bug_reports` table.
 * 4. SUCCESS:
 *    - Triggers server-side developer notification (/api/notify-bug-report).
 *    - Retains a local cache for offline reference.
 *    - Returns { success: true, reportId, persistedTo: 'supabase' }.
 * 5. FAILURE:
 *    - Does NOT claim delivery to the developer.
 *    - Preserves input in localStorage as an unsent draft.
 *    - Returns { success: false, error: string, persistedTo: 'local_storage' }.
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

	// Attempt Supabase insert as authoritative destination
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

		if (error) {
			console.error('[bug-report] Supabase database insert failed:', error);
			// Retain unsent local draft so user's work isn't lost
			saveBugReportToLocal(record);

			let userFriendlyError = "We couldn't submit your report right now. Please try again.";
			if (error.code === 'PGRST205') {
				userFriendlyError = 'The bug reports database table is not initialized yet. Please notify the administrator.';
			} else if (error.message) {
				userFriendlyError = `Submission failed: ${error.message}`;
			}

			return {
				success: false,
				reportId,
				error: userFriendlyError,
				persistedTo: 'local_storage',
			};
		}

		// Supabase remote insertion succeeded!
		// Trigger server-side developer notification (async, non-blocking)
		notifyDeveloper(record).catch((notifyErr) => {
			console.warn('[bug-report] Developer notification background error:', notifyErr);
		});

		// Cache successful report locally for user reference
		saveBugReportToLocal(record);

		return {
			success: true,
			reportId,
			persistedTo: 'supabase',
		};
	} catch (remoteError: unknown) {
		console.error('[bug-report] Connection/network error during submission:', remoteError);
		// Retain unsent local draft
		saveBugReportToLocal(record);

		const msg =
			remoteError instanceof Error
				? remoteError.message
				: 'Network connection failed';

		return {
			success: false,
			reportId,
			error: `Connection error: ${msg}. Please check your connection and try again.`,
			persistedTo: 'local_storage',
		};
	}
}
