import { getTranslations } from 'next-intl/server';

import { getPublishedReviewsForClientAction } from '@/features/review/actions';
import { Link } from '@/i18n/navigation';

import { StarRating } from './star-rating';

type DashboardReviewListServerProps = {
  limit?: number;
};

export async function DashboardReviewListServer({
  limit = 6,
}: DashboardReviewListServerProps) {
  const t = await getTranslations('Dashboard');
  const reviews = (await getPublishedReviewsForClientAction()).slice(0, limit);

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground">{t('reviewsEmpty')}</p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {reviews.map((review) => (
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
