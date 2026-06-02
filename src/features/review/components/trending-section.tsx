import { getTranslations } from 'next-intl/server';
import { Flame } from 'lucide-react';

import type { ReviewSummary } from '@/types/review';

import { ReviewCard } from './review-card';

type TrendingSectionProps = {
  articles: ReviewSummary[];
  locale: string;
};

export async function TrendingSection({
  articles,
  locale,
}: TrendingSectionProps) {
  const t = await getTranslations('Review');

  return (
    <section className="space-y-4" aria-labelledby="trending-heading">
      <div className="flex items-center justify-between border-b border-brand/20 pb-3">
        <h2
          id="trending-heading"
          className="flex items-center gap-2 text-xl font-bold md:text-2xl"
        >
          <Flame className="h-6 w-6 text-brand" />
          {t('trending24h')}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {articles.map((article) => (
          <ReviewCard
            key={article.id}
            article={article}
            locale={locale}
            hotLabel={t('badgeHot')}
            newLabel={t('badgeNew')}
            trendingLabel={t('badgeTrending')}
            variant="horizontal"
          />
        ))}
      </div>
    </section>
  );
}
