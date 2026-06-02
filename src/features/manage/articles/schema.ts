import { z } from 'zod';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function isoToDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function datetimeLocalToIso(value: string): string {
  // value from <input type="datetime-local"> has no timezone → treat as local time.
  const d = new Date(value);
  return d.toISOString();
}

export const adminArticleSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  subtitle: z.string().optional(),
  excerpt: z.string().min(10, 'Excerpt is required'),
  content: z.string().optional(),
  coverImage: z.string().url('Cover image is required'),
  editorPickCoverImageMobile: z.string().url().optional().or(z.literal('')),
  editorPickCoverImageDesktop: z.string().url().optional().or(z.literal('')),
  ogImage: z.string().url().optional().or(z.literal('')),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
  affiliateUrl: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().uuid('Select a category'),
  authorId: z.string().uuid('Select an author'),
  publishedAt: z.string().min(1, 'Published date is required'),
  status: z.enum(['draft', 'published', 'archived']),
  isActive: z.boolean(),
  rating: z.number().min(0).max(5),
  tagsText: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().max(320).optional(),
  metaKeywords: z.string().optional(),
  isEditorPick: z.boolean().optional(),
});

export type AdminArticleFormValues = z.infer<typeof adminArticleSchema>;

export function formValuesToArticleInput(
  values: AdminArticleFormValues,
): import('@/types/admin').AdminArticleInput {
  const parseTags = (text?: string) =>
    text
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((name) => ({
        name,
        slug: name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
      })) ?? [];

  return {
    title: values.title,
    slug: values.slug,
    subtitle: values.subtitle,
    excerpt: values.excerpt,
    content: values.content,
    coverImage: values.coverImage,
    editorPickCoverImageMobile: values.editorPickCoverImageMobile || undefined,
    editorPickCoverImageDesktop: values.editorPickCoverImageDesktop || undefined,
    ogImage: values.ogImage || undefined,
    canonicalUrl: values.canonicalUrl || undefined,
    affiliateUrl: values.affiliateUrl || undefined,
    categoryId: values.categoryId,
    authorId: values.authorId,
    publishedAt: datetimeLocalToIso(values.publishedAt),
    status: values.status,
    isActive: values.isActive,
    rating: values.rating,
    pros: [],
    cons: [],
    tags: parseTags(values.tagsText),
    metaTitle: values.metaTitle,
    metaDescription: values.metaDescription,
    metaKeywords: values.metaKeywords,
    isEditorPick: values.isEditorPick ?? false,
  };
}

export function articleToFormValues(
  article: import('@/types/admin').AdminArticleRow,
): AdminArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    subtitle: article.subtitle ?? '',
    excerpt: article.excerpt,
    content: article.content ?? '',
    coverImage: article.coverImage,
    editorPickCoverImageMobile: article.editorPickCoverImageMobile ?? '',
    editorPickCoverImageDesktop: article.editorPickCoverImageDesktop ?? '',
    ogImage: article.ogImage ?? '',
    canonicalUrl: article.canonicalUrl ?? '',
    affiliateUrl: article.affiliateUrl ?? '',
    categoryId: article.categoryId,
    authorId: article.authorId,
    publishedAt: isoToDatetimeLocal(article.publishedAt),
    status: article.status,
    isActive: article.isActive,
    rating: article.rating,
    tagsText: article.tags.map((t) => t.name).join(', '),
    metaTitle: article.metaTitle ?? '',
    metaDescription: article.metaDescription ?? '',
    metaKeywords: article.metaKeywords ?? '',
    isEditorPick: article.isEditorPick,
  };
}
