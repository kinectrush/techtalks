import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabasePublicClientIfConfigured } from '@/lib/supabase/public';
import { REVIEWS_PAGE_SIZE } from '@/lib/reviews/constants';
import type { PaginatedResponse } from '@/types/api';
import type {
  ReviewArticle,
  ReviewCategory,
  ReviewSummary,
} from '@/types/review';

import { getMockArticleContent } from '../data/mock-article-content';
import { getMockCategories } from './review-repository';
import {
  articleToSummary,
  enrichSummaries,
  getAllSummaries,
  getAllSummariesPaginated,
  getArticleBySlug,
  searchSummaries,
  searchSummariesPaginated,
} from './review-repository';
import {
  fetchActiveCategories,
  fetchDraftPreviewArticleBySlug,
  fetchPublishedArticleBySlug,
  fetchPublishedArticles,
  fetchPublishedArticlesPaginated,
  searchPublishedArticles,
  searchPublishedArticlesPaginated,
} from './supabase-review-repository';

export type ResolveArticleOptions = {
  draftPreview?: boolean;
};

function withMockContentFallback(article: ReviewArticle): ReviewArticle {
  return article.content?.trim()
    ? article
    : {
        ...article,
        content: getMockArticleContent(article.slug),
      };
}

export async function resolvePublicCategories(): Promise<ReviewCategory[]> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const categories = await fetchActiveCategories(supabase);
      return categories;
    }
  }
  return getMockCategories();
}

export async function resolveSearchArticles(
  query: string,
  options?: { categorySlug?: string; limit?: number },
): Promise<ReviewSummary[]> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const articles = await searchPublishedArticles(supabase, query, options);
      return enrichSummaries(articles);
    }
  }
  return searchSummaries(query, options);
}

export async function resolveSearchArticlesPaginated(
  query: string,
  options?: { categorySlug?: string; page?: number; pageSize?: number },
): Promise<PaginatedResponse<ReviewSummary>> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const result = await searchPublishedArticlesPaginated(
        supabase,
        query,
        options,
      );
      return {
        ...result,
        data: enrichSummaries(result.data),
      };
    }
  }
  return searchSummariesPaginated(query, options);
}

export async function resolvePublishedArticles(
  categorySlug?: string,
): Promise<ReviewSummary[]> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const articles = await fetchPublishedArticles(supabase, { categorySlug });
      // If DB is configured, always prefer DB results (even empty).
      return enrichSummaries(articles);
    }
  }
  return getAllSummaries(categorySlug);
}

export async function resolvePublishedArticlesPaginated(
  options?: { categorySlug?: string; page?: number; pageSize?: number },
): Promise<PaginatedResponse<ReviewSummary>> {
  const pageSize = options?.pageSize ?? REVIEWS_PAGE_SIZE;

  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const result = await fetchPublishedArticlesPaginated(supabase, {
        categorySlug: options?.categorySlug,
        page: options?.page,
        pageSize,
      });
      return {
        ...result,
        data: enrichSummaries(result.data),
      };
    }
  }
  return getAllSummariesPaginated({
    categorySlug: options?.categorySlug,
    page: options?.page,
    pageSize,
  });
}

export async function resolveArticleBySlug(
  slug: string,
  options?: ResolveArticleOptions,
): Promise<ReviewSummary | null> {
  const draftPreview = options?.draftPreview === true;

  if (isSupabaseConfigured()) {
    if (draftPreview) {
      try {
        const supabase = createSupabaseAdminClient();
        const article = await fetchDraftPreviewArticleBySlug(supabase, slug);
        if (article) {
          return articleToSummary(article);
        }
      } catch (error) {
        console.error('[resolveArticleBySlug] draft preview', slug, error);
      }
      return null;
    }

    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const article = await fetchPublishedArticleBySlug(supabase, slug);
      if (article) {
        const withContent = withMockContentFallback(article);
        return enrichSummaries([withContent])[0] ?? null;
      }
      return null;
    }
  }

  const mockArticle = getArticleBySlug(slug);
  if (!mockArticle) return null;
  return draftPreview ? mockArticle : mockArticle.status === 'published' ? mockArticle : null;
}
