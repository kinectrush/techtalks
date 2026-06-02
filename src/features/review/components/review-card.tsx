import Image from 'next/image';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ReviewSummary } from '@/types/review';

import { HotBadgeLabel } from './hot-badge';
import { StarRating } from './star-rating';

type ReviewCardProps = {
  article: ReviewSummary;
  locale: string;
  hotLabel: string;
  newLabel: string;
  trendingLabel: string;
  variant?: 'default' | 'horizontal' | 'compact';
  rank?: number;
  className?: string;
};

export function ReviewCard({
  article,
  locale,
  hotLabel,
  newLabel,
  trendingLabel,
  variant = 'default',
  rank,
  className,
}: ReviewCardProps) {
  const href = `/review/${article.slug}` as const;
  const isHorizontal = variant === 'horizontal';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md',
        isHorizontal ? 'flex gap-4 p-3' : 'flex flex-col',
        className,
      )}
    >
      {rank ? (
        <span
          className={cn(
            'absolute z-10 flex h-8 w-8 items-center justify-center rounded-br-lg bg-brand text-sm font-bold text-white',
            isHorizontal ? 'left-0 top-0' : 'left-0 top-0',
          )}
        >
          {rank}
        </span>
      ) : null}

      <Link
        href={href}
        className={cn(
          'relative shrink-0 overflow-hidden bg-muted/20',
          isHorizontal ? 'h-24 aspect-video' : 'aspect-video w-full',
        )}
      >
        <Image
          src={article.coverImage}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes={isHorizontal ? '144px' : '(max-width:768px) 100vw, 50vw'}
        />
      </Link>

      <div className={cn('flex flex-1 flex-col', isHorizontal ? 'py-1 pr-3' : 'gap-2 p-4')}>
        <div className="flex flex-wrap items-center gap-2">
          {article.listBadge ? (
            <HotBadgeLabel
              type={article.listBadge}
              hotLabel={hotLabel}
              newLabel={newLabel}
              trendingLabel={trendingLabel}
            />
          ) : null}
        </div>

        <Link href={href}>
          <h3
            className={cn(
              'font-semibold leading-snug text-foreground group-hover:text-brand',
              isHorizontal ? 'line-clamp-2 text-base' : 'line-clamp-2 text-lg md:text-xl',
            )}
          >
            {article.title}
          </h3>
        </Link>

        {!isHorizontal && variant !== 'compact' ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <StarRating rating={article.rating} />
        </div>
      </div>
    </article>
  );
}
