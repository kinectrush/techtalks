import type { SupabaseClient } from '@supabase/supabase-js';

import type { AdminCategory, AdminCategoryInput } from '@/types/admin';

function mapRow(row: {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  show_in_menu: boolean;
  created_at: string;
}): AdminCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    showInMenu: row.show_in_menu,
    createdAt: row.created_at,
  };
}

const SELECT =
  'id, slug, name, sort_order, is_active, show_in_menu, created_at';

export async function listAdminCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('categories')
    .select(SELECT)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function createAdminCategory(
  supabase: SupabaseClient,
  input: AdminCategoryInput,
) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      slug: input.slug,
      name: input.name,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      show_in_menu: input.showInMenu,
    })
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function updateAdminCategory(
  supabase: SupabaseClient,
  id: string,
  input: AdminCategoryInput,
) {
  const { data, error } = await supabase
    .from('categories')
    .update({
      slug: input.slug,
      name: input.name,
      sort_order: input.sortOrder,
      is_active: input.isActive,
      show_in_menu: input.showInMenu,
    })
    .eq('id', id)
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapRow(data);
}

export async function setAdminCategoryActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
) {
  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', id);

  if (error) throw error;
}
