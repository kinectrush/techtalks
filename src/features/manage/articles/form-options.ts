import {
  articleToFormValues,
  type AdminArticleFormValues,
} from '@/features/manage/articles/schema';
import type { AdminArticleRow } from '@/types/admin';

export type ArticleFormOption = { id: string; name: string; slug?: string };

export type ArticleFormCategoryOption = ArticleFormOption & {
  parentId: string | null;
};

/** Sentinel value for subcategory select meaning "assign to parent category". */
export const ARTICLE_ALL_SUBCATEGORY = '__all__';

/** Sentinel value for list filter — no parent category selected. */
export const ARTICLE_ALL_PARENT_CATEGORY = '__all_parents__';

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

export function getParentCategories(
  categories: ArticleFormCategoryOption[],
): ArticleFormCategoryOption[] {
  return categories.filter((category) => !category.parentId);
}

export function getSubcategoriesForParent(
  categories: ArticleFormCategoryOption[],
  parentId: string,
): ArticleFormCategoryOption[] {
  return categories.filter((category) => category.parentId === parentId);
}

export function resolveCategoryFormFields(
  categoryId: string,
  categories: ArticleFormCategoryOption[],
): { parentCategoryId: string; subcategoryId: string } {
  const match = categories.find((category) => category.id === categoryId);
  if (!match) {
    return {
      parentCategoryId: categoryId,
      subcategoryId: ARTICLE_ALL_SUBCATEGORY,
    };
  }
  if (match.parentId) {
    return {
      parentCategoryId: match.parentId,
      subcategoryId: categoryId,
    };
  }
  return {
    parentCategoryId: categoryId,
    subcategoryId: ARTICLE_ALL_SUBCATEGORY,
  };
}

export function resolveStoredCategoryId(
  parentCategoryId: string,
  subcategoryId: string,
): string {
  return subcategoryId === ARTICLE_ALL_SUBCATEGORY
    ? parentCategoryId
    : subcategoryId;
}

export function buildArticleFormDefaults(
  article: AdminArticleRow | null,
  categories: ArticleFormCategoryOption[],
  authors: ArticleFormOption[],
): AdminArticleFormValues {
  if (article) {
    return articleToFormValues(article, categories);
  }

  const parents = getParentCategories(categories);

  return {
    title: '',
    slug: '',
    subtitle: '',
    excerpt: '',
    content: '',
    coverImage: '',
    editorPickCoverImageMobile: '',
    editorPickCoverImageDesktop: '',
    affiliateUrl: '',
    status: 'draft',
    isActive: true,
    rating: 4,
    publishedAt: new Date().toISOString().slice(0, 16),
    parentCategoryId: parents[0]?.id ?? '',
    subcategoryId: ARTICLE_ALL_SUBCATEGORY,
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
