import { createBrowserClient } from '@supabase/ssr';

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  requireSupabaseAnonKey,
  requireSupabaseUrl,
} from '@/lib/supabase/env';

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }
  return createBrowserClient(url, key);
}

/** Returns null when env vars are missing (e.g. local dev without Supabase). */
export function createSupabaseBrowserClientIfConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export function createSupabaseBrowserClientRequired() {
  return createBrowserClient(
    requireSupabaseUrl(),
    requireSupabaseAnonKey(),
  );
}
