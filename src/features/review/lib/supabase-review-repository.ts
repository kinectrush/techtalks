import type { SupabaseClient } from '@supabase/supabase-js';

import { mapDbArticleDetailBanner } from '@/lib/article-detail-banners';
import {
  EXCLUDED_PUBLIC_CATEGORY_SLUGS,
  filterPublicCategories,
} from '@/lib/category/constants';
import { parseHomepageConfig } from '@/lib/world-cup/homepage-config';
import { REVIEWS_PAGE_SIZE } from '@/lib/reviews/constants';
import type { PaginatedResponse } from '@/types/api';
import type {
  FeaturedSubcategory,
  HomePageData,
  ReviewArticle,
  ReviewCategory,
  ReviewEngagement,
} from '@/types/review';

import {
  HOME_FEATURED_SUBCATEGORY_ARTICLE_LIMIT,
  HOME_LATEST_LIMIT,
  HOME_TRENDING_24H_LIMIT,
} from '@/lib/reviews/constants';

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

async function resolveCategoryFilterIds(
  supabase: SupabaseClient,
  categorySlug?: string,
): Promise<string[] | null | 'excluded'> {
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
    .select('id, parent_id')
    .eq('slug', categorySlug)
    .eq('is_active', true)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!category) return null;

  if (category.parent_id) {
    return [category.id];
  }

  const { data: children, error: childrenError } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', category.id)
    .eq('is_active', true);

  if (childrenError) {
    if (isMissingColumnError(childrenError as PostgrestErrorLike)) {
      return [category.id];
    }
    throw childrenError;
  }

  const childIds = (children ?? []).map((row) => row.id);
  return [category.id, ...childIds];
}

function applyCategoryFilter<T extends { eq: (col: string, val: string) => T; in: (col: string, vals: string[]) => T }>(
  query: T,
  categoryIds: string[] | null,
): T {
  if (!categoryIds?.length) return query;
  if (categoryIds.length === 1) return query.eq('category_id', categoryIds[0]!);
  return query.in('category_id', categoryIds);
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

  const categoryResolved = await resolveCategoryFilterIds(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') return [];
  const categoryIds = categoryResolved;

  const run = async (select: string) => {
    let q = build(select);
    q = applyCategoryFilter(q, categoryIds);
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

  const categoryResolved = await resolveCategoryFilterIds(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') {
    return { data: [], total: 0, page: 1, pageSize };
  }
  const categoryIds = categoryResolved;

  const run = async (select: string) => {
    let q = build(select).range(from, to);
    q = applyCategoryFilter(q, categoryIds);
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
  const categoryResolved = await resolveCategoryFilterIds(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') return [];
  const categoryIds = categoryResolved;

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
    q = applyCategoryFilter(q, categoryIds);
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
    q = applyCategoryFilter(q, categoryIds);
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

  const categoryResolved = await resolveCategoryFilterIds(
    supabase,
    options?.categorySlug,
  );
  if (categoryResolved === 'excluded') {
    return { data: [], total: 0, page: 1, pageSize };
  }
  const categoryIds = categoryResolved;

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
    q = applyCategoryFilter(q, categoryIds);
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
    q = applyCategoryFilter(q, categoryIds);
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
    .is('parent_id', null)
    .order('sort_order', { ascending: true });

  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const legacy = await supabase
      .from('categories')
      .select('slug, name')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (legacy.error) throw legacy.error;
    return filterPublicCategories((legacy.data ?? []) as ReviewCategory[]);
  }

  if (error) throw error;
  return filterPublicCategories((data ?? []) as ReviewCategory[]);
}

type FeaturedSubcategoryRow = {
  id: string;
  slug: string;
  name: string;
  parent_id: string;
  homepage_tagline: string | null;
  homepage_accent_color: string | null;
  homepage_config: unknown | null;
};

async function fetchHomepageFeaturedSubcategories(
  supabase: SupabaseClient,
): Promise<FeaturedSubcategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select(
      'id, slug, name, parent_id, homepage_tagline, homepage_accent_color, homepage_config',
    )
    .eq('is_active', true)
    .eq('show_on_homepage', true)
    .not('parent_id', 'is', null)
    .order('sort_order', { ascending: true });

  if (isMissingColumnError(error as PostgrestErrorLike)) {
    const legacy = await supabase
      .from('categories')
      .select(
        'id, slug, name, parent_id, homepage_tagline, homepage_accent_color',
      )
      .eq('is_active', true)
      .eq('show_on_homepage', true)
      .not('parent_id', 'is', null)
      .order('sort_order', { ascending: true });
    if (legacy.error) return [];
    if (!legacy.data?.length) return [];

    const legacyRows = legacy.data as Omit<FeaturedSubcategoryRow, 'homepage_config'>[];
    return buildFeaturedSubcategories(supabase, legacyRows, () =>
      parseHomepageConfig(null),
    );
  }
  if (error) throw error;
  if (!data?.length) return [];

  const rows = data as FeaturedSubcategoryRow[];
  return buildFeaturedSubcategories(supabase, rows, (row) =>
    parseHomepageConfig(row.homepage_config),
  );
}

async function buildFeaturedSubcategories(
  supabase: SupabaseClient,
  rows: Array<
    Omit<FeaturedSubcategoryRow, 'homepage_config'> & {
      homepage_config?: unknown | null;
    }
  >,
  resolveConfig: (
    row: Omit<FeaturedSubcategoryRow, 'homepage_config'> & {
      homepage_config?: unknown | null;
    },
  ) => ReturnType<typeof parseHomepageConfig>,
): Promise<FeaturedSubcategory[]> {
  const parentIds = [...new Set(rows.map((row) => row.parent_id))];
  const { data: parents, error: parentsError } = await supabase
    .from('categories')
    .select('id, slug, name')
    .in('id', parentIds);

  if (parentsError) throw parentsError;
  const parentById = new Map(
    (parents ?? []).map((parent) => [parent.id, parent]),
  );

  const featured: FeaturedSubcategory[] = [];

  for (const row of rows) {
    const parent = parentById.get(row.parent_id);
    if (!parent) continue;

    const { data: articles, error: articlesError } = await supabase
      .from('review_articles')
      .select(ARTICLE_SELECT)
      .eq('status', 'published')
      .eq('is_active', true)
      .eq('category_id', row.id)
      .order('published_at', { ascending: false })
      .limit(HOME_FEATURED_SUBCATEGORY_ARTICLE_LIMIT);

    if (articlesError) {
      if (isMissingColumnError(articlesError as PostgrestErrorLike)) continue;
      throw articlesError;
    }

    const mapped = ((articles ?? []) as unknown as ArticleRow[])
      .map(mapRow)
      .filter((article): article is ReviewArticle => article != null);

    featured.push({
      slug: row.slug,
      name: row.name,
      tagline: row.homepage_tagline,
      accentColor: row.homepage_accent_color,
      parentSlug: parent.slug,
      parentName: parent.name,
      articles: enrichSummaries(mapped),
      homepageConfig: resolveConfig(row),
    });
  }

  return featured;
}

export async function fetchCategoryLabelBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<{ slug: string; name: string } | null> {
  if (
    EXCLUDED_PUBLIC_CATEGORY_SLUGS.includes(
      slug as (typeof EXCLUDED_PUBLIC_CATEGORY_SLUGS)[number],
    )
  ) {
    return null;
  }

  const { data, error } = await supabase
    .from('categories')
    .select('slug, name, is_active, parent_id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data?.is_active) return null;
  return { slug: data.slug, name: data.name };
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
  const [articles, categories, featuredSubcategories] = await Promise.all([
    fetchPublishedArticles(supabase),
    fetchActiveCategories(supabase),
    fetchHomepageFeaturedSubcategories(supabase),
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

  const trending24h = sortByTrending(summaries, '24h', HOME_TRENDING_24H_LIMIT);
  const trending7d = sortByTrending(summaries, '7d', 8);
  const latest = [...summaries]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, HOME_LATEST_LIMIT);

  return {
    hero,
    trending24h,
    trending7d,
    latest,
    categories,
    featuredSubcategories,
  };
}
