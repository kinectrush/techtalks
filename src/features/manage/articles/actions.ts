'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import {
  createAdminArticle,
  getAdminArticleById,
  listAdminArticles,
  listAuthors,
  listCategories,
  setAdminArticleActive,
  updateAdminArticle,
} from '@/features/manage/articles/repository';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminArticleInput } from '@/types/admin';

async function guard() {
  await requireAdminUserAction();
  return createSupabaseAdminClient();
}

export async function listArticlesAction(search?: string) {
  const supabase = await guard();
  return listAdminArticles(supabase, search);
}

export async function getArticleAction(id: string) {
  const supabase = await guard();
  return getAdminArticleById(supabase, id);
}

export async function getArticleFormOptionsAction() {
  const supabase = await guard();
  const [categories, authors] = await Promise.all([
    listCategories(supabase),
    listAuthors(supabase),
  ]);
  return { categories, authors };
}

export async function createArticleAction(input: AdminArticleInput) {
  const supabase = await guard();
  const article = await createAdminArticle(supabase, input);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
  return article;
}

export async function updateArticleAction(id: string, input: AdminArticleInput) {
  const supabase = await guard();
  const article = await updateAdminArticle(supabase, id, input);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
  return article;
}

export async function toggleArticleActiveAction(id: string, isActive: boolean) {
  const supabase = await guard();
  await setAdminArticleActive(supabase, id, isActive);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
}
