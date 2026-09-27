export const EXISTING_EMAIL_MESSAGE = 'This email is already registered. Please sign in instead.';

/**
 * Detects whether a signup response represents an existing registered account.
 * Handles both explicit errors and Supabase's anti-enumeration response (where
 * an existing email returns an obfuscated user object with an empty identities array).
 */
export function isExistingUserResponse(
	data: { user: { identities?: Array<unknown> } | null } | null | undefined,
	error: { message?: string; status?: number } | null | undefined,
): boolean {
	if (error && /already registered|already exists|already taken/i.test(error.message ?? '')) {
		return true;
	}
	if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
		return true;
	}
	return false;
}
