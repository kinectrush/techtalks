import { getTranslations } from 'next-intl/server';
import { LinkPendingIndicator } from '@/components/common/link-pending-indicator';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ReviewCategory } from '@/types/review';

type ReviewsCategoryFilterProps = {
  parentCategory: ReviewCategory;
  subcategories: ReviewCategory[];
  /** Set when a subcategory is selected; omit for parent "all" */
  activeSubSlug?: string;
};

export async function ReviewsCategoryFilter({
  parentCategory,
  subcategories,
  activeSubSlug,
}: ReviewsCategoryFilterProps) {
  const t = await getTranslations('Review');

  if (subcategories.length === 0) {
    return null;
  }

  const isAllActive = !activeSubSlug;

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2"
      aria-label={t('filterBySubcategory')}
    >
      <Link
        href={`/reviews?category=${parentCategory.slug}`}
        className={cn(
          'inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
          isAllActive
            ? 'bg-brand text-white'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        )}
      >
        {t('allCategories')}
        <LinkPendingIndicator />
      </Link>
      {subcategories.map((sub) => {
        const active = activeSubSlug === sub.slug;
        return (
          <Link
            key={sub.slug}
            href={`/reviews?category=${sub.slug}`}
            className={cn(
              'inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            {sub.name}
            <LinkPendingIndicator />
          </Link>
        );
      })}
    </nav>
  );
}
