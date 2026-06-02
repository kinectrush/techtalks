/** Supabase project: virrkdhzzxavcylbmsik */
export const SUPABASE_PROJECT_ID = 'virrkdhzzxavcylbmsik';

export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function requireSupabaseUrl(): string {
  const url = getSupabaseUrl();
  if (!url) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  return url;
}

export function requireSupabaseAnonKey(): string {
  const key = getSupabaseAnonKey();
  if (!key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return key;
}
