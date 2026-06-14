'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import {
  createAdminBanner,
  deleteAdminBanner,
  listAdminBanners,
  setAdminBannerActive,
  updateAdminBanner,
} from '@/features/manage/banners/repository';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdBannerInput } from '@/types/ad-banner';

async function guard() {
  await requireAdminUserAction();
  return createSupabaseAdminClient();
}

function revalidateBannerPaths() {
  revalidatePath('/manage/admin/banners');
  revalidatePath('/', 'layout');
  revalidateTag('ad-banners', 'max');
}

export async function listBannersAction(page = 1, pageSize = DEFAULT_PAGE_SIZE) {
  const supabase = await guard();
  return listAdminBanners(supabase, page, pageSize);
}

export async function createBannerAction(input: AdBannerInput) {
  const supabase = await guard();
  const banner = await createAdminBanner(supabase, input);
  revalidateBannerPaths();
  return banner;
}

export async function updateBannerAction(id: string, input: AdBannerInput) {
  const supabase = await guard();
  const banner = await updateAdminBanner(supabase, id, input);
  revalidateBannerPaths();
  return banner;
}

export async function toggleBannerActiveAction(id: string, isActive: boolean) {
  const supabase = await guard();
  await setAdminBannerActive(supabase, id, isActive);
  revalidateBannerPaths();
}

export async function deleteBannerAction(id: string) {
  const supabase = await guard();
  await deleteAdminBanner(supabase, id);
  revalidateBannerPaths();
}
