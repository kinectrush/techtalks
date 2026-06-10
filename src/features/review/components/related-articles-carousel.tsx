'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import type { ReviewSummary } from '@/types/review';

import { RelatedArticleCard } from './related-article-card';

const AUTO_SLIDE_MS = 3000;

type RelatedArticlesCarouselProps = {
  articles: ReviewSummary[];
  locale: string;
  hotLabel: string;
  newLabel: string;
  trendingLabel: string;
  readReviewLabel: string;
};

export function RelatedArticlesCarousel({
  articles,
  locale,
  hotLabel,
  newLabel,
  trendingLabel,
  readReviewLabel,
}: RelatedArticlesCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pauseUntilRef = useRef(0);
  const userInteractingRef = useRef(false);

  const scrollToIndex = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;

    const child = container.children[index] as HTMLElement | undefined;
    if (!child) return;

    container.scrollTo({
      left: child.offsetLeft,
      behavior: 'smooth',
    });
    setActiveIndex(index);
  }, []);

  const updateActiveIndexFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || container.children.length === 0) return;

    const scrollLeft = container.scrollLeft;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    Array.from(container.children).forEach((child, index) => {
      const element = child as HTMLElement;
      const distance = Math.abs(element.offsetLeft - scrollLeft);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;

    const interval = window.setInterval(() => {
      if (userInteractingRef.current) return;
      if (Date.now() < pauseUntilRef.current) return;

      setActiveIndex((current) => {
        const nextIndex = (current + 1) % articles.length;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(interval);
  }, [articles.length, scrollToIndex]);

  function pauseAutoSlide(durationMs = AUTO_SLIDE_MS * 2) {
    pauseUntilRef.current = Date.now() + durationMs;
  }

  return (
    <div className="space-y-4">
      <div
        ref={scrollRef}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        onScroll={updateActiveIndexFromScroll}
        onTouchStart={() => {
          userInteractingRef.current = true;
          pauseAutoSlide();
        }}
        onTouchEnd={() => {
          userInteractingRef.current = false;
        }}
        onMouseDown={() => {
          userInteractingRef.current = true;
          pauseAutoSlide();
        }}
        onMouseUp={() => {
          userInteractingRef.current = false;
        }}
      >
        {articles.map((article) => (
          <div
            key={article.id}
            className="w-[88%] shrink-0 snap-start sm:w-[82%]"
          >
            <RelatedArticleCard
              article={article}
              locale={locale}
              hotLabel={hotLabel}
              newLabel={newLabel}
              trendingLabel={trendingLabel}
              readReviewLabel={readReviewLabel}
            />
          </div>
        ))}
      </div>

      {articles.length > 1 ? (
        <div className="flex items-center justify-center gap-2">
          {articles.map((article, index) => (
            <button
              key={article.id}
              type="button"
              aria-label={`Slide ${index + 1}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => {
                pauseAutoSlide();
                scrollToIndex(index);
              }}
              className={cn(
                'h-2 rounded-full transition-all',
                index === activeIndex
                  ? 'w-8 bg-brand'
                  : 'w-2 bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
