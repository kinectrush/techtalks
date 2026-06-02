import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env';

/**
 * Anonymous client for public RLS reads (published articles, categories).
 * Does not use cookies() — safe inside unstable_cache and static generation.
 */
export function createSupabasePublicClientIfConfigured(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
