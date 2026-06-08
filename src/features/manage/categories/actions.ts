'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import {
  createAdminCategory,
  listAdminCategories,
  setAdminCategoryActive,
  setAdminCategoryHomepageFeatured,
  updateAdminCategory,
} from '@/features/manage/categories/repository';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminCategoryInput } from '@/types/admin';

async function guard() {
  await requireAdminUserAction();
  return createSupabaseAdminClient();
}

export async function listCategoriesAction() {
  const supabase = await guard();
  return listAdminCategories(supabase);
}

export async function createCategoryAction(input: AdminCategoryInput) {
  const supabase = await guard();
  const category = await createAdminCategory(supabase, input);
  revalidatePath('/manage/admin/categories');
  revalidatePath('/', 'layout');
  return category;
}

export async function updateCategoryAction(
  id: string,
  input: AdminCategoryInput,
) {
  const supabase = await guard();
  const category = await updateAdminCategory(supabase, id, input);
  revalidatePath('/manage/admin/categories');
  revalidatePath('/', 'layout');
  return category;
}

export async function toggleCategoryActiveAction(
  id: string,
  isActive: boolean,
) {
  const supabase = await guard();
  await setAdminCategoryActive(supabase, id, isActive);
  revalidatePath('/manage/admin/categories');
  revalidatePath('/', 'layout');
}

export async function toggleCategoryHomepageFeaturedAction(
  id: string,
  showOnHomepage: boolean,
) {
  const supabase = await guard();
  await setAdminCategoryHomepageFeatured(supabase, id, showOnHomepage);
  revalidatePath('/manage/admin/categories');
  revalidatePath('/', 'layout');
}
