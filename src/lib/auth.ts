import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
}

export async function resetPassword(email: string) {
  return supabase.auth.resetPasswordForEmail(email);
}

export async function getCurrentUser() {
  return supabase.auth.getUser();
}

export async function getCurrentSession() {
  return supabase.auth.getSession();
}

export type AuthStateListener = (event: AuthChangeEvent, session: Session | null) => void;

/**
 * Subscribe to authentication state changes (initial session restore, sign in,
 * refresh, sign out). Returns an unsubscribe function.
 */
export function onAuthStateChange(callback: AuthStateListener) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
  return () => data.subscription.unsubscribe();
}

/** Resolves true when a signed-in session exists for the current visitor. */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await getCurrentSession();
  return data.session !== null;
}

/** Resolves the current session, or null when unauthenticated. */
export async function getAuth(): Promise<Session | null> {
  const { data } = await getCurrentSession();
  return data.session;
}

/** Resolves once the auth client has restored the persisted session on load. */
export function waitForInitialAuth(): Promise<Session | null> {
  return new Promise((resolve) => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        data.subscription.unsubscribe();
        resolve(session);
      }
    });
  });
}

export { EXISTING_EMAIL_MESSAGE, isExistingUserResponse } from './auth-utils';

/**
 * Fields a caller may set when writing a `public.profiles` row. Omitted fields
 * are left out of the write entirely (never forced to null), so a caller that
 * has no name to supply cannot clobber a stored `full_name`.
 */
export type ProfileInput = {
	full_name?: string | null;
	avatar_url?: string | null;
};

/**
 * Writes (upserts) the authenticated user's `public.profiles` row through the
 * browser Supabase client — never a service-role key. The user id always comes
 * from the authenticated `User`, so it can never be spoofed from a form field or
 * localStorage.
 */
export async function upsertProfile(
	user: Pick<User, 'id'>,
	input: ProfileInput,
): Promise<{ error: Error | null }> {
	const row: Record<string, unknown> = { id: user.id };
	if (input.full_name !== undefined) {
		row.full_name = input.full_name;
	}
	if (input.avatar_url !== undefined) {
		row.avatar_url = input.avatar_url;
	}

	const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });

	if (error) {
		console.error(`[auth] Failed to upsert profile for user ${user.id}:`, error.message);
	}

	return { error };
}

/**
 * Resolves a display name from Auth user metadata (used for OAuth accounts where
 * Google may supply one). Returns null when no real string name is present, so
 * we never invent one.
 */
function metadataFullName(user: Pick<User, 'user_metadata'>): string | null {
	const meta = user.user_metadata;
	const raw = meta?.full_name ?? meta?.name ?? meta?.given_name;
	return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

/**
 * Ensures a `public.profiles` row exists for the authenticated user without
 * disturbing an existing profile. It reads the row first and only writes when it
 * is missing, so an existing profile (including a stored `full_name`) is never
 * overwritten with metadata or blank data.
 *
 * Used after login and after an OAuth redirect back to the app, where no name is
 * being supplied by the user this turn.
 */
export async function ensureUserProfile(
	user: Pick<User, 'id' | 'user_metadata'>,
): Promise<{ error: Error | null }> {
	try {
		const { data: existing, error: selectError } = await supabase
			.from('profiles')
			.select('id')
			.eq('id', user.id)
			.maybeSingle();

		if (selectError) {
			throw selectError;
		}

		if (existing) {
			return { error: null };
		}

		const full_name = metadataFullName(user);
		return upsertProfile(user, { full_name, avatar_url: null });
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[auth] Failed to ensure profile for user ${user.id}:`, message);
		return { error: error as Error };
	}
}
