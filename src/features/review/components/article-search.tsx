'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Link, useRouter } from '@/i18n/navigation';
import { SEARCH_MIN_LENGTH } from '@/lib/search/normalize-query';
import { cn } from '@/lib/utils';
import type { ReviewSearchResult } from '@/types/review';

type ArticleSearchProps = {
  className?: string;
  variant?: 'inline' | 'drawer';
};

type SearchResponse = {
  data: ReviewSearchResult[];
  query: string;
};

export function ArticleSearch({
  className,
  variant = 'inline',
}: ArticleSearchProps) {
  const t = useTranslations('Review');
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ReviewSearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebouncedValue(query, 300);
  const showDropdown = open && debouncedQuery.trim().length >= SEARCH_MIN_LENGTH;

  const navigateToResults = useCallback(
    (term: string) => {
      const normalized = term.trim();
      if (normalized.length < SEARCH_MIN_LENGTH) return;
      setOpen(false);
      setQuery('');
      router.push(`/reviews?q=${encodeURIComponent(normalized)}`);
    },
    [router],
  );

  useEffect(() => {
    const term = debouncedQuery.trim();
    if (term.length < SEARCH_MIN_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    void (async () => {
      try {
        const res = await fetch(
          `/api/reviews/search?q=${encodeURIComponent(term)}&limit=8`,
          { signal: controller.signal },
        );
        if (!res.ok) throw new Error('search failed');
        const json = (await res.json()) as SearchResponse;
        setResults(json.data);
        setActiveIndex(-1);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setResults([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    if (!showDropdown) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showDropdown]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        setOpen(false);
        setQuery('');
        router.push(`/review/${results[activeIndex].slug}`);
        return;
      }
      navigateToResults(query);
      return;
    }

    if (!showDropdown || results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        'relative',
        variant === 'inline' ? 'w-full max-w-xs lg:max-w-sm' : 'w-full',
        className,
      )}
      role="search"
    >
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          className={cn(
            'h-9 w-full pl-9 pr-9',
            variant === 'drawer' && 'h-10',
          )}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {loading ? (
          <Loader2
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
            aria-hidden
          />
        ) : query ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-sm p-1 text-muted-foreground hover:text-foreground"
            aria-label={t('searchClear')}
            onClick={clearQuery}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {showDropdown ? (
        <div
          className={cn(
            'absolute z-50 mt-1 w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
            variant === 'drawer' && 'relative mt-2 shadow-none',
          )}
        >
          <ul
            id={listboxId}
            role="listbox"
            aria-label={t('searchResults')}
            className="max-h-80 overflow-y-auto py-1"
          >
            {loading && results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {t('searchLoading')}
              </li>
            ) : null}

            {!loading && results.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                {t('noSearchResults')}
              </li>
            ) : null}

            {results.map((article, index) => (
              <li key={article.id} role="option" aria-selected={index === activeIndex}>
                <Link
                  href={`/review/${article.slug}`}
                  className={cn(
                    'block cursor-pointer px-3 py-2 transition-colors hover:bg-muted',
                    index === activeIndex && 'bg-muted',
                  )}
                  onClick={() => {
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <p className="line-clamp-1 text-sm font-medium">
                    {article.title}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {article.category.name}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          {results.length > 0 ? (
            <button
              type="button"
              className="w-full cursor-pointer border-t px-3 py-2 text-left text-sm font-medium text-brand hover:bg-muted"
              onClick={() => navigateToResults(query)}
            >
              {t('searchViewAll', { query: debouncedQuery.trim() })}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
