import type { SupabaseClient } from '@supabase/supabase-js';

import { mapDbArticleDetailBanner } from '@/lib/article-detail-banners';
import {
  EXCLUDED_PUBLIC_CATEGORY_SLUGS,
  filterPublicCategories,
} from '@/lib/category/constants';
import { REVIEWS_PAGE_SIZE } from '@/lib/reviews/constants';
import type { PaginatedResponse } from '@/types/api';
import type {
  HomePageData,
  ReviewArticle,
  ReviewCategory,
  ReviewEngagement,
} from '@/types/review';

import { enrichSummaries, sortByTrending } from './review-repository';

type CategoryRow = { id: string; slug: string; name: string };
type AuthorRow = { id: string; name: string; avatar_url: string | null };
type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string | null;
  cover_image: string;
  editor_pick_cover_image?: string | null;
  editor_pick_cover_image_mobile?: string | null;
  editor_pick_cover_image_desktop?: string | null;
  published_at: string;
  updated_at: string | null;
  status: string;
  rating: number;
  pros: string[] | null;
  cons: string[] | null;
  tags: { slug: string; name: string }[];
  series: { slug: string; name: string; part?: number } | null;
  affiliate_links: ReviewArticle['affiliateLinks'];
  engagement: ReviewEngagement;
  is_editor_pick: boolean;
  detail_ad_banner_desktop?: unknown;
  detail_ad_banner_mobile?: unknown;
  categories: CategoryRow | CategoryRow[] | null;
  authors: AuthorRow | AuthorRow[] | null;
};

type PostgrestErrorLike = { code?: string; message?: string } | null;

function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function mapRow(row: ArticleRow): ReviewArticle | null {
  const category = pickOne(row.categories);
  const author = pickOne(row.authors);
  if (!category || !author) return null;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content ?? undefined,
    coverImage: row.cover_image,
    editorPickCoverImageMobile:
      row.editor_pick_cover_image_mobile ??
      row.editor_pick_cover_image ??
      undefined,
    editorPickCoverImageDesktop:
      row.editor_pick_cover_image_desktop ??
      row.editor_pick_cover_image_mobile ??
      row.editor_pick_cover_image ??
      undefined,
    category: {
      slug: category.slug,
      name: category.name,
    },
    author: {
      id: author.id,
      name: author.name,
      avatar: author.avatar_url ?? undefined,
    },
    publishedAt: row.published_at,
    updatedAt: row.updated_at ?? undefined,
    status: row.status as ReviewArticle['status'],
    rating: Number(row.rating),
    pros: row.pros ?? undefined,
    cons: row.cons ?? undefined,
    tags: row.tags ?? [],
    series: row.series ?? undefined,
    affiliateLinks: row.affiliate_links ?? undefined,
    engagement: row.engagement,
    isEditorPick: row.is_editor_pick,
    detailAdBannerDesktop: mapDbArticleDetailBanner(row.detail_ad_banner_desktop),
    detailAdBannerMobile: mapDbArticleDetailBanner(row.detail_ad_banner_mobile),
  };
}

const ARTICLE_SELECT = `
  id,
  slug,
  title,
  excerpt,
  content,
  cover_image,
  editor_pick_cover_image,
  editor_pick_cover_image_mobile,
  editor_pick_cover_image_desktop,
  published_at,
  updated_at,
  status,
  rating,
  pros,
  cons,
  tags,
  series,
  affiliate_links,
  engagement,
  is_editor_pick,
  categories ( id, slug, name ),
  authors ( id, name, avatar_url )
`;

const ARTICLE_DETAIL_SELECT = `
  ${ARTICLE_SELECT.trim()},
  detail_ad_banner_desktop,
  detail_ad_banner_mobile
`;

// Backward compatible select for when migrations haven't run yet (missing columns → 42703).
const ARTICLE_SELECT_LEGACY = `
  id,
  slug,
  title,
  excerpt,
  content,
  cover_image,
  published_at,
  updated_at,
  status,
  rating,
  pros,
  cons,
  tags,
  series,
  affiliate_links,
  engagement,
  is_editor_pick,
  categories ( id, slug, name ),
  authors ( id, name, avatar_url )
`;

function isMissingColumnError(error: PostgrestErrorLike): boolean {
  return Boolean(error && error.code === '42703');
}

export type FetchPublishedArticlesOptions = {
  categorySlug?: string;
};

export type FetchPublishedArticlesPaginatedOptions =
  FetchPublishedArticlesOptions & {
    page?: number;
    pageSize?: number;
  };

export type SearchPublishedArticlesOptions = {
  categorySlug?: string;
  limit?: number;
};

export type SearchPublishedArticlesPaginatedOptions = {
  categorySlug?: string;
  page?: number;
  pageSize?: number;
};

async function resolveCategoryId(
  supabase: SupabaseClient,
  categorySlug?: string,
): Promise<string | null | 'excluded'> {
  if (!categorySlug) return null;

  if (
    EXCLUDED_PUBLIC_CATEGORY_SLUGS.includes(
      categorySlug as (typeof EXCLUDED_PUBLIC_CATEGORY_SLUGS)[number],
    )
  ) {
    return 'excluded';
  }

  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .maybeSingle();

  if (categoryError) throw categoryError;
  return category?.id ?? null;
}

export async function fetchPublishedArticles(
  supabase: SupabaseClient,
  options?: FetchPublishedArticlesOptions,
): Promise<ReviewArticle[]> {
  function build(select: string) {
    return supabase
      .from('review_articles')
      .select(select)
      .eq('status', 'published')
      .eq('is_active', true)
      .order('published_at', { ascending: false });
  }

  const categoryResolved = await resolveCategoryId(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') return [];
  const categoryId = categoryResolved;

  const run = async (select: string) => {
    let q = build(select);
    if (categoryId) q = q.eq('category_id', categoryId);
    return await q;
  };

  let { data, error } = await run(ARTICLE_SELECT);
  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const retry = await run(ARTICLE_SELECT_LEGACY);
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error;
  return ((data ?? []) as unknown as ArticleRow[])
    .map(mapRow)
    .filter((row): row is ReviewArticle => row != null);
}

export async function fetchPublishedArticlesPaginated(
  supabase: SupabaseClient,
  options?: FetchPublishedArticlesPaginatedOptions,
): Promise<PaginatedResponse<ReviewArticle>> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? REVIEWS_PAGE_SIZE);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  function build(select: string) {
    return supabase
      .from('review_articles')
      .select(select, { count: 'exact' })
      .eq('status', 'published')
      .eq('is_active', true)
      .order('published_at', { ascending: false });
  }

  const categoryResolved = await resolveCategoryId(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') {
    return { data: [], total: 0, page: 1, pageSize };
  }
  const categoryId = categoryResolved;

  const run = async (select: string) => {
    let q = build(select).range(from, to);
    if (categoryId) q = q.eq('category_id', categoryId);
    return await q;
  };

  let { data, error, count } = await run(ARTICLE_SELECT);
  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const retry = await run(ARTICLE_SELECT_LEGACY);
    data = retry.data;
    error = retry.error;
    count = retry.count;
  }

  if (error) throw error;

  const articles = ((data ?? []) as unknown as ArticleRow[])
    .map(mapRow)
    .filter((row): row is ReviewArticle => row != null);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    data: articles,
    total,
    page: total > 0 ? safePage : 1,
    pageSize,
  };
}

export async function searchPublishedArticles(
  supabase: SupabaseClient,
  query: string,
  options?: SearchPublishedArticlesOptions,
): Promise<ReviewArticle[]> {
  const limit = options?.limit ?? 20;
  const categoryResolved = await resolveCategoryId(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') return [];
  const categoryId = categoryResolved;

  const runFts = (select: string) => {
    let q = supabase
      .from('review_articles')
      .select(select)
      .eq('status', 'published')
      .eq('is_active', true)
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'simple',
      })
      .order('published_at', { ascending: false })
      .limit(limit);
    if (categoryId) q = q.eq('category_id', categoryId);
    return q;
  };

  const runIlike = (select: string) => {
    const term = query.replace(/[%_]/g, '');
    let q = supabase
      .from('review_articles')
      .select(select)
      .eq('status', 'published')
      .eq('is_active', true)
      .or(
        `title.ilike.%${term}%,excerpt.ilike.%${term}%,slug.ilike.%${term}%`,
      )
      .order('published_at', { ascending: false })
      .limit(limit);
    if (categoryId) q = q.eq('category_id', categoryId);
    return q;
  };

  let { data, error } = await runFts(ARTICLE_SELECT);
  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const retry = await runIlike(ARTICLE_SELECT);
    data = retry.data;
    error = retry.error;
  } else if (error) {
    const retry = await runIlike(ARTICLE_SELECT);
    if (!retry.error) {
      data = retry.data;
      error = null;
    }
  }

  if (error) throw error;
  return ((data ?? []) as unknown as ArticleRow[])
    .map(mapRow)
    .filter((row): row is ReviewArticle => row != null);
}

export async function searchPublishedArticlesPaginated(
  supabase: SupabaseClient,
  query: string,
  options?: SearchPublishedArticlesPaginatedOptions,
): Promise<PaginatedResponse<ReviewArticle>> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, options?.pageSize ?? REVIEWS_PAGE_SIZE);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const categoryResolved = await resolveCategoryId(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') {
    return { data: [], total: 0, page: 1, pageSize };
  }
  const categoryId = categoryResolved;

  const runFts = (select: string) => {
    let q = supabase
      .from('review_articles')
      .select(select, { count: 'exact' })
      .eq('status', 'published')
      .eq('is_active', true)
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'simple',
      })
      .order('published_at', { ascending: false })
      .range(from, to);
    if (categoryId) q = q.eq('category_id', categoryId);
    return q;
  };

  const runIlike = (select: string) => {
    const term = query.replace(/[%_]/g, '');
    let q = supabase
      .from('review_articles')
      .select(select, { count: 'exact' })
      .eq('status', 'published')
      .eq('is_active', true)
      .or(
        `title.ilike.%${term}%,excerpt.ilike.%${term}%,slug.ilike.%${term}%`,
      )
      .order('published_at', { ascending: false })
      .range(from, to);
    if (categoryId) q = q.eq('category_id', categoryId);
    return q;
  };

  let { data, error, count } = await runFts(ARTICLE_SELECT);
  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const retry = await runIlike(ARTICLE_SELECT);
    data = retry.data;
    error = retry.error;
    count = retry.count;
  } else if (error) {
    const retry = await runIlike(ARTICLE_SELECT);
    if (!retry.error) {
      data = retry.data;
      error = null;
      count = retry.count;
    }
  }

  if (error) throw error;

  const articles = ((data ?? []) as unknown as ArticleRow[])
    .map(mapRow)
    .filter((row): row is ReviewArticle => row != null);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    data: articles,
    total,
    page: total > 0 ? safePage : 1,
    pageSize,
  };
}

async function fetchArticleRowBySlug(
  supabase: SupabaseClient,
  slug: string,
  options?: { draftPreview?: boolean },
): Promise<ReviewArticle | null> {
  const run = (select: string) => {
    let q = supabase.from('review_articles').select(select).eq('slug', slug);
    if (!options?.draftPreview) {
      q = q.eq('status', 'published').eq('is_active', true);
    }
    return q.maybeSingle();
  };

  let { data, error } = (await run(ARTICLE_DETAIL_SELECT)) as unknown as {
    data: unknown;
    error: unknown;
  };

  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const retry = (await run(ARTICLE_SELECT)) as unknown as {
      data: unknown;
      error: unknown;
    };
    data = retry.data;
    error = retry.error;
  }

  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const retry = (await run(ARTICLE_SELECT_LEGACY)) as unknown as {
      data: unknown;
      error: unknown;
    };
    data = retry.data;
    error = retry.error;
  }

  if (error) throw error as never;
  if (!data) return null;
  return mapRow(data as ArticleRow);
}

export async function fetchPublishedArticleBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ReviewArticle | null> {
  return fetchArticleRowBySlug(supabase, slug);
}

/** Slug lookup without published/active filters — for `?view=draft` editor preview. */
export async function fetchDraftPreviewArticleBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ReviewArticle | null> {
  return fetchArticleRowBySlug(supabase, slug, { draftPreview: true });
}

export async function fetchActiveCategories(
  supabase: SupabaseClient,
): Promise<ReviewCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('slug, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return filterPublicCategories((data ?? []) as ReviewCategory[]);
}

/** @deprecated Use fetchActiveCategories */
export async function fetchCategories(
  supabase: SupabaseClient,
): Promise<ReviewCategory[]> {
  return fetchActiveCategories(supabase);
}

export async function getHomePageDataFromSupabase(
  supabase: SupabaseClient,
): Promise<HomePageData> {
  const [articles, categories] = await Promise.all([
    fetchPublishedArticles(supabase),
    fetchActiveCategories(supabase),
  ]);

  const summariesBase = enrichSummaries(articles);
  const newestIds = new Set(
    [...summariesBase]
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, 10)
      .map((a) => a.id),
  );
  const hotIds = new Set(
    [...summariesBase]
      .sort((a, b) => b.engagement.views - a.engagement.views)
      .slice(0, 10)
      .map((a) => a.id),
  );
  const summaries = summariesBase.map((a) => ({
    ...a,
    listBadge: (newestIds.has(a.id) ? 'new' : hotIds.has(a.id) ? 'hot' : null) as
      | 'new'
      | 'hot'
      | null,
  }));
  const hero =
    summaries.find((a) => a.isEditorPick) ?? summaries[0] ?? null;

  const trending24h = sortByTrending(summaries, '24h', 10);
  const trending7d = sortByTrending(summaries, '7d', 8);
  const latest = [...summaries]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 12);

  return {
    hero,
    trending24h,
    trending7d,
    latest,
    categories,
  };
}
