import { Eye } from 'lucide-react';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { getActiveAdBannersCached } from '@/features/ad-banners/actions';
import { AdBannerSlot } from '@/features/ad-banners/components/ad-banner-slot';
import { activeArticleDetailBanner } from '@/lib/article-detail-banners';
import { cn } from '@/lib/utils';
import type { ReviewSummary, ReviewTag } from '@/types/review';

function dedupeTagsBySlug(tags: ReviewTag[]): ReviewTag[] {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    if (seen.has(tag.slug)) return false;
    seen.add(tag.slug);
    return true;
  });
}

import { ArticleContent } from './article-content';
import { AffiliateAutoOpen } from './affiliate-auto-open';
import { ArticleDetailBannerDialog } from './article-detail-banner-dialog';
import { ReviewEngagementBar } from './review-engagement-bar';
import { StarRating } from './star-rating';

type ReviewDetailViewProps = {
  article: ReviewSummary;
  locale: string;
  isDraftPreview?: boolean;
};

export async function ReviewDetailView({
  article,
  locale,
  isDraftPreview = false,
}: ReviewDetailViewProps) {
  const t = await getTranslations('Review');
  const hasContent = Boolean(article.content?.trim());
  const affiliateUrl = article.affiliateLinks?.[0]?.url ?? '';
  const authorName =
    article.author.name === 'Editorial' ? 'Admin' : article.author.name;

  const adBanners = await getActiveAdBannersCached();
  const desktopBanner = activeArticleDetailBanner(article.detailAdBannerDesktop);
  const mobileBanner = activeArticleDetailBanner(article.detailAdBannerMobile);
  const popupBanner = adBanners.review_detail_popup;

  return (
    <div
      className={cn(
        'px-4 py-8 lg:py-12',
        desktopBanner &&
          'lg:mx-auto lg:flex lg:max-w-7xl lg:justify-center lg:gap-10',
      )}
    >
      {isDraftPreview ? (
        <div className="mx-auto mb-6 flex max-w-3xl items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          <Eye className="h-4 w-4 shrink-0" aria-hidden />
          <p>{t('draftPreviewBanner')}</p>
        </div>
      ) : null}

      {popupBanner ? (
        <ArticleDetailBannerDialog
          imageUrl={popupBanner.imageUrl}
          linkUrl={popupBanner.linkUrl}
        />
      ) : null}

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
            {dedupeTagsBySlug(article.tags).map((tag) => (
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
