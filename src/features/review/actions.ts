'use server';

import { unstable_cache } from 'next/cache';

import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabasePublicClientIfConfigured } from '@/lib/supabase/public';
import type { HomePageData, ReviewCategory, ReviewSummary, TrendingWindow } from '@/types/review';

import {
  getHomePageData,
  sortByTrending,
} from './lib/review-repository';
import {
  resolveArticleBySlug,
  resolvePublicCategories,
  resolvePublishedArticles,
} from './lib/resolve-published-reviews';
import { getHomePageDataFromSupabase } from './lib/supabase-review-repository';

async function resolveHomePageData(): Promise<HomePageData> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      return await getHomePageDataFromSupabase(supabase);
    }
  }
  return getHomePageData();
}

export const getHomePageDataCached = unstable_cache(
  async (): Promise<HomePageData> => resolveHomePageData(),
  ['review-home-v2-db'],
  { revalidate: 120, tags: ['reviews', 'trending'] },
);

export async function getTrendingAction(
  window: TrendingWindow = '24h',
  limit = 10,
): Promise<ReviewSummary[]> {
  const summaries = await resolvePublishedArticles();
  return sortByTrending(summaries, window, limit);
}

export const getTrendingCached = unstable_cache(
  async (window: TrendingWindow, limit: number) =>
    getTrendingAction(window, limit),
  ['review-trending-v2-db'],
  { revalidate: 60, tags: ['trending'] },
);

export async function getLatestReviewsAction(limit = 12) {
  const summaries = await resolvePublishedArticles();
  return [...summaries]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}

export async function getReviewBySlugAction(slug: string) {
  return resolveArticleBySlug(slug);
}

export async function getReviewsListAction(categorySlug?: string) {
  return resolvePublishedArticles(categorySlug);
}

export async function getPublicCategoriesAction(): Promise<ReviewCategory[]> {
  return resolvePublicCategories();
}

export const getReviewsListCached = unstable_cache(
  async (categorySlug?: string) => resolvePublishedArticles(categorySlug),
  ['review-list-v2-db'],
  { revalidate: 120, tags: ['reviews'] },
);

export const getReviewBySlugCached = unstable_cache(
  async (slug: string) => resolveArticleBySlug(slug),
  ['review-detail-v2-db'],
  { revalidate: 120, tags: ['reviews'] },
);

/** For dashboard SWR / mock proxy — published summaries only. */
export async function getPublishedReviewsForClientAction(limit = 50) {
  const summaries = await resolvePublishedArticles();
  return summaries.slice(0, limit);
}
