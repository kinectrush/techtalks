import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';

import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { getFeaturedMatchTickerCached } from '@/features/review/actions';
import {
  WorldCupMatchTicker,
  type TickerMatchItem,
} from '@/features/review/components/world-cup-match-ticker';
import { formatMatchKickoff } from '@/lib/world-cup/format-kickoff';

type SiteLayoutProps = {
  children: ReactNode;
};

const DEFAULT_TICKER_ACCENT = '#00A651';

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const [locale, ticker, t] = await Promise.all([
    getLocale(),
    getFeaturedMatchTickerCached(),
    getTranslations('Review'),
  ]);

  const tickerMatches: TickerMatchItem[] = ticker.matches.map((match) => ({
    ...match,
    kickoffLabel: formatMatchKickoff(match.kickoffAt, locale),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {tickerMatches.length ? (
        <div className="sticky top-14 z-40 lg:top-16">
          <WorldCupMatchTicker
            matches={tickerMatches}
            accentColor={ticker.accentColor ?? DEFAULT_TICKER_ACCENT}
            labels={{
              live: t('worldCupLive'),
              fullTime: t('worldCupFullTime'),
            }}
          />
        </div>
      ) : null}
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
