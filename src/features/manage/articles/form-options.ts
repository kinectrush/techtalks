import {
  articleToFormValues,
  type AdminArticleFormValues,
} from '@/features/manage/articles/schema';
import type { AdminArticleRow } from '@/types/admin';

export type ArticleFormOption = { id: string; name: string; slug?: string };

/** Ensures Radix Select can display the article's current category/author even if inactive. */
export function withSelectedFormOption(
  options: ArticleFormOption[],
  selectedId: string | undefined,
  selectedName: string | undefined,
): ArticleFormOption[] {
  if (!selectedId || options.some((o) => o.id === selectedId)) {
    return options;
  }
  if (!selectedName) return options;
  return [...options, { id: selectedId, name: selectedName }];
}

export function buildArticleFormDefaults(
  article: AdminArticleRow | null,
  categories: ArticleFormOption[],
  authors: ArticleFormOption[],
): AdminArticleFormValues {
  if (article) {
    return articleToFormValues(article);
  }

  return {
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    content: '',
    coverImage: '',
    editorPickCoverImageMobile: '',
    editorPickCoverImageDesktop: '',
    ogImage: '',
    canonicalUrl: '',
    affiliateUrl: '',
    status: 'draft',
    isActive: true,
    rating: 4,
    publishedAt: new Date().toISOString().slice(0, 16),
    categoryId: categories[0]?.id ?? '',
    authorId: authors[0]?.id ?? '',
    tagsText: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isEditorPick: false,
    detailAdBannerDesktopImageUrl: '',
    detailAdBannerDesktopLinkUrl: '',
    detailAdBannerDesktopActive: false,
    detailAdBannerMobileImageUrl: '',
    detailAdBannerMobileLinkUrl: '',
    detailAdBannerMobileActive: false,
  };
}
