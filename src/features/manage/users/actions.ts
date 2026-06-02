'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import {
  createAdminUser,
  listAdminUsers,
  setAdminUserActive,
  updateAdminUser,
} from '@/features/manage/users/repository';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminUserInput } from '@/types/admin';

async function guard() {
  const current = await requireAdminUserAction();
  const supabase = createSupabaseAdminClient();
  return { supabase, current };
}

export async function listUsersAction() {
  const { supabase } = await guard();
  return listAdminUsers(supabase);
}

export async function createUserAction(input: AdminUserInput) {
  const { supabase } = await guard();
  const user = await createAdminUser(supabase, input);
  revalidatePath('/manage/admin/users');
  return user;
}

export async function updateUserAction(id: string, input: AdminUserInput) {
  const { supabase, current } = await guard();
  if (current.id === id && !input.isActive) {
    throw new Error('Cannot deactivate your own account');
  }
  const user = await updateAdminUser(supabase, id, input);
  revalidatePath('/manage/admin/users');
  return user;
}

export async function toggleUserActiveAction(id: string, isActive: boolean) {
  const { supabase, current } = await guard();
  if (current.id === id && !isActive) {
    throw new Error('Cannot deactivate your own account');
  }
  await setAdminUserActive(supabase, id, isActive);
  revalidatePath('/manage/admin/users');
}
