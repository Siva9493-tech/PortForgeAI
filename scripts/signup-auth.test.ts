import { equal } from 'node:assert/strict';
import { test } from 'node:test';
import {
	isExistingUserResponse,
	EXISTING_EMAIL_MESSAGE,
} from '../src/lib/auth-utils.ts';

test('isExistingUserResponse identifies obfuscated response when identities is empty array', () => {
	const obfuscatedResponse = {
		user: {
			id: '12345',
			identities: [],
		},
	};
	equal(isExistingUserResponse(obfuscatedResponse, null), true);
});

test('isExistingUserResponse identifies explicit Supabase error messages', () => {
	equal(isExistingUserResponse(null, { message: 'User already registered' }), true);
	equal(isExistingUserResponse(null, { message: 'An account with this email already exists' }), true);
	equal(isExistingUserResponse(null, { message: 'Email already taken' }), true);
});

test('isExistingUserResponse returns false for new user with identities', () => {
	const newUserResponse = {
		user: {
			id: '12345',
			identities: [{ id: 'identity-1' }],
		},
	};
	equal(isExistingUserResponse(newUserResponse, null), false);
});

test('isExistingUserResponse returns false for unrelated errors', () => {
	equal(isExistingUserResponse(null, { message: 'Password should be at least 8 characters' }), false);
	equal(isExistingUserResponse(null, { message: 'Invalid email format' }), false);
});

test('EXISTING_EMAIL_MESSAGE matches required user-facing copy', () => {
	equal(EXISTING_EMAIL_MESSAGE, 'This email is already registered. Please sign in instead.');
});
