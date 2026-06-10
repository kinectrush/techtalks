import { getTranslations } from 'next-intl/server';

import type { ReviewSummary } from '@/types/review';

import { RelatedArticleCard } from './related-article-card';
import { RelatedArticlesCarousel } from './related-articles-carousel';

type RelatedArticlesSectionProps = {
  articles: ReviewSummary[];
  locale: string;
};

export async function RelatedArticlesSection({
  articles,
  locale,
}: RelatedArticlesSectionProps) {
  if (articles.length === 0) return null;

  const t = await getTranslations('Review');
  const labels = {
    hotLabel: t('badgeHot'),
    newLabel: t('badgeNew'),
    trendingLabel: t('badgeTrending'),
    readReviewLabel: t('readReview'),
  };

  return (
    <section
      className="mt-10 border-t pt-8"
      aria-labelledby="related-articles-heading"
    >
      <h2
        id="related-articles-heading"
        className="mb-5 text-xl font-bold md:text-2xl"
      >
        {t('relatedArticles')}
      </h2>

      <div className="lg:hidden">
        <RelatedArticlesCarousel
          articles={articles}
          locale={locale}
          {...labels}
        />
      </div>

      <div className="hidden grid-cols-3 gap-4 lg:grid">
        {articles.map((article) => (
          <RelatedArticleCard
            key={article.id}
            article={article}
            locale={locale}
            variant="grid"
            {...labels}
          />
        ))}
      </div>
    </section>
  );
}
