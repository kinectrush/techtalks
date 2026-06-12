'use client';

import { type MouseEvent, useCallback } from 'react';

import { isInAppBrowser } from '@/lib/navigation/in-app-browser';
import { openExternalLink } from '@/lib/navigation/open-external-link';
import { sanitizeArticleHtml } from '@/lib/html/sanitize-article-html';
import { cn } from '@/lib/utils';

type ArticleContentProps = {
  html: string;
  className?: string;
};

export function ArticleContent({ html, className }: ArticleContentProps) {
  const sanitized = sanitizeArticleHtml(html);

  const handleClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!isInAppBrowser()) return;

    const anchor = (event.target as Element | null)?.closest('a[href]');
    if (!anchor || !event.currentTarget.contains(anchor)) return;

    const href = anchor.getAttribute('href');
    if (!href || anchor.getAttribute('target') !== '_blank') return;

    event.preventDefault();
    openExternalLink(href);
  }, []);

  return (
    <div
      className={cn('article-prose text-foreground', className)}
      dangerouslySetInnerHTML={{ __html: sanitized }}
      onClick={handleClick}
    />
  );
}
