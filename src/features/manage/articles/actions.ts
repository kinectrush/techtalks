'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminUserAction } from '@/features/manage/auth/actions';
import {
  createAdminArticle,
  deleteAdminArticle,
  duplicateAdminArticle,
  getAdminArticleById,
  getTotalArticleViews,
  listAdminArticles,
  listArticleFormCategories,
  listAuthors,
  listCategories,
  setAdminArticleActive,
  updateAdminArticle,
} from '@/features/manage/articles/repository';
import { DEFAULT_PAGE_SIZE } from '@/lib/pagination';
import { notifyGoogleSitemapIfPublished } from '@/lib/seo/ping-google-sitemap';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AdminArticleInput } from '@/types/admin';

async function guard() {
  await requireAdminUserAction();
  return createSupabaseAdminClient();
}

type ListArticlesOptions = {
  search?: string;
  parentCategoryId?: string;
  subcategoryId?: string;
  page?: number;
  pageSize?: number;
};

export async function listArticlesAction(options: ListArticlesOptions = {}) {
  const supabase = await guard();
  return listAdminArticles(supabase, {
    search: options.search,
    parentCategoryId: options.parentCategoryId,
    subcategoryId: options.subcategoryId,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
  });
}

export async function getTotalArticleViewsAction() {
  const supabase = await guard();
  return getTotalArticleViews(supabase);
}

export async function getArticleAction(id: string) {
  const supabase = await guard();
  return getAdminArticleById(supabase, id);
}

export async function getArticleFormOptionsAction() {
  const supabase = await guard();
  const [categories, authors] = await Promise.all([
    listArticleFormCategories(supabase),
    listAuthors(supabase),
  ]);
  return { categories, authors };
}

export async function createArticleAction(input: AdminArticleInput) {
  const supabase = await guard();
  const article = await createAdminArticle(supabase, input);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
  notifyGoogleSitemapIfPublished(input);
  return article;
}

export async function updateArticleAction(id: string, input: AdminArticleInput) {
  const supabase = await guard();
  const article = await updateAdminArticle(supabase, id, input);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
  notifyGoogleSitemapIfPublished(input);
  return article;
}

export async function toggleArticleActiveAction(id: string, isActive: boolean) {
  const supabase = await guard();
  if (isActive) {
    const existing = await getAdminArticleById(supabase, id);
    await setAdminArticleActive(supabase, id, isActive);
    if (existing) {
      notifyGoogleSitemapIfPublished({
        status: existing.status,
        isActive: true,
      });
    }
  } else {
    await setAdminArticleActive(supabase, id, isActive);
  }
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
}

export async function duplicateArticleAction(id: string) {
  const supabase = await guard();
  const article = await duplicateAdminArticle(supabase, id);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
  return article;
}

export async function deleteArticleAction(id: string) {
  const supabase = await guard();
  await deleteAdminArticle(supabase, id);
  revalidatePath('/manage/admin/articles');
  revalidatePath('/', 'layout');
}
