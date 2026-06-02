import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  requireSupabaseAnonKey,
  requireSupabaseUrl,
} from '@/lib/supabase/env';

export async function createSupabaseServerClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll from Server Component — ignore when middleware refreshes session
        }
      },
    },
  });
}

export async function createSupabaseServerClientIfConfigured() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // ignore
        }
      },
    },
  });
}

export async function createSupabaseServerClientRequired() {
  const cookieStore = await cookies();

  return createServerClient(
    requireSupabaseUrl(),
    requireSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // ignore
          }
        },
      },
    },
  );
}
