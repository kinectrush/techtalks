import type { SupabaseClient } from '@supabase/supabase-js';

import type { AdminArticleInput, AdminArticleRow } from '@/types/admin';

type DbArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content: string | null;
  cover_image: string;
  og_image: string | null;
  canonical_url: string | null;
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
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    ogImage: row.og_image,
    canonicalUrl: row.canonical_url,
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
    og_image: input.ogImage ?? null,
    canonical_url: input.canonicalUrl ?? null,
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
  cover_image, og_image, canonical_url,
  category_id, author_id, published_at, updated_at,
  status, is_active, rating, pros, cons, tags,
  meta_title, meta_description, meta_keywords,
  is_editor_pick, created_at,
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

export async function createAdminArticle(
  supabase: SupabaseClient,
  input: AdminArticleInput,
) {
  const { data, error } = await supabase
    .from('review_articles')
    .insert(toDbPayload(input))
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
    .select('id, slug, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listAuthors(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('authors')
    .select('id, name')
    .order('name');
  if (error) throw error;
  return data ?? [];
}
