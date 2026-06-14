import type { SupabaseClient } from '@supabase/supabase-js';

import {
  DEFAULT_PAGE_SIZE,
  paginateRange,
  type PaginatedResult,
} from '@/lib/pagination';
import type { AdminContactMessage } from '@/types/admin';

type Row = {
  id: string;
  title: string;
  email: string;
  content: string;
  created_at: string;
};

export async function listContactMessages(
  supabase: SupabaseClient,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<AdminContactMessage>> {
  const { from, to, page: safePage } = paginateRange(page, pageSize);

  const { data, error, count } = await supabase
    .from('contact_messages')
    .select('id,title,email,content,created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    items: ((data ?? []) as unknown as Row[]).map((r) => ({
      id: r.id,
      title: r.title,
      email: r.email,
      content: r.content,
      createdAt: r.created_at,
    })),
    total: count ?? 0,
    page: safePage,
    pageSize,
  };
}

