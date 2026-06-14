import type { SupabaseClient } from '@supabase/supabase-js';

import { hashPassword } from '@/lib/manage/password';
import {
  DEFAULT_PAGE_SIZE,
  paginateRange,
  type PaginatedResult,
} from '@/lib/pagination';
import type { AdminUser, AdminUserInput } from '@/types/admin';

function mapUser(row: {
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

export async function listAdminUsers(
  supabase: SupabaseClient,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<AdminUser>> {
  const { from, to, page: safePage } = paginateRange(page, pageSize);

  const { data, error, count } = await supabase
    .from('admin_users')
    .select(
      'id, username, display_name, email, is_active, role, last_login_at, created_at, updated_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    items: (data ?? []).map(mapUser),
    total: count ?? 0,
    page: safePage,
    pageSize,
  };
}

export async function createAdminUser(
  supabase: SupabaseClient,
  input: AdminUserInput,
) {
  if (!input.password?.trim()) {
    throw new Error('Password is required');
  }

  const passwordHash = await hashPassword(input.password);
  const { data, error } = await supabase
    .from('admin_users')
    .insert({
      username: input.username.trim().toLowerCase(),
      display_name: input.displayName ?? null,
      email: input.email ?? null,
      password_hash: passwordHash,
      is_active: input.isActive,
      role: input.role,
    })
    .select(
      'id, username, display_name, email, is_active, role, last_login_at, created_at, updated_at',
    )
    .single();

  if (error) throw error;
  return mapUser(data);
}

export async function updateAdminUser(
  supabase: SupabaseClient,
  id: string,
  input: AdminUserInput,
) {
  const payload: Record<string, unknown> = {
    username: input.username.trim().toLowerCase(),
    display_name: input.displayName ?? null,
    email: input.email ?? null,
    is_active: input.isActive,
    role: input.role,
    updated_at: new Date().toISOString(),
  };

  if (input.password?.trim()) {
    payload.password_hash = await hashPassword(input.password);
  }

  const { data, error } = await supabase
    .from('admin_users')
    .update(payload)
    .eq('id', id)
    .select(
      'id, username, display_name, email, is_active, role, last_login_at, created_at, updated_at',
    )
    .single();

  if (error) throw error;
  return mapUser(data);
}

export async function setAdminUserActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
) {
  const { error } = await supabase
    .from('admin_users')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}
