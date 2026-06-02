import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function StarRating({
  rating,
  max = 5,
  size = 'sm',
  className,
}: StarRatingProps) {
  const iconClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      aria-label={`${rating}/${max}`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <Star
            key={i}
            className={cn(
              iconClass,
              filled || half
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/40',
            )}
          />
        );
      })}
      <span className="ml-1 text-xs font-medium text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
