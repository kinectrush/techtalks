import type { SupabaseClient } from '@supabase/supabase-js';

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
  limit = 200,
): Promise<AdminContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id,title,email,content,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    title: r.title,
    email: r.email,
    content: r.content,
    createdAt: r.created_at,
  }));
}

