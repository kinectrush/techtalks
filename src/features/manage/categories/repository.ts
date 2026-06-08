import type { SupabaseClient } from '@supabase/supabase-js';

import type { AdminCategory, AdminCategoryInput } from '@/types/admin';

type CategoryFlatRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  show_in_menu: boolean;
  parent_id: string | null;
  show_on_homepage: boolean;
  homepage_tagline: string | null;
  homepage_accent_color: string | null;
  created_at: string;
};

const SELECT_FLAT = `
  id,
  slug,
  name,
  sort_order,
  is_active,
  show_in_menu,
  parent_id,
  show_on_homepage,
  homepage_tagline,
  homepage_accent_color,
  created_at
`;

const SELECT_LEGACY =
  'id, slug, name, sort_order, is_active, show_in_menu, created_at';

function isMissingColumnError(error: { code?: string } | null): boolean {
  return Boolean(error && error.code === '42703');
}

async function loadParentNameMap(
  supabase: SupabaseClient,
  parentIds: string[],
): Promise<Map<string, string>> {
  if (!parentIds.length) return new Map();

  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .in('id', parentIds);

  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row.name]));
}

function mapFlatRow(
  row: CategoryFlatRow,
  parentNames: Map<string, string>,
): AdminCategory {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    showInMenu: row.show_in_menu,
    parentId: row.parent_id,
    parentName: row.parent_id ? (parentNames.get(row.parent_id) ?? null) : null,
    showOnHomepage: row.show_on_homepage,
    homepageTagline: row.homepage_tagline,
    homepageAccentColor: row.homepage_accent_color,
    createdAt: row.created_at,
  };
}

function mapLegacyRow(row: {
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
    parentId: null,
    parentName: null,
    showOnHomepage: false,
    homepageTagline: null,
    homepageAccentColor: null,
    createdAt: row.created_at,
  };
}

function toInsertPayload(input: AdminCategoryInput) {
  return {
    slug: input.slug,
    name: input.name,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    show_in_menu: input.showInMenu,
    parent_id: input.parentId ?? null,
    show_on_homepage: input.showOnHomepage ?? false,
    homepage_tagline: input.homepageTagline?.trim() || null,
    homepage_accent_color: input.homepageAccentColor?.trim() || null,
  };
}

async function mapFlatRows(
  supabase: SupabaseClient,
  rows: CategoryFlatRow[],
): Promise<AdminCategory[]> {
  const parentIds = [
    ...new Set(rows.map((row) => row.parent_id).filter(Boolean)),
  ] as string[];
  const parentNames = await loadParentNameMap(supabase, parentIds);
  return rows.map((row) => mapFlatRow(row, parentNames));
}

export async function listAdminCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('categories')
    .select(SELECT_FLAT)
    .order('sort_order', { ascending: true });

  if (isMissingColumnError(error)) {
    const legacy = await supabase
      .from('categories')
      .select(SELECT_LEGACY)
      .order('sort_order', { ascending: true });
    if (legacy.error) throw legacy.error;
    return (legacy.data ?? []).map(mapLegacyRow);
  }

  if (error) throw error;
  return mapFlatRows(supabase, (data ?? []) as CategoryFlatRow[]);
}

export async function createAdminCategory(
  supabase: SupabaseClient,
  input: AdminCategoryInput,
) {
  const { data, error } = await supabase
    .from('categories')
    .insert(toInsertPayload(input))
    .select(SELECT_FLAT)
    .single();

  if (isMissingColumnError(error)) {
    const legacy = await supabase
      .from('categories')
      .insert({
        slug: input.slug,
        name: input.name,
        sort_order: input.sortOrder,
        is_active: input.isActive,
        show_in_menu: input.showInMenu,
      })
      .select(SELECT_LEGACY)
      .single();
    if (legacy.error) throw legacy.error;
    return mapLegacyRow(legacy.data);
  }

  if (error) throw error;
  const [category] = await mapFlatRows(supabase, [data as CategoryFlatRow]);
  return category!;
}

export async function updateAdminCategory(
  supabase: SupabaseClient,
  id: string,
  input: AdminCategoryInput,
) {
  const { data, error } = await supabase
    .from('categories')
    .update(toInsertPayload(input))
    .eq('id', id)
    .select(SELECT_FLAT)
    .single();

  if (isMissingColumnError(error)) {
    const legacy = await supabase
      .from('categories')
      .update({
        slug: input.slug,
        name: input.name,
        sort_order: input.sortOrder,
        is_active: input.isActive,
        show_in_menu: input.showInMenu,
      })
      .eq('id', id)
      .select(SELECT_LEGACY)
      .single();
    if (legacy.error) throw legacy.error;
    return mapLegacyRow(legacy.data);
  }

  if (error) throw error;
  const [category] = await mapFlatRows(supabase, [data as CategoryFlatRow]);
  return category!;
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

export async function setAdminCategoryHomepageFeatured(
  supabase: SupabaseClient,
  id: string,
  showOnHomepage: boolean,
) {
  const { error } = await supabase
    .from('categories')
    .update({ show_on_homepage: showOnHomepage })
    .eq('id', id);

  if (error) throw error;
}

export async function listTopLevelCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name')
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  if (isMissingColumnError(error)) {
    const legacy = await supabase
      .from('categories')
      .select('id, slug, name')
      .order('sort_order', { ascending: true });
    if (legacy.error) throw legacy.error;
    return legacy.data ?? [];
  }

  if (error) throw error;
  return data ?? [];
}
