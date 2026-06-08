import type { PaginatedResponse } from '@/types/api';
import {
  calculateTrendingScore,
  compareTopTrending7d,
  getHotBadge,
} from '@/lib/trending/calculate-score';
import { REVIEWS_PAGE_SIZE } from '@/lib/reviews/constants';
import type {
  HomePageData,
  ReviewArticle,
  ReviewCategory,
  ReviewSummary,
  TrendingWindow,
} from '@/types/review';

import { filterPublicCategories } from '@/lib/category/constants';

import { getMockArticleContent } from '../data/mock-article-content';
import { MOCK_ARTICLES, MOCK_CATEGORIES } from '../data/mock-articles';

function toSummary(article: ReviewArticle): ReviewSummary {
  const trendingScore24h = calculateTrendingScore(
    article.engagement,
    article.publishedAt,
    '24h',
  );
  const trendingScore7d = calculateTrendingScore(
    article.engagement,
    article.publishedAt,
    '7d',
  );

  return {
    ...article,
    trendingScore24h,
    trendingScore7d,
  };
}

function publishedOnly(articles: ReviewArticle[]) {
  return articles.filter((a) => a.status === 'published');
}

export function enrichSummaries(articles: ReviewArticle[]): ReviewSummary[] {
  return publishedOnly(articles).map(toSummary);
}

export function articleToSummary(article: ReviewArticle): ReviewSummary {
  return toSummary(article);
}

function withListBadges(summaries: ReviewSummary[]): ReviewSummary[] {
  const newestIds = new Set(
    [...summaries]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, 10)
      .map((a) => a.id),
  );

  const hotIds = new Set(
    [...summaries]
      .sort((a, b) => b.engagement.views - a.engagement.views)
      .slice(0, 10)
      .map((a) => a.id),
  );

  return summaries.map((a) => ({
    ...a,
    listBadge: newestIds.has(a.id) ? 'new' : hotIds.has(a.id) ? 'hot' : null,
  }));
}

export function sortByTrending(
  summaries: ReviewSummary[],
  window: TrendingWindow,
  limit?: number,
) {
  const sorted =
    window === '7d'
      ? [...summaries].sort(compareTopTrending7d)
      : [...summaries].sort(
          (a, b) => b.trendingScore24h - a.trendingScore24h,
        );
  const sliced = limit ? sorted.slice(0, limit) : sorted;
  const scoreKey = window === '24h' ? 'trendingScore24h' : 'trendingScore7d';

  return sliced.map((item, index) => ({
    ...item,
    hotRank: index + 1,
    hotBadge: getHotBadge(item[scoreKey], window),
  }));
}

export function getHomePageData(): HomePageData {
  const summaries = withListBadges(enrichSummaries(MOCK_ARTICLES));
  const trending24h = sortByTrending(summaries, '24h', 6);
  const trending7d = sortByTrending(summaries, '7d', 10);
  const latest = [...summaries]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 8);

  const heroBase =
    summaries.find((a) => a.isEditorPick) ??
    trending24h[0] ??
    latest[0];

  return {
    hero: {
      ...heroBase,
      hotRank: 1,
      hotBadge: getHotBadge(heroBase.trendingScore24h, '24h'),
    },
    trending24h,
    trending7d,
    latest,
    categories: getMockCategories(),
  };
}

function withMockContent(article: ReviewArticle): ReviewArticle {
  if (article.content?.trim()) return article;
  const mockContent = getMockArticleContent(article.slug);
  return mockContent ? { ...article, content: mockContent } : article;
}

export function getArticleBySlug(slug: string): ReviewSummary | undefined {
  const article = MOCK_ARTICLES.find((a) => a.slug === slug);
  return article ? toSummary(withMockContent(article)) : undefined;
}

export function getAllSummaries(categorySlug?: string): ReviewSummary[] {
  let articles = publishedOnly(MOCK_ARTICLES).map(withMockContent);
  if (categorySlug === 'general') {
    return [];
  }
  if (categorySlug) {
    articles = articles.filter((a) => a.category.slug === categorySlug);
  }
  return enrichSummaries(articles);
}

export function getAllSummariesPaginated(
  options?: { categorySlug?: string; page?: number; pageSize?: number },
): PaginatedResponse<ReviewSummary> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? REVIEWS_PAGE_SIZE);
  const all = getAllSummaries(options?.categorySlug);
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * pageSize;

  return {
    data: all.slice(from, from + pageSize),
    total,
    page: safePage,
    pageSize,
  };
}

export function searchSummaries(
  query: string,
  options?: { categorySlug?: string; limit?: number },
): ReviewSummary[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  let articles = publishedOnly(MOCK_ARTICLES).map(withMockContent);
  if (options?.categorySlug === 'general') {
    return [];
  }
  if (options?.categorySlug) {
    articles = articles.filter((a) => a.category.slug === options.categorySlug);
  }

  const matched = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(term) ||
      article.excerpt.toLowerCase().includes(term) ||
      article.slug.toLowerCase().includes(term),
  );

  const limit = options?.limit ?? 20;
  return enrichSummaries(matched).slice(0, limit);
}

export function searchSummariesPaginated(
  query: string,
  options?: { categorySlug?: string; page?: number; pageSize?: number },
): PaginatedResponse<ReviewSummary> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? REVIEWS_PAGE_SIZE);
  const all = searchSummaries(query, { categorySlug: options?.categorySlug });
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = (safePage - 1) * pageSize;

  return {
    data: all.slice(from, from + pageSize),
    total,
    page: safePage,
    pageSize,
  };
}

export function getMockCategories(): ReviewCategory[] {
  return filterPublicCategories(MOCK_CATEGORIES);
}
