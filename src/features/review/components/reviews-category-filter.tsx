import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ReviewCategory } from '@/types/review';

type ReviewsCategoryFilterProps = {
  categories: ReviewCategory[];
  activeSlug?: string;
};

export async function ReviewsCategoryFilter({
  categories,
  activeSlug,
}: ReviewsCategoryFilterProps) {
  const t = await getTranslations('Review');

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2"
      aria-label={t('filterByCategory')}
    >
      <Link
        href="/reviews"
        className={cn(
          'cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors',
          !activeSlug
            ? 'bg-brand text-white'
            : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
        )}
      >
        {t('allCategories')}
      </Link>
      {categories.map((cat) => {
        const active = activeSlug === cat.slug;
        return (
          <Link
            key={cat.slug}
            href={`/reviews?category=${cat.slug}`}
            className={cn(
              'cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-brand text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            {cat.name}
          </Link>
        );
      })}
    </nav>
  );
}
