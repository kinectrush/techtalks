'use client';

import { useTranslations } from 'next-intl';

import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { Link } from '@/i18n/navigation';
import { useReviews } from '@/hooks/use-reviews';

import { StarRating } from './star-rating';

export function DashboardReviewListClient() {
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');
  const { data, error, isLoading, mutate } = useReviews();

  if (isLoading) {
    return <LoadingSpinner label={tCommon('loading')} className="py-12" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title={tCommon('error')}
        onRetry={() => mutate()}
        retryLabel={tCommon('retry')}
      />
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground">{t('reviewsEmpty')}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((review) => (
        <li
          key={review.id}
          className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <Link href={`/review/${review.slug}`} className="block space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand">
              {review.category.name}
            </p>
            <h3 className="font-semibold leading-snug line-clamp-2">
              {review.title}
            </h3>
            <StarRating rating={review.rating} />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {review.excerpt}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
