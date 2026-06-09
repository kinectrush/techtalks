import type { SupabaseClient } from '@supabase/supabase-js';

import {
  mapDbArticleDetailBanner,
  toDbArticleDetailBanner,
} from '@/lib/article-detail-banners';
import { slugify } from '@/lib/slug';
import { reviewDetailPageUrl } from '@/lib/site-assets';
import type { ReviewEngagement } from '@/types/review';
import type { AdminArticleInput, AdminArticleRow } from '@/types/admin';

const DUPLICATE_TITLE_PREFIX = '(copy) ';

type DbArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string | null;
  cover_image: string;
  editor_pick_cover_image: string | null;
  editor_pick_cover_image_mobile: string | null;
  editor_pick_cover_image_desktop: string | null;
  og_image: string | null;
  canonical_url: string | null;
  affiliate_links?: { platform: string; url: string; label?: string }[] | null;
  category_id: string;
  author_id: string;
  published_at: string;
  updated_at: string | null;
  status: string;
  is_active: boolean;
  rating: number;
  pros: string[] | null;
  cons: string[] | null;
  tags: { slug: string; name: string }[];
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  is_editor_pick: boolean;
  created_at: string;
  engagement?: ReviewEngagement | null;
  detail_ad_banner_desktop?: unknown;
  detail_ad_banner_mobile?: unknown;
  categories?: { name: string } | { name: string }[] | null;
  authors?: { name: string } | { name: string }[] | null;
};

function pickName(
  rel: { name: string } | { name: string }[] | null | undefined,
): string | undefined {
  if (!rel) return undefined;
  const row = Array.isArray(rel) ? rel[0] : rel;
  return row?.name;
}

function mapArticle(row: DbArticle): AdminArticleRow {
  const affiliateUrl =
    row.affiliate_links?.[0]?.url && typeof row.affiliate_links[0].url === 'string'
      ? row.affiliate_links[0].url
      : null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    editorPickCoverImageMobile:
      row.editor_pick_cover_image_mobile ?? row.editor_pick_cover_image,
    editorPickCoverImageDesktop:
      row.editor_pick_cover_image_desktop ??
      row.editor_pick_cover_image_mobile ??
      row.editor_pick_cover_image,
    ogImage: row.og_image,
    canonicalUrl: row.canonical_url,
    affiliateUrl,
    categoryId: row.category_id,
    authorId: row.author_id,
    categoryName: pickName(row.categories),
    authorName: pickName(row.authors),
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    status: row.status as AdminArticleRow['status'],
    isActive: row.is_active,
    rating: Number(row.rating),
    tags: row.tags ?? [],
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    isEditorPick: row.is_editor_pick,
    createdAt: row.created_at,
    views: row.engagement?.views ?? 0,
    likes: row.engagement?.reactions ?? 0,
    detailAdBannerDesktop: mapDbArticleDetailBanner(
      row.detail_ad_banner_desktop,
    ),
    detailAdBannerMobile: mapDbArticleDetailBanner(row.detail_ad_banner_mobile),
  };
}

function toDbPayload(input: AdminArticleInput, partial = false) {
  const payload: Record<string, unknown> = {
    title: input.title,
    slug: input.slug,
    subtitle: input.subtitle ?? null,
    excerpt: input.excerpt,
    content: input.content ?? null,
    cover_image: input.coverImage,
    editor_pick_cover_image: null,
    editor_pick_cover_image_mobile: input.editorPickCoverImageMobile ?? null,
    editor_pick_cover_image_desktop: input.editorPickCoverImageDesktop ?? null,
    og_image: input.ogImage ?? null,
    canonical_url: input.canonicalUrl ?? null,
    affiliate_links: input.affiliateUrl?.trim()
      ? [{ platform: 'other', url: input.affiliateUrl.trim(), label: 'Affiliate' }]
      : [],
    category_id: input.categoryId,
    author_id: input.authorId,
    published_at: input.publishedAt,
    status: input.status,
    is_active: input.isActive,
    rating: input.rating,
    pros: input.pros ?? [],
    cons: input.cons ?? [],
    tags: input.tags ?? [],
    meta_title: input.metaTitle ?? null,
    meta_description: input.metaDescription ?? null,
    meta_keywords: input.metaKeywords ?? null,
    is_editor_pick: input.isEditorPick ?? false,
    detail_ad_banner_desktop: toDbArticleDetailBanner(
      input.detailAdBannerDesktop ?? undefined,
    ),
    detail_ad_banner_mobile: toDbArticleDetailBanner(
      input.detailAdBannerMobile ?? undefined,
    ),
    updated_at: new Date().toISOString(),
  };

  if (!partial) {
    payload.engagement = {
      views: 0,
      views24h: 0,
      views7d: 0,
      reactions: 0,
      reactions24h: 0,
      reactions7d: 0,
      comments: 0,
      comments24h: 0,
      comments7d: 0,
      bookmarks: 0,
    };
  }

  return payload;
}

const SELECT = `
  id, slug, title, subtitle, excerpt, content,
  cover_image, editor_pick_cover_image, editor_pick_cover_image_mobile, editor_pick_cover_image_desktop, og_image, canonical_url, affiliate_links,
  category_id, author_id, published_at, updated_at,
  status, is_active, rating, pros, cons, tags,
  meta_title, meta_description, meta_keywords,
  is_editor_pick, created_at, engagement,
  detail_ad_banner_desktop, detail_ad_banner_mobile,
  categories ( name ),
  authors ( name )
`;

export async function listAdminArticles(
  supabase: SupabaseClient,
  search?: string,
) {
  let query = supabase
    .from('review_articles')
    .select(SELECT)
    .order('updated_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (search?.trim()) {
    const term = search.trim().replace(/[%_]/g, '');
    query = query.or(`title.ilike.%${term}%,slug.ilike.%${term}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as DbArticle[]).map(mapArticle);
}

export async function getAdminArticleById(
  supabase: SupabaseClient,
  id: string,
) {
  const { data, error } = await supabase
    .from('review_articles')
    .select(SELECT)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapArticle(data as unknown as DbArticle);
}

async function hasEditorPickArticle(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { count, error } = await supabase
    .from('review_articles')
    .select('id', { count: 'exact', head: true })
    .eq('is_editor_pick', true);

  if (error) throw error;
  return (count ?? 0) > 0;
}

export async function createAdminArticle(
  supabase: SupabaseClient,
  input: AdminArticleInput,
) {
  const editorPickExists = await hasEditorPickArticle(supabase);
  const payload = editorPickExists
    ? input
    : { ...input, isEditorPick: true };

  const { data, error } = await supabase
    .from('review_articles')
    .insert(toDbPayload(payload))
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapArticle(data as unknown as DbArticle);
}

export async function updateAdminArticle(
  supabase: SupabaseClient,
  id: string,
  input: AdminArticleInput,
) {
  const { data, error } = await supabase
    .from('review_articles')
    .update(toDbPayload(input, true))
    .eq('id', id)
    .select(SELECT)
    .single();

  if (error) throw error;
  return mapArticle(data as unknown as DbArticle);
}

async function isSlugTaken(
  supabase: SupabaseClient,
  slug: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('review_articles')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

async function uniqueSlugForDuplicate(
  supabase: SupabaseClient,
  source: AdminArticleRow,
  duplicateTitle: string,
): Promise<string> {
  const base =
    slugify(duplicateTitle) || `${source.slug}-copy`.slice(0, 120);
  if (!(await isSlugTaken(supabase, base))) return base;

  for (let n = 2; n < 1000; n++) {
    const suffix = `-${n}`;
    const candidate = `${base.slice(0, 120 - suffix.length)}${suffix}`;
    if (!(await isSlugTaken(supabase, candidate))) return candidate;
  }

  throw new Error('Could not generate a unique slug for duplicate');
}

export async function duplicateAdminArticle(
  supabase: SupabaseClient,
  id: string,
) {
  const source = await getAdminArticleById(supabase, id);
  if (!source) throw new Error('Article not found');

  const title = `${DUPLICATE_TITLE_PREFIX}${source.title}`;
  const slug = await uniqueSlugForDuplicate(supabase, source, title);

  const input: AdminArticleInput = {
    title,
    slug,
    subtitle: source.subtitle ?? undefined,
    excerpt: source.excerpt,
    content: source.content ?? undefined,
    coverImage: source.coverImage,
    editorPickCoverImageMobile: source.editorPickCoverImageMobile ?? undefined,
    editorPickCoverImageDesktop: source.editorPickCoverImageDesktop ?? undefined,
    ogImage: source.coverImage,
    canonicalUrl: reviewDetailPageUrl(slug),
    affiliateUrl: source.affiliateUrl ?? undefined,
    categoryId: source.categoryId,
    authorId: source.authorId,
    publishedAt: source.publishedAt,
    status: source.status,
    isActive: false,
    rating: source.rating,
    pros: [],
    cons: [],
    tags: source.tags,
    metaTitle: source.metaTitle ?? undefined,
    metaDescription: source.metaDescription ?? undefined,
    metaKeywords: source.metaKeywords ?? undefined,
    isEditorPick: false,
    detailAdBannerDesktop: source.detailAdBannerDesktop,
    detailAdBannerMobile: source.detailAdBannerMobile,
  };

  return createAdminArticle(supabase, input);
}

export async function deleteAdminArticle(
  supabase: SupabaseClient,
  id: string,
) {
  const { error } = await supabase
    .from('review_articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function setAdminArticleActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
) {
  const { error } = await supabase
    .from('review_articles')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function listCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, name, parent_id')
    .order('sort_order', { ascending: true });

  if (error?.code === '42703') {
    const legacy = await supabase
      .from('categories')
      .select('id, slug, name')
      .order('sort_order', { ascending: true });
    if (legacy.error) throw legacy.error;
    return (legacy.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
    }));
  }

  if (error) throw error;

  const rows = data ?? [];
  const parentIds = [
    ...new Set(rows.map((row) => row.parent_id).filter(Boolean)),
  ] as string[];

  let parentNames = new Map<string, string>();
  if (parentIds.length) {
    const { data: parents, error: parentsError } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', parentIds);
    if (parentsError) throw parentsError;
    parentNames = new Map((parents ?? []).map((p) => [p.id, p.name]));
  }

  return rows.map((row) => {
    const parentName = row.parent_id
      ? parentNames.get(row.parent_id)
      : undefined;
    const label = parentName ? `${parentName} › ${row.name}` : row.name;
    return { id: row.id, name: label };
  });
}

export async function listAuthors(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('authors')
    .select('id, name')
    .order('name');
  if (error) throw error;
  return data ?? [];
}
