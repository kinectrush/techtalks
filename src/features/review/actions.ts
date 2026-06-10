'use server';

import { unstable_cache } from 'next/cache';

import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabasePublicClientIfConfigured } from '@/lib/supabase/public';
import { REVIEWS_PAGE_SIZE } from '@/lib/reviews/constants';
import {
  SEARCH_RESULTS_LIMIT,
  normalizeSearchQuery,
} from '@/lib/search/normalize-query';
import type { PaginatedResponse } from '@/types/api';
import type { FeaturedMatchTicker } from '@/types/world-cup';
import {
  enrichHomePageWithWorldCupData,
  resolveFeaturedMatchTicker,
  stripWorldCupLiveData,
} from '@/lib/world-cup/enrich-with-live-data';

import {
  getHomePageData,
  sortByTrending,
} from './lib/review-repository';
import type {
  HomePageData,
  ReviewCategory,
  ReviewSearchResult,
  ReviewSummary,
  TrendingWindow,
} from '@/types/review';
import {
  resolveArticleBySlug,
  resolveCategoryLabel,
  resolvePublicCategories,
  resolvePublishedArticles,
  resolvePublishedArticlesPaginated,
  resolveSearchArticles,
  resolveSearchArticlesPaginated,
} from './lib/resolve-published-reviews';
import { resolveRelatedArticles } from './lib/resolve-related-articles';
import { getHomePageDataFromSupabase } from './lib/supabase-review-repository';

async function resolveHomePageData(): Promise<HomePageData> {
  let data: HomePageData;
  try {
    if (isSupabaseConfigured()) {
      const supabase = createSupabasePublicClientIfConfigured();
      if (supabase) {
        data = await getHomePageDataFromSupabase(supabase);
      } else {
        data = getHomePageData();
      }
    } else {
      data = getHomePageData();
    }
  } catch (error) {
    console.error('[review-home] data fetch failed, using fallback', error);
    data = getHomePageData();
  }

  try {
    return await enrichHomePageWithWorldCupData(data);
  } catch (error) {
    console.error('[review-home] world-cup enrichment failed', error);
    return stripWorldCupLiveData(data);
  }
}

export const getHomePageDataCached = unstable_cache(
  async (): Promise<HomePageData> => resolveHomePageData(),
  ['review-home-v6-football-data'],
  { revalidate: 120, tags: ['reviews', 'trending', 'world-cup'] },
);

export const getFeaturedMatchTickerCached = unstable_cache(
  async (): Promise<FeaturedMatchTicker> => {
    const data = await resolveHomePageData();
    return resolveFeaturedMatchTicker(data);
  },
  ['featured-match-ticker-v3-football-data'],
  { revalidate: 120, tags: ['reviews', 'trending', 'world-cup'] },
);

export async function getCategoryLabelAction(slug: string) {
  return resolveCategoryLabel(slug);
}

export const getCategoryLabelCached = unstable_cache(
  async (slug: string) => resolveCategoryLabel(slug),
  ['review-category-label'],
  { revalidate: 120, tags: ['reviews'] },
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

export async function getReviewsListPaginatedAction(
  options?: { categorySlug?: string; page?: number; pageSize?: number },
): Promise<PaginatedResponse<ReviewSummary>> {
  return resolvePublishedArticlesPaginated({
    categorySlug: options?.categorySlug,
    page: options?.page,
    pageSize: options?.pageSize ?? REVIEWS_PAGE_SIZE,
  });
}

function toSearchResult(article: ReviewSummary): ReviewSearchResult {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    coverImage: article.coverImage,
  };
}

export async function searchReviewsAction(
  rawQuery: string,
  options?: { categorySlug?: string; limit?: number },
): Promise<ReviewSummary[]> {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) return [];

  const limit = Math.min(
    options?.limit ?? SEARCH_RESULTS_LIMIT,
    SEARCH_RESULTS_LIMIT,
  );

  return resolveSearchArticles(query, {
    categorySlug: options?.categorySlug,
    limit,
  });
}

export async function searchReviewsPaginatedAction(
  rawQuery: string,
  options?: { categorySlug?: string; page?: number; pageSize?: number },
): Promise<PaginatedResponse<ReviewSummary>> {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) {
    return { data: [], total: 0, page: 1, pageSize: REVIEWS_PAGE_SIZE };
  }

  return resolveSearchArticlesPaginated(query, {
    categorySlug: options?.categorySlug,
    page: options?.page,
    pageSize: options?.pageSize ?? REVIEWS_PAGE_SIZE,
  });
}

export async function searchReviewsForTypeaheadAction(
  rawQuery: string,
): Promise<ReviewSearchResult[]> {
  const results = await searchReviewsAction(rawQuery, { limit: 8 });
  return results.map(toSearchResult);
}

export const searchReviewsCached = unstable_cache(
  async (rawQuery: string, categorySlug?: string) =>
    searchReviewsAction(rawQuery, { categorySlug }),
  ['review-search-v1-db'],
  { revalidate: 60, tags: ['reviews'] },
);

export const searchReviewsPaginatedCached = unstable_cache(
  async (rawQuery: string, categorySlug: string | undefined, page: number) =>
    searchReviewsPaginatedAction(rawQuery, { categorySlug, page }),
  ['review-search-paginated-v1-db'],
  { revalidate: 60, tags: ['reviews'] },
);

export async function getPublicCategoriesAction(): Promise<ReviewCategory[]> {
  return resolvePublicCategories();
}

export const getReviewsListCached = unstable_cache(
  async (categorySlug?: string) => resolvePublishedArticles(categorySlug),
  ['review-list-v2-db'],
  { revalidate: 120, tags: ['reviews'] },
);

export const getReviewsListPaginatedCached = unstable_cache(
  async (categorySlug: string | undefined, page: number) =>
    getReviewsListPaginatedAction({ categorySlug, page }),
  ['review-list-paginated-v1-db'],
  { revalidate: 120, tags: ['reviews'] },
);

export const getRelatedArticlesCached = unstable_cache(
  async (slug: string) => {
    const article = await resolveArticleBySlug(slug);
    if (!article) return [];
    return resolveRelatedArticles(article);
  },
  ['review-related-articles-v1'],
  { revalidate: 120, tags: ['reviews'] },
);

/** @deprecated Use `getPublishedReviewBySlug` from `queries/get-published-review-by-slug` in RSC pages. */
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
