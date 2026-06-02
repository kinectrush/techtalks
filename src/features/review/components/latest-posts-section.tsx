import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { ReviewSummary } from '@/types/review';

import { ReviewCard } from './review-card';

type LatestPostsSectionProps = {
  articles: ReviewSummary[];
  locale: string;
};

export async function LatestPostsSection({
  articles,
  locale,
}: LatestPostsSectionProps) {
  const t = await getTranslations('Review');

  return (
    <section className="space-y-4" aria-labelledby="latest-heading">
      <div className="flex items-center justify-between">
        <h2 id="latest-heading" className="text-xl font-bold md:text-2xl">
          {t('latestPosts')}
        </h2>
        <Button asChild variant="ghost" size="sm" className="text-brand">
          <Link href="/reviews">{t('viewAll')}</Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {articles.map((article) => (
          <ReviewCard
            key={article.id}
            article={article}
            locale={locale}
            hotLabel={t('badgeHot')}
            newLabel={t('badgeNew')}
            trendingLabel={t('badgeTrending')}
          />
        ))}
      </div>
    </section>
  );
}
