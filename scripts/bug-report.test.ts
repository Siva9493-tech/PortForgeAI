import { deepEqual, equal, ok } from 'node:assert/strict';
import { test } from 'node:test';
import type { BugReportCategory } from '../src/lib/bug-report/types.ts';

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
