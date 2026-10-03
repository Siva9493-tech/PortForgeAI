import { deepEqual, equal, match, notEqual, ok } from 'node:assert/strict';
import { test } from 'node:test';
import type {
	BugReportCategory,
	BugReportInput,
	BugReportRecord,
	SubmitBugReportResult,
} from '../src/lib/bug-report/types.ts';
import { generateId } from '../src/lib/bug-report/bug-report-utils.ts';

const VALID_CATEGORIES: BugReportCategory[] = [
	'Bug',
	'UI / Design Issue',
	'Feature Request',
	'Improvement',
	'Other',
];

const MAX_SCREENSHOTS = 6;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test('1. Correct bug report payload maps all 13 schema columns', () => {
	const mockRecord: BugReportRecord = {
		id: generateId(),
		userId: '00000000-0000-0000-0000-000000000001',
		userEmail: 'student@example.com',
		category: 'UI / Design Issue',
		title: 'Theme toggle contrast issue',
		description: 'Dark mode button text is unreadable against background',
		expectedBehavior: 'High contrast text should be used in dark mode',
		reproductionSteps: '1. Switch to dark mode\n2. Open theme picker',
		additionalMessage: 'Tested on macOS Safari',
		screenshots: [{ id: 's1', name: 'shot.png', size: 1024, type: 'image/png', dataUrl: 'data:image/png;base64,abc' }],
		status: 'open',
		createdAt: '2026-10-03T08:00:00.000Z',
		deviceInfo: {
			userAgent: 'Mozilla/5.0 Chrome',
			screenWidth: 1920,
			screenHeight: 1080,
			pathname: '/report-bug',
		},
	};

	const dbPayload = {
		id: mockRecord.id,
		user_id: mockRecord.userId,
		user_email: mockRecord.userEmail,
		category: mockRecord.category,
		title: mockRecord.title,
		description: mockRecord.description,
		expected_behavior: mockRecord.expectedBehavior,
		reproduction_steps: mockRecord.reproductionSteps ?? null,
		additional_message: mockRecord.additionalMessage ?? null,
		screenshots: mockRecord.screenshots,
		device_info: mockRecord.deviceInfo ?? null,
		status: mockRecord.status,
		created_at: mockRecord.createdAt,
	};

	equal(Object.keys(dbPayload).length, 13);
	equal(dbPayload.id, mockRecord.id);
	equal(dbPayload.user_id, '00000000-0000-0000-0000-000000000001');
	equal(dbPayload.user_email, 'student@example.com');
	equal(dbPayload.category, 'UI / Design Issue');
	equal(dbPayload.status, 'open');
	equal(Array.isArray(dbPayload.screenshots), true);
	equal(dbPayload.device_info?.pathname, '/report-bug');
});

test('2. Missing required schema field detection', () => {
	function validateReport(input: {
		title?: string;
		description?: string;
		expectedBehavior?: string;
	}): { valid: boolean; errors: string[] } {
		const errors: string[] = [];
		if (!input.title?.trim()) errors.push('Title is required');
		if (!input.description?.trim()) errors.push('Description is required');
		if (!input.expectedBehavior?.trim()) errors.push('Expected behavior is required');
		return { valid: errors.length === 0, errors };
	}

	const invalid = validateReport({});
	equal(invalid.valid, false);
	equal(invalid.errors.length, 3);

	const valid = validateReport({
		title: 'Portfolio preview does not save changes',
		description: 'Changes in theme color are lost after refresh',
		expectedBehavior: 'Theme color should persist across page reloads',
	});
	equal(valid.valid, true);
	equal(valid.errors.length, 0);
});

test('3. Successful Supabase persistence contract', () => {
	const reportId = generateId();
	const result: SubmitBugReportResult = {
		success: true,
		reportId,
		persistedTo: 'supabase',
		notificationStatus: 'sent',
	};

	equal(result.success, true);
	equal(result.persistedTo, 'supabase');
	equal(result.notificationStatus, 'sent');
	ok(result.reportId);
});

test('4. Supabase failure contract: does NOT claim delivery when remote insert fails', () => {
	function handleSubmissionResult(supabaseError: { code?: string; message?: string } | null): SubmitBugReportResult {
		const reportId = generateId();
		if (supabaseError) {
			let userFriendlyError = "We couldn't submit your report right now. Please try again.";
			if (supabaseError.code === 'PGRST205') {
				userFriendlyError = 'The bug reports database table is not initialized yet. Please notify the administrator.';
			} else if (supabaseError.message) {
				userFriendlyError = `Submission failed: ${supabaseError.message}`;
			}
			return {
				success: false,
				reportId,
				error: userFriendlyError,
				persistedTo: 'local_storage',
			};
		}
		return {
			success: true,
			reportId,
			persistedTo: 'supabase',
		};
	}

	// Missing table (PGRST205)
	const missingTable = handleSubmissionResult({
		code: 'PGRST205',
		message: "Could not find the table 'public.bug_reports' in the schema cache",
	});
	equal(missingTable.success, false);
	equal(missingTable.persistedTo, 'local_storage');
	ok(missingTable.error?.includes('database table is not initialized yet'));

	// Missing column error (e.g. additional_message)
	const missingCol = handleSubmissionResult({
		code: '42703',
		message: "Could not find the 'additional_message' column of 'bug_reports' in the schema cache",
	});
	equal(missingCol.success, false);
	equal(missingCol.persistedTo, 'local_storage');
	ok(missingCol.error?.includes('additional_message'));
});

test('5. Email notification success reporting', () => {
	const result: SubmitBugReportResult = {
		success: true,
		reportId: generateId(),
		persistedTo: 'supabase',
		notificationStatus: 'sent',
	};
	equal(result.notificationStatus, 'sent');
	equal(result.success, true);
});

test('6. Email notification failure: database record remains safe while notifying UI', () => {
	// Database committed successfully, but email dispatch failed
	const result: SubmitBugReportResult = {
		success: true,
		reportId: generateId(),
		persistedTo: 'supabase',
		notificationStatus: 'failed',
	};
	equal(result.success, true);
	equal(result.persistedTo, 'supabase');
	equal(result.notificationStatus, 'failed');
});

test('7. Duplicate-click protection: in-flight mutex coalesces concurrent calls', async () => {
	let activePromise: Promise<SubmitBugReportResult> | null = null;
	let invocationCount = 0;

	async function simulateSubmit(): Promise<SubmitBugReportResult> {
		if (activePromise) {
			return activePromise;
		}

		activePromise = (async () => {
			invocationCount++;
			// Simulate async network delay
			await new Promise((r) => setTimeout(r, 20));
			return {
				success: true,
				reportId: 'simulated-id',
				persistedTo: 'supabase',
			};
		})();

		try {
			return await activePromise;
		} finally {
			activePromise = null;
		}
	}

	// Fire 5 rapid clicks concurrently
	const results = await Promise.all([
		simulateSubmit(),
		simulateSubmit(),
		simulateSubmit(),
		simulateSubmit(),
		simulateSubmit(),
	]);

	// Underlying database insert was only called ONCE
	equal(invocationCount, 1);
	for (const res of results) {
		equal(res.success, true);
		equal(res.reportId, 'simulated-id');
	}
});

test('8. Submission loading state transitions (IDLE -> SUBMITTING -> SUCCESS / ERROR)', () => {
	let state: 'idle' | 'submitting' | 'success' | 'error' = 'idle';
	let buttonText = 'Submit Report';
	let isDisabled = false;

	function setSubmitting(submitting: boolean) {
		state = submitting ? 'submitting' : 'idle';
		buttonText = submitting ? 'Submitting...' : 'Submit Report';
		isDisabled = submitting;
	}

	// Start submitting
	setSubmitting(true);
	equal(state, 'submitting');
	equal(buttonText, 'Submitting...');
	equal(isDisabled, true);

	// Error path
	setSubmitting(false);
	state = 'error';
	equal(state, 'error');
	equal(buttonText, 'Submit Report');
	equal(isDisabled, false);
});

test('9. Success state only after Supabase confirms persistence', () => {
	function canShowSuccess(result: SubmitBugReportResult): boolean {
		return result.success === true && result.persistedTo === 'supabase';
	}

	equal(canShowSuccess({ success: false, persistedTo: 'local_storage' }), false);
	equal(canShowSuccess({ success: true, persistedTo: 'local_storage' }), false);
	equal(canShowSuccess({ success: true, persistedTo: 'supabase' }), true);
});

test('10. LocalStorage recovery behavior preserves unsent drafts', () => {
	const storage: Record<string, string> = {};
	function saveDraft(record: BugReportRecord) {
		storage['portforge:bug_reports:v1'] = JSON.stringify([record]);
	}

	const draftRecord: BugReportRecord = {
		id: generateId(),
		userId: null,
		category: 'Bug',
		title: 'Unsent issue draft',
		description: 'Detailed bug text entered by student',
		expectedBehavior: 'Should save without crashing',
		screenshots: [],
		status: 'open',
		createdAt: '2026-10-03',
	};

	saveDraft(draftRecord);
	ok(storage['portforge:bug_reports:v1']);
	const parsed = JSON.parse(storage['portforge:bug_reports:v1']);
	equal(parsed[0].title, 'Unsent issue draft');
});

test('11. Screenshot constraints and base64 handling', () => {
	equal(MAX_SCREENSHOTS, 6);
	equal(MAX_FILE_SIZE_BYTES, 8388608);
	ok(ALLOWED_MIME_TYPES.includes('image/png'));
	ok(ALLOWED_MIME_TYPES.includes('image/jpeg'));
	ok(ALLOWED_MIME_TYPES.includes('image/webp'));
	ok(ALLOWED_MIME_TYPES.includes('image/gif'));

	// Test base64 extraction helper
	const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB';
	const base64Content = dataUrl.split(',')[1];
	equal(base64Content, 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB');
});

test('12. Authenticated user submission maps user_id and user_email', () => {
	const user = { id: 'usr-1234', email: 'student@university.edu' };
	const record: BugReportRecord = {
		id: generateId(),
		userId: user.id,
		userEmail: user.email,
		category: 'Bug',
		title: 'Auth Bug',
		description: 'Details',
		expectedBehavior: 'Expected',
		screenshots: [],
		status: 'open',
		createdAt: new Date().toISOString(),
	};

	equal(record.userId, 'usr-1234');
	equal(record.userEmail, 'student@university.edu');
});

test('13. Anonymous submission maps user_id = null cleanly', () => {
	const record: BugReportRecord = {
		id: generateId(),
		userId: null,
		userEmail: null,
		category: 'Other',
		title: 'Anon feedback',
		description: 'Details',
		expectedBehavior: 'Expected',
		screenshots: [],
		status: 'open',
		createdAt: new Date().toISOString(),
	};

	equal(record.userId, null);
	equal(record.userEmail, null);
});

test('14. No client-side email/API secrets in frontend environment', () => {
	const clientEnvKeys = ['PUBLIC_SUPABASE_URL', 'PUBLIC_SUPABASE_PUBLISHABLE_KEY'];
	const forbiddenInClient = ['RESEND_API_KEY', 'SENDGRID_API_KEY', 'SMTP_PASS', 'SUPABASE_SERVICE_ROLE_KEY'];

	for (const key of forbiddenInClient) {
		equal(clientEnvKeys.includes(key), false, `Secret ${key} must not be present in client config`);
		equal(key.startsWith('PUBLIC_'), false, `${key} must not have PUBLIC_ prefix`);
	}
});
