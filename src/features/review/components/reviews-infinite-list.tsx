'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import { LoadingSpinner } from '@/components/common/loading-spinner';
import type { PaginatedResponse } from '@/types/api';
import type { ReviewSummary } from '@/types/review';

import { ReviewCard } from './review-card';

type ReviewsInfiniteListProps = {
  initialItems: ReviewSummary[];
  initialPage: number;
  total: number;
  pageSize: number;
  locale: string;
  categorySlug?: string;
  searchQuery?: string;
  labels: {
    hotLabel: string;
    newLabel: string;
    trendingLabel: string;
  };
};

export function ReviewsInfiniteList({
  initialItems,
  initialPage,
  total,
  pageSize,
  locale,
  categorySlug,
  searchQuery,
  labels,
}: ReviewsInfiniteListProps) {
  const t = useTranslations('Review');
  const tCommon = useTranslations('Common');

  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialItems.length < total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setItems(initialItems);
    setPage(initialPage);
    setHasMore(initialItems.length < total);
    setError(false);
  }, [initialItems, initialPage, total, categorySlug, searchQuery]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoading(true);
    setError(false);

    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({ page: String(nextPage) });
      if (categorySlug) params.set('category', categorySlug);
      if (searchQuery) params.set('q', searchQuery);

      const response = await fetch(`/api/reviews/list?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load reviews');

      const result = (await response.json()) as PaginatedResponse<ReviewSummary>;
      setItems((prev) => {
        const merged = [...prev, ...result.data];
        setHasMore(merged.length < result.total);
        return merged;
      });
      setPage(result.page);
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [categorySlug, hasMore, page, searchQuery]);

  useEffect(() => {
    if (!hasMore || error) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: '320px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadMore]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <ReviewCard
            key={article.id}
            article={article}
            locale={locale}
            hotLabel={labels.hotLabel}
            newLabel={labels.newLabel}
            trendingLabel={labels.trendingLabel}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-px" aria-hidden />

      {loading ? (
        <LoadingSpinner label={t('loadMoreLoading')} className="py-8" />
      ) : null}

      {error ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <p className="text-sm text-muted-foreground">{t('loadMoreError')}</p>
          <button
            type="button"
            onClick={() => void loadMore()}
            className="cursor-pointer rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            {tCommon('retry')}
          </button>
        </div>
      ) : null}

      {!hasMore && !loading && !error && items.length >= pageSize ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {t('loadMoreEnd')}
        </p>
      ) : null}
    </div>
  );
}
