import type { ReviewsCategoryContext } from '@/types/review';

/** Slug passed to article list/search APIs for the current reviews view. */
export function resolveReviewsListCategorySlug(
  categorySlug: string | undefined,
  context: ReviewsCategoryContext | null,
): string | undefined {
  if (!categorySlug) return undefined;
  if (!context) return categorySlug;
  return context.isParentAll ? context.parent.slug : categorySlug;
}
