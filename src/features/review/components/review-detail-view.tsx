import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { AdBannerSlot } from '@/features/ad-banners/components/ad-banner-slot';
import { cn } from '@/lib/utils';
import type { ActiveAdBannersMap } from '@/types/ad-banner';
import type { ReviewSummary } from '@/types/review';

import { ArticleContent } from './article-content';
import { AffiliateAutoOpen } from './affiliate-auto-open';
import { ReviewEngagementBar } from './review-engagement-bar';
import { StarRating } from './star-rating';

type ReviewDetailViewProps = {
  article: ReviewSummary;
  locale: string;
  adBanners?: ActiveAdBannersMap;
};

export async function ReviewDetailView({
  article,
  locale,
  adBanners = {},
}: ReviewDetailViewProps) {
  const t = await getTranslations('Review');
  const hasContent = Boolean(article.content?.trim());
  const affiliateUrl = article.affiliateLinks?.[0]?.url ?? '';
  const authorName =
    article.author.name === 'Editorial' ? 'Admin' : article.author.name;

  const desktopBanner = adBanners.review_detail_desktop;
  const mobileBanner = adBanners.review_detail_mobile;

  return (
    <div
      className={cn(
        'px-4 py-8 lg:py-12',
        desktopBanner &&
          'lg:mx-auto lg:flex lg:max-w-7xl lg:justify-center lg:gap-10',
      )}
    >
      <article
        className={cn(
          'mx-auto w-full max-w-3xl',
          desktopBanner && 'lg:mx-0 lg:shrink-0',
        )}
      >
        <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          {article.title}
        </h1>
        {affiliateUrl ? <AffiliateAutoOpen url={affiliateUrl} /> : null}

        <div className="mt-4 flex flex-wrap items-center gap-4 border-b pb-6">
          <div className="flex items-center gap-2">
            {article.author.avatar ? (
              <Image
                src={article.author.avatar}
                alt={authorName}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {authorName.charAt(0)}
              </span>
            )}
            <span className="text-sm font-medium">{authorName}</span>
          </div>
          <StarRating rating={article.rating} size="md" />
          <ReviewEngagementBar
            articleId={article.id}
            engagement={article.engagement}
            publishedAt={article.publishedAt}
            locale={locale}
          />
        </div>

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-xl">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        <p className="mt-6 text-lg font-bold leading-relaxed text-foreground">
          {article.excerpt}
        </p>

        {hasContent ? (
          <div className="mt-8">
            <ArticleContent html={article.content!} />
          </div>
        ) : (
          <p className="mt-8 rounded-lg border bg-muted/30 px-4 py-6 text-center text-muted-foreground">
            {t('contentEmpty')}
          </p>
        )}

        {article.tags.length > 0 ? (
          <ul className="mt-10 flex flex-wrap gap-2 border-t pt-6">
            {article.tags.map((tag) => (
              <li key={tag.slug}>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  #{tag.name}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {mobileBanner ? (
          <div className="mt-8 lg:hidden">
            <AdBannerSlot
              imageUrl={mobileBanner.imageUrl}
              linkUrl={mobileBanner.linkUrl}
              aspectRatio="16/9"
            />
          </div>
        ) : null}
      </article>

      {desktopBanner ? (
        <aside className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-24">
            <AdBannerSlot
              imageUrl={desktopBanner.imageUrl}
              linkUrl={desktopBanner.linkUrl}
              aspectRatio="9/16"
            />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
