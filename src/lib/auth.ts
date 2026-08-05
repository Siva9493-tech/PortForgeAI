import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
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
      if (event === 'INITIAL_SESSION') {
        data.subscription.unsubscribe();
        resolve(session);
      }
    });
  });
}
