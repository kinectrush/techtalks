import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import type { ReviewSummary } from '@/types/review';

import { HotBadgeLabel } from './hot-badge';
import { StarRating } from './star-rating';

type HeroBannerProps = {
  article: ReviewSummary;
  locale: string;
};

export async function HeroBanner({ article, locale }: HeroBannerProps) {
  const t = await getTranslations('Review');
  const href = `/review/${article.slug}` as const;

  return (
    <section className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
      <Link
        href={href}
        aria-label={article.title}
        className="absolute inset-0 z-10"
      />
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[16/10] md:aspect-auto md:min-h-[360px]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent md:bg-gradient-to-r" />
        </div>

        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2">
            {article.listBadge ? (
              <HotBadgeLabel
                type={article.listBadge}
                hotLabel={t('badgeHot')}
                newLabel={t('badgeNew')}
                trendingLabel={t('badgeTrending')}
              />
            ) : null}
          </div>

          <h1 className="text-2xl font-bold leading-tight tracking-tight group-hover:text-brand md:text-3xl lg:text-4xl">
            {article.title}
          </h1>

          <p className="line-clamp-3 text-sm text-muted-foreground md:text-base">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <StarRating rating={article.rating} size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
