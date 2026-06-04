import type { SupabaseClient } from '@supabase/supabase-js';

import { mapDbArticleDetailBanner } from '@/lib/article-detail-banners';
import {
  EXCLUDED_PUBLIC_CATEGORY_SLUGS,
  filterPublicCategories,
} from '@/lib/category/constants';
import type {
  HomePageData,
  ReviewArticle,
  ReviewCategory,
  ReviewEngagement,
} from '@/types/review';

import { enrichSummaries } from './review-repository';

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

  let categoryId: string | null = null;
  if (options?.categorySlug) {
    if (
      EXCLUDED_PUBLIC_CATEGORY_SLUGS.includes(
        options.categorySlug as (typeof EXCLUDED_PUBLIC_CATEGORY_SLUGS)[number],
      )
    ) {
      return [];
    }

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .eq('is_active', true)
      .maybeSingle();

    if (categoryError) throw categoryError;
    if (!category) return [];
    categoryId = category.id;
  }

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

export async function fetchPublishedArticleBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ReviewArticle | null> {
  const run = (select: string) =>
    supabase
      .from('review_articles')
      .select(select)
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('is_active', true)
      .maybeSingle();

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

  const trending24h = [...summaries]
    .sort((a, b) => b.trendingScore24h - a.trendingScore24h)
    .slice(0, 10);
  const trending7d = [...summaries]
    .sort((a, b) => b.trendingScore7d - a.trendingScore7d)
    .slice(0, 8);
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
