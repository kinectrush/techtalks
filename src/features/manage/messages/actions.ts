'use server';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import { listContactMessages } from './repository';

async function guard() {
  await requireAdminUserAction();
  return createSupabaseAdminClient();
}

export async function listContactMessagesAction(
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const supabase = await guard();
  return listContactMessages(supabase, page, pageSize);
}

