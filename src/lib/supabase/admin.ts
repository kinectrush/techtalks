import { createClient } from '@supabase/supabase-js';

import { requireSupabaseUrl } from '@/lib/supabase/env';

function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }
  return key;
}

/** Server-only Supabase client (bypasses RLS). Never import in client components. */
export function createSupabaseAdminClient() {
  return createClient(requireSupabaseUrl(), requireServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
