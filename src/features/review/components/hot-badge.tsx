import { Flame, Sparkles, TrendingUp } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { ReviewSummary } from '@/types/review';

type HotBadgeLabelProps = {
  type: NonNullable<ReviewSummary['listBadge']> | 'trending';
  hotLabel: string;
  newLabel: string;
  trendingLabel: string;
  className?: string;
};

export function HotBadgeLabel({
  type,
  hotLabel,
  newLabel,
  trendingLabel,
  className,
}: HotBadgeLabelProps) {
  if (type === 'new') {
    return (
      <Badge variant="trending" className={className}>
        <Sparkles className="mr-1 h-3 w-3" />
        {newLabel}
      </Badge>
    );
  }

  if (type === 'hot') {
    return (
      <Badge variant="hot" className={className}>
        <Flame className="mr-1 h-3 w-3" />
        {hotLabel}
      </Badge>
    );
  }

  return (
    <Badge variant="trending" className={className}>
      <TrendingUp className="mr-1 h-3 w-3" />
      {trendingLabel}
    </Badge>
  );
}
