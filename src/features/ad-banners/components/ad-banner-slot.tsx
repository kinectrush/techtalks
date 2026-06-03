import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { AdBannerAspectRatio } from '@/lib/ad-banners/constants';

type AdBannerSlotProps = {
  imageUrl: string;
  linkUrl?: string | null;
  aspectRatio: AdBannerAspectRatio;
  className?: string;
  priority?: boolean;
};

export function AdBannerSlot({
  imageUrl,
  linkUrl,
  aspectRatio,
  className,
  priority = false,
}: AdBannerSlotProps) {
  if (!imageUrl?.trim()) return null;

  const href = linkUrl?.trim();
  const aspectClass =
    aspectRatio === '9/16' ? 'aspect-[9/16]' : 'aspect-[16/9]';

  const content = (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg border bg-muted/20',
        aspectClass,
        className,
      )}
    >
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-cover"
        sizes={
          aspectRatio === '9/16'
            ? '(max-width: 1024px) 0vw, 280px'
            : '(max-width: 1024px) 100vw, 768px'
        }
        priority={priority}
      />
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block cursor-pointer transition-opacity hover:opacity-95"
      >
        {content}
      </a>
    );
  }

  return content;
}
