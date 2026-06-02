import { Eye, MessageCircle, ThumbsUp } from 'lucide-react';

import { formatNumber, formatRelativeTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ReviewEngagement } from '@/types/review';

type ReviewMetaProps = {
  engagement: ReviewEngagement;
  publishedAt: string;
  locale: string;
  className?: string;
  compact?: boolean;
};

export function ReviewMeta({
  engagement,
  publishedAt,
  locale,
  className,
  compact,
}: ReviewMetaProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground',
        className,
      )}
    >
      <time dateTime={publishedAt}>
        {formatRelativeTime(publishedAt, locale)}
      </time>
      {!compact ? (
        <>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatNumber(engagement.views, locale)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {formatNumber(engagement.reactions, locale)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {formatNumber(engagement.comments, locale)}
          </span>
        </>
      ) : null}
    </div>
  );
}
