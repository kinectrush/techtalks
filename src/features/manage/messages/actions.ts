'use server';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import { listContactMessages } from './repository';

async function guard() {
  await requireAdminUserAction();
  return createSupabaseAdminClient();
}

export async function listContactMessagesAction(limit?: number) {
  const supabase = await guard();
  return listContactMessages(supabase, limit);
}

