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
      try {
        const categories = await fetchActiveCategories(supabase);
        if (categories.length > 0) return categories;
      } catch {
        // fall through to mock
      }
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
      try {
        const articles = await fetchPublishedArticles(supabase, {
          categorySlug,
        });
        if (articles.length > 0) return enrichSummaries(articles);
        if (categorySlug) return [];
      } catch {
        // fall through to mock
      }
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
      try {
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
      } catch {
        // fall through to mock
      }
    }
  }
  return getArticleBySlug(slug) ?? null;
}
