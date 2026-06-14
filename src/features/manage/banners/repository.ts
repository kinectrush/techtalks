import type { SupabaseClient } from '@supabase/supabase-js';

import type { AdBannerPlacement } from '@/lib/ad-banners/constants';
import {
  DEFAULT_PAGE_SIZE,
  paginateRange,
  type PaginatedResult,
} from '@/lib/pagination';
import type { AdBanner, AdBannerInput } from '@/types/ad-banner';

type DbBanner = {
  id: string;
  placement: string;
  name: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function mapBanner(row: DbBanner): AdBanner {
  return {
    id: row.id,
    placement: row.placement as AdBannerPlacement,
    name: row.name,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT =
  'id, placement, name, image_url, link_url, is_active, created_at, updated_at';

function toDbPayload(input: AdBannerInput) {
  return {
    placement: input.placement,
    name: input.name,
    image_url: input.imageUrl,
    link_url: input.linkUrl?.trim() || null,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };
}

async function deactivateSiblingsForPlacement(
  supabase: SupabaseClient,
  placement: AdBannerPlacement,
  exceptId?: string,
) {
  let query = supabase
    .from('ad_banners')
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq('placement', placement)
    .eq('is_active', true);

  if (exceptId) {
    query = query.neq('id', exceptId);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function listAdminBanners(
  supabase: SupabaseClient,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PaginatedResult<AdBanner>> {
  const { from, to, page: safePage } = paginateRange(page, pageSize);

  const { data, error, count } = await supabase
    .from('ad_banners')
    .select(SELECT, { count: 'exact' })
    .order('placement', { ascending: true })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    items: ((data ?? []) as DbBanner[]).map(mapBanner),
    total: count ?? 0,
    page: safePage,
    pageSize,
  };
}

export async function createAdminBanner(
  supabase: SupabaseClient,
  input: AdBannerInput,
) {
  if (input.isActive) {
    await deactivateSiblingsForPlacement(supabase, input.placement);
  }

  const { data, error } = await supabase
    .from('ad_banners')
    .insert(toDbPayload(input))
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapBanner(data as DbBanner);
}

export async function updateAdminBanner(
  supabase: SupabaseClient,
  id: string,
  input: AdBannerInput,
) {
  if (input.isActive) {
    await deactivateSiblingsForPlacement(supabase, input.placement, id);
  }

  const { data, error } = await supabase
    .from('ad_banners')
    .update(toDbPayload(input))
    .eq('id', id)
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapBanner(data as DbBanner);
}

export async function setAdminBannerActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
) {
  if (isActive) {
    const { data: row, error: fetchError } = await supabase
      .from('ad_banners')
      .select('placement')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!row) throw new Error('Banner not found');

    await deactivateSiblingsForPlacement(
      supabase,
      row.placement as AdBannerPlacement,
      id,
    );
  }

  const { error } = await supabase
    .from('ad_banners')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAdminBanner(
  supabase: SupabaseClient,
  id: string,
) {
  const { error } = await supabase.from('ad_banners').delete().eq('id', id);
  if (error) throw error;
}
