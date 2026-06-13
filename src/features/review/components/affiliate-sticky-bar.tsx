'use client';

import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import type { AffiliateLink } from '@/types/review';

type AffiliateStickyBarProps = {
  url: string;
  platform?: AffiliateLink['platform'];
  label?: string;
  pulse?: boolean;
  className?: string;
  linkRef?: React.RefObject<HTMLAnchorElement | null>;
};

const PLATFORM_MESSAGE_KEY: Record<
  AffiliateLink['platform'],
  'affiliatePlatformShopee' | 'affiliatePlatformLazada' | 'affiliatePlatformTiki' | 'affiliatePlatformAmazon' | 'affiliatePlatformOther'
> = {
  shopee: 'affiliatePlatformShopee',
  lazada: 'affiliatePlatformLazada',
  tiki: 'affiliatePlatformTiki',
  amazon: 'affiliatePlatformAmazon',
  other: 'affiliatePlatformOther',
};

export function AffiliateStickyBar({
  url,
  platform = 'other',
  label,
  pulse = false,
  className,
  linkRef,
}: AffiliateStickyBarProps) {
  const t = useTranslations('Review');
  const platformName = t(PLATFORM_MESSAGE_KEY[platform]);
  const ctaLabel =
    label?.trim() || t('affiliateStickyCta', { platform: platformName });

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-1">
        <p className="text-center text-xs text-muted-foreground">
          {t('affiliateStickyHint')}
        </p>
        <a
          ref={linkRef}
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-white transition-transform hover:bg-brand/90 active:scale-[0.98]',
            pulse && 'animate-pulse',
          )}
        >
          {ctaLabel}
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
        </a>
      </div>
    </div>
  );
}
