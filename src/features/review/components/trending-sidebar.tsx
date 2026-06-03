import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ReviewSummary } from '@/types/review';

type TrendingSidebarProps = {
  articles: ReviewSummary[];
  locale: string;
};

export async function TrendingSidebar({
  articles,
  locale,
}: TrendingSidebarProps) {
  const t = await getTranslations('Review');

  return (
    <aside
      className="rounded-xl border bg-card p-4 shadow-sm"
      aria-labelledby="sidebar-trending"
    >
      <h2
        id="sidebar-trending"
        className="mb-4 border-b pb-3 text-sm font-bold uppercase tracking-wider text-brand"
      >
        {t('topTrending7d')}
      </h2>

      <ol className="space-y-3">
        {articles.map((article, idx) => {
          const rank = article.hotRank ?? idx + 1;
          return (
          <li key={article.id}>
            <Link
              href={`/review/${article.slug}`}
              className="group flex cursor-pointer gap-3 rounded-md p-2 transition-colors hover:bg-muted/60"
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-bold',
                  rank <= 3
                    ? 'bg-brand text-white'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-brand">
                  {article.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(article.engagement.views7d, locale)}{' '}
                  {t('views')} · {article.trendingScore7d.toFixed(1)} pts
                </p>
              </div>
            </Link>
          </li>
          );
        })}
      </ol>
    </aside>
  );
}
