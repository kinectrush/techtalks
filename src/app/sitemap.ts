import type { MetadataRoute } from 'next';

import {
  getAllSummaries,
  getMockCategories,
} from '@/features/review/lib/review-repository';
import {
  resolvePublicCategories,
  resolvePublishedArticles,
} from '@/features/review/lib/resolve-published-reviews';
import { filterPublicCategories } from '@/lib/category/constants';
import { getSiteOrigin } from '@/lib/site-assets';
import type { ReviewCategory, ReviewSummary } from '@/types/review';

/** Build at request time so URLs reflect latest published articles. */
export const dynamic = 'force-dynamic';

function absolutePath(pathname: string): string {
  return new URL(pathname, getSiteOrigin()).href;
}

function articleLastModified(article: {
  updatedAt?: string;
  publishedAt: string;
}): Date {
  return new Date(article.updatedAt ?? article.publishedAt);
}

async function loadSitemapData(): Promise<{
  articles: ReviewSummary[];
  categories: ReviewCategory[];
}> {
  try {
    const [articles, categories] = await Promise.all([
      resolvePublishedArticles(),
      resolvePublicCategories(),
    ]);
    return { articles, categories };
  } catch (error) {
    console.error('[sitemap] falling back to mock data', error);
    return {
      articles: getAllSummaries(),
      categories: getMockCategories(),
    };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, categories } = await loadSitemapData();
  const publicCategories = filterPublicCategories(categories);
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absolutePath('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: absolutePath('/reviews'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const categoryEntries: MetadataRoute.Sitemap = publicCategories.map((cat) => ({
    url: absolutePath(`/reviews?category=${encodeURIComponent(cat.slug)}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absolutePath(`/review/${encodeURIComponent(article.slug)}`),
    lastModified: articleLastModified(article),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}
