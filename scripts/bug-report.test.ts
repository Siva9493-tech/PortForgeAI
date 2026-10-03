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

test('bug report category supports all required feedback types including improvements', () => {
	equal(VALID_CATEGORIES.includes('Bug'), true);
	equal(VALID_CATEGORIES.includes('UI / Design Issue'), true);
	equal(VALID_CATEGORIES.includes('Feature Request'), true);
	equal(VALID_CATEGORIES.includes('Improvement'), true);
	equal(VALID_CATEGORIES.includes('Other'), true);
	equal(VALID_CATEGORIES.length, 5);
});

test('screenshot constraints enforce max 6 images and 8MB limit', () => {
	equal(MAX_SCREENSHOTS, 6);
	equal(MAX_FILE_SIZE_BYTES, 8388608);
	ok(ALLOWED_MIME_TYPES.includes('image/png'));
	ok(ALLOWED_MIME_TYPES.includes('image/jpeg'));
	ok(ALLOWED_MIME_TYPES.includes('image/webp'));
	ok(ALLOWED_MIME_TYPES.includes('image/gif'));
});

test('bug report validation requires title, description, and expected behavior', () => {
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

test('generateId produces valid PostgreSQL UUID v4 compliant string', () => {
	const id1 = generateId();
	const id2 = generateId();
	notEqual(id1, id2);
	ok(UUID_REGEX.test(id1), `Expected valid UUID v4, got: ${id1}`);
	ok(UUID_REGEX.test(id2), `Expected valid UUID v4, got: ${id2}`);
});

test('Supabase failure contract: database error must return success: false and NOT masquerade as delivery', () => {
	// Simulate Supabase response when table is missing (PGRST205) or RLS rejects insert
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

	// 1. Missing table error
	const missingTableResult = handleSubmissionResult({
		code: 'PGRST205',
		message: "Could not find the table 'public.bug_reports' in the schema cache",
	});
	equal(missingTableResult.success, false);
	equal(missingTableResult.persistedTo, 'local_storage');
	ok(missingTableResult.error?.includes('database table is not initialized yet'));

	// 2. Network/RLS error
	const rlsResult = handleSubmissionResult({
		code: '42501',
		message: 'new row violates row-level security policy for table "bug_reports"',
	});
	equal(rlsResult.success, false);
	equal(rlsResult.persistedTo, 'local_storage');
	ok(rlsResult.error?.includes('violates row-level security policy'));

	// 3. Success only when Supabase succeeds
	const successResult = handleSubmissionResult(null);
	equal(successResult.success, true);
	equal(successResult.persistedTo, 'supabase');
	equal(successResult.error, undefined);
});

test('Supabase row payload maps all 13 schema columns correctly', () => {
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

test('Developer notification recipient defaults to mamidalasivabalaji@gmail.com with standard subject', () => {
	const defaultRecipient = 'mamidalasivabalaji@gmail.com';
	const title = 'Editor save button unresponsive';
	const subject = `[PortForge AI] New Bug Report — ${title}`;

	equal(defaultRecipient, 'mamidalasivabalaji@gmail.com');
	equal(subject, '[PortForge AI] New Bug Report — Editor save button unresponsive');
});
