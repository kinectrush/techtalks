'use client';

import Image from 'next/image';
import { CalendarDays } from 'lucide-react';
import { LinkPendingIndicator } from '@/components/common/link-pending-indicator';
import { Link } from '@/i18n/navigation';
import { formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ReviewSummary } from '@/types/review';
import { HotBadgeLabel } from './hot-badge';
import { StarRating } from './star-rating';

type RelatedArticleCardProps = {
  article: ReviewSummary;
  locale: string;
  hotLabel: string;
  newLabel: string;
  trendingLabel: string;
  readReviewLabel: string;
  variant?: 'default' | 'grid';
  className?: string;
};

function formatPublishedDate(iso: string, locale: string): string {
  const dateLocale = locale.startsWith('vi') ? 'vi-VN' : 'en-US';
  return new Intl.DateTimeFormat(dateLocale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

export function RelatedArticleCard({
  article,
  locale,
  hotLabel,
  newLabel,
  trendingLabel,
  readReviewLabel,
  variant = 'default',
  className,
}: RelatedArticleCardProps) {
  const href = `/review/${article.slug}` as const;
  const isGrid = variant === 'grid';

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-md',
        className,
      )}
    >
      <Link
        href={href}
        className={cn(
          'relative w-full shrink-0 overflow-hidden bg-muted/20',
          isGrid ? 'aspect-[4/3]' : 'aspect-[16/10]',
        )}
      >
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes={
            isGrid
              ? '(max-width: 1024px) 0px, 240px'
              : '(max-width: 768px) 88vw, 320px'
          }
        />
        <LinkPendingIndicator className="absolute inset-0 bg-black/35 text-white" />
      </Link>

      <div
        className={cn(
          'flex flex-1 flex-col',
          isGrid ? 'gap-2 p-3' : 'gap-3 p-4',
        )}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            {article.category.name}
          </span>
          {article.listBadge ? (
            <HotBadgeLabel
              type={article.listBadge}
              hotLabel={hotLabel}
              newLabel={newLabel}
              trendingLabel={trendingLabel}
            />
          ) : null}
        </div>

        <Link href={href} className="group inline-flex items-start gap-2">
          <h3
            className={cn(
              'font-bold leading-snug text-foreground group-hover:text-brand',
              isGrid
                ? 'line-clamp-2 text-sm normal-case'
                : 'line-clamp-3 text-base uppercase',
            )}
          >
            {article.title}
          </h3>
          <LinkPendingIndicator className="mt-0.5 shrink-0 text-brand" />
        </Link>

        {!isGrid ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        ) : null}

        <div className={cn('mt-auto space-y-2', isGrid ? 'pt-0.5' : 'pt-1')}>
          <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
            <CalendarDays className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            <time dateTime={article.publishedAt}>
              {isGrid
                ? formatRelativeTime(article.publishedAt, locale)
                : formatPublishedDate(article.publishedAt, locale)}
            </time>
          </p>

          <div
            className={cn(
              'flex items-center gap-2',
              isGrid ? 'flex-col items-stretch' : 'justify-between',
            )}
          >
            <StarRating rating={article.rating} size="sm" />
            <Link
              href={href}
              className={cn(
                'inline-flex items-center justify-center rounded-lg bg-brand font-semibold text-brand-foreground transition-opacity hover:opacity-90',
                isGrid
                  ? 'px-2.5 py-1 text-[11px]'
                  : 'shrink-0 px-3 py-1.5 text-xs',
              )}
            >
              {readReviewLabel}
              <LinkPendingIndicator className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
