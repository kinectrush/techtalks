import { isSupabaseConfigured } from '@/lib/supabase/env';
import { createSupabasePublicClientIfConfigured } from '@/lib/supabase/public';
import type { ReviewCategory, ReviewSummary } from '@/types/review';

import { getMockArticleContent } from '../data/mock-article-content';
import { getMockCategories } from './review-repository';
import {
  enrichSummaries,
  getAllSummaries,
  getArticleBySlug,
} from './review-repository';
import {
  fetchActiveCategories,
  fetchPublishedArticleBySlug,
  fetchPublishedArticles,
} from './supabase-review-repository';

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

export async function resolveArticleBySlug(
  slug: string,
): Promise<ReviewSummary | null> {
  if (isSupabaseConfigured()) {
    const supabase = createSupabasePublicClientIfConfigured();
    if (supabase) {
      const article = await fetchPublishedArticleBySlug(supabase, slug);
      if (article) {
        const withContent = article.content?.trim()
          ? article
          : {
              ...article,
              content: getMockArticleContent(article.slug),
            };
        return enrichSummaries([withContent])[0] ?? null;
      }
      return null;
    }
  }
  return getArticleBySlug(slug) ?? null;
}
