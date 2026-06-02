'use server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { hashPassword, verifyPassword } from '@/lib/manage/password';
import {
  clearAdminSessionCookies,
  readAdminSession,
  setAdminSessionCookies,
} from '@/lib/manage/session';
import type { AdminUser } from '@/types/admin';

export type AdminLoginPayload = {
  username: string;
  password: string;
};

function mapAdminUser(row: {
  id: string;
  username: string;
  display_name: string | null;
  email: string | null;
  is_active: boolean;
  role: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}): AdminUser {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    email: row.email,
    isActive: row.is_active,
    role: row.role as AdminUser['role'],
    lastLoginAt: row.last_login_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function adminLoginAction(payload: AdminLoginPayload) {
  const username = payload.username.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();

  const { data: row, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .maybeSingle();

  if (error || !row) {
    return { success: false as const, error: 'Invalid credentials' };
  }

  if (!row.is_active) {
    return { success: false as const, error: 'Account is disabled' };
  }

  const valid = await verifyPassword(payload.password, row.password_hash);
  if (!valid) {
    return { success: false as const, error: 'Invalid credentials' };
  }

  await supabase
    .from('admin_users')
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  await setAdminSessionCookies({
    userId: row.id,
    username: row.username,
    role: row.role,
  });

  return {
    success: true as const,
    user: mapAdminUser(row),
  };
}

export async function adminLogoutAction() {
  await clearAdminSessionCookies();
  return { success: true as const };
}

export async function getAdminSessionAction() {
  const session = await readAdminSession();
  if (!session) return null;

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('admin_users')
    .select(
      'id, username, display_name, email, is_active, role, last_login_at, created_at, updated_at',
    )
    .eq('id', session.userId)
    .maybeSingle();

  if (!data || !data.is_active) {
    return null;
  }

  return mapAdminUser(data);
}

export async function requireAdminUserAction() {
  const user = await getAdminSessionAction();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}
