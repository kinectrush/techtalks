'use client';

import { Eye, ThumbsUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { formatNumber, formatRelativeTime } from '@/lib/format';
import type { ReviewEngagement } from '@/types/review';

type ReviewEngagementBarProps = {
  articleId: string;
  engagement: ReviewEngagement;
  publishedAt: string;
  locale: string;
  onLiked?: () => void;
};

function readLikedCookie(articleId: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === `rv_liked_${articleId}=1`);
}

export function ReviewEngagementBar({
  articleId,
  engagement: initialEngagement,
  publishedAt,
  locale,
  onLiked,
}: ReviewEngagementBarProps) {
  const [engagement, setEngagement] = useState(initialEngagement);
  const [liked, setLiked] = useState(false);
  const viewKey = useMemo(() => `rv_view_once:${articleId}`, [articleId]);

  useEffect(() => {
    setLiked(readLikedCookie(articleId));
  }, [articleId]);

  useEffect(() => {
    // count 1 view per tab-session
    try {
      if (sessionStorage.getItem(viewKey)) return;
      sessionStorage.setItem(viewKey, '1');
    } catch {
      // ignore
    }

    fetch(`/api/reviews/${articleId}/view`, { method: 'POST' })
      .then((r) => r.json())
      .then((json) => {
        if (json?.engagement) setEngagement(json.engagement as ReviewEngagement);
      })
      .catch(() => {});
  }, [articleId, viewKey]);

  async function handleLike() {
    if (liked) return;
    try {
      const res = await fetch(`/api/reviews/${articleId}/like`, { method: 'POST' });
      const json = await res.json();
      if (json?.engagement) setEngagement(json.engagement as ReviewEngagement);
      setLiked(true);
      onLiked?.();
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
      <time dateTime={publishedAt}>{formatRelativeTime(publishedAt, locale)}</time>
      <span className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5" />
        {formatNumber(engagement.views, locale)}
      </span>
      <span className="flex items-center gap-1">
        <ThumbsUp className="h-3.5 w-3.5" />
        {formatNumber(engagement.reactions, locale)}
      </span>

      <Button
        type="button"
        variant={liked ? 'secondary' : 'outline'}
        size="sm"
        className="ml-auto"
        onClick={handleLike}
        disabled={liked}
      >
        <ThumbsUp className="h-4 w-4" />
        {liked ? 'Đã like' : 'Like'}
      </Button>
    </div>
  );
}

