'use client';

import { Eye, ThumbsUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { FacebookIcon } from '@/components/icons/facebook-icon';
import { Button } from '@/components/ui/button';
import { formatNumber, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { openFacebookSharePopup } from '@/lib/share/facebook';
import type { ReviewEngagement } from '@/types/review';

type ReviewEngagementBarProps = {
  articleId: string;
  engagement: ReviewEngagement;
  publishedAt: string;
  locale: string;
  shareUrl: string;
  onLiked?: () => void;
};

const facebookButtonClass =
  'border-facebook bg-facebook text-facebook-foreground shadow-none hover:bg-facebook/90 focus-visible:ring-facebook/30 disabled:opacity-80';

function readLikedCookie(articleId: string): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split('; ').some((c) => c === `rv_liked_${articleId}=1`);
}

export function ReviewEngagementBar({
  articleId,
  engagement: initialEngagement,
  publishedAt,
  locale,
  shareUrl,
  onLiked,
}: ReviewEngagementBarProps) {
  const t = useTranslations('Review');
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

      <div className="ml-auto flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={facebookButtonClass}
          onClick={() => openFacebookSharePopup(shareUrl)}
          aria-label={t('shareFacebook')}
        >
          <FacebookIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{t('shareFacebook')}</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            facebookButtonClass,
            liked && 'bg-facebook-active hover:bg-facebook-active',
          )}
          onClick={handleLike}
          disabled={liked}
        >
          <ThumbsUp className="h-4 w-4" />
          {liked ? t('liked') : t('like')}
        </Button>
      </div>
    </div>
  );
}

