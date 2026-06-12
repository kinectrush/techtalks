'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import { formatMatchKickoff } from '@/lib/world-cup/format-kickoff';
import type { TournamentMatch } from '@/types/world-cup';

export type TickerMatchItem = TournamentMatch & {
  kickoffLabel: string;
};

type WorldCupMatchTickerProps = {
  matches: TickerMatchItem[];
  locale: string;
  accentColor: string;
  labels: {
    live: string;
    fullTime: string;
  };
};

const LIVE_REFRESH_MS = 30_000;
const DEFAULT_REFRESH_MS = 120_000;

function toTickerItems(
  matches: TournamentMatch[],
  locale: string,
): TickerMatchItem[] {
  return matches.map((match) => ({
    ...match,
    kickoffLabel: formatMatchKickoff(match.kickoffAt, locale),
  }));
}

function MatchTickerItem({
  match,
  accentColor,
  labels,
}: {
  match: TickerMatchItem;
  accentColor: string;
  labels: WorldCupMatchTickerProps['labels'];
}) {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <div
      className="flex h-14 shrink-0 flex-row items-center gap-3 whitespace-nowrap border-r border-white/10 px-5 lg:h-16"
      aria-label={`${match.homeTeam} vs ${match.awayTeam}`}
    >
      <span className="hidden text-[10px] font-semibold uppercase tracking-wider text-white/45 sm:inline">
        {match.stage}
      </span>

      <div className="flex flex-row items-center gap-2">
        <span className="min-w-[2.5rem] text-right text-xs font-bold text-white/90">
          {match.homeCode}
        </span>
        {isFinished || isLive ? (
          <span className="min-w-[3.5rem] text-center text-sm font-black tabular-nums text-white">
            {match.homeScore ?? 0} - {match.awayScore ?? 0}
          </span>
        ) : (
          <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums text-white/70">
            vs
          </span>
        )}
        <span className="min-w-[2.5rem] text-xs font-bold text-white/90">
          {match.awayCode}
        </span>
      </div>

      {isLive ? (
        <span
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-black"
          style={{ backgroundColor: accentColor }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-600" />
          {labels.live}
        </span>
      ) : isFinished ? (
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
          {labels.fullTime}
        </span>
      ) : (
        <span className="text-xs font-medium tabular-nums text-white/60">
          {match.kickoffLabel}
        </span>
      )}
    </div>
  );
}

export function WorldCupMatchTicker({
  matches: initialMatches,
  locale,
  accentColor,
  labels,
}: WorldCupMatchTickerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackStyle, setTrackStyle] = useState<React.CSSProperties>({});
  const [isReady, setIsReady] = useState(false);
  const [items, setItems] = useState(initialMatches);
  const itemsRef = useRef(initialMatches);

  const durationSeconds = Math.max(120, items.length * 8);

  useEffect(() => {
    itemsRef.current = initialMatches;
    setItems(initialMatches);
  }, [initialMatches]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId = 0;

    function scheduleNextRefresh() {
      if (cancelled) return;

      const hasLive = itemsRef.current.some((match) => match.status === 'live');
      const intervalMs = hasLive ? LIVE_REFRESH_MS : DEFAULT_REFRESH_MS;
      timeoutId = window.setTimeout(() => {
        void refreshTicker();
      }, intervalMs);
    }

    async function refreshTicker() {
      try {
        const response = await fetch('/api/world-cup/ticker', {
          cache: 'no-store',
        });
        if (!response.ok || cancelled) return;

        const payload = (await response.json()) as {
          matches?: TournamentMatch[];
        };
        if (!payload.matches?.length || cancelled) return;

        const nextItems = toTickerItems(payload.matches, locale);
        itemsRef.current = nextItems;
        setItems(nextItems);
      } catch {
        // Keep showing the last known ticker data.
      } finally {
        scheduleNextRefresh();
      }
    }

    void refreshTicker();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [locale]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !items.length) return;

    const updateTickerMetrics = () => {
      const viewportWidth = viewport.offsetWidth;
      const halfTrackWidth = track.scrollWidth / 2;
      if (halfTrackWidth <= 0) return;

      setTrackStyle({
        '--world-cup-ticker-duration': `${durationSeconds}s`,
        '--ticker-translate-start': `${viewportWidth}px`,
        '--ticker-translate-end': `${viewportWidth - halfTrackWidth}px`,
      } as React.CSSProperties);
      setIsReady(true);
    };

    updateTickerMetrics();

    const resizeObserver = new ResizeObserver(updateTickerMetrics);
    resizeObserver.observe(viewport);
    resizeObserver.observe(track);

    return () => resizeObserver.disconnect();
  }, [items, durationSeconds]);

  if (!items.length) return null;

  return (
    <div
      className="relative w-full overflow-hidden border-b bg-[#0a1510] text-white"
      aria-label="World Cup match ticker"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0a1510] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0a1510] to-transparent" />

      <div
        ref={viewportRef}
        className="world-cup-ticker-viewport h-14 overflow-hidden lg:h-16"
      >
        <div
          ref={trackRef}
          className={cn(
            'world-cup-ticker-track flex w-max flex-row flex-nowrap items-stretch',
            isReady && 'world-cup-ticker-track--active',
          )}
          style={trackStyle}
        >
          {items.map((match) => (
            <MatchTickerItem
              key={`a-${match.id}`}
              match={match}
              accentColor={accentColor}
              labels={labels}
            />
          ))}
          {items.map((match) => (
            <MatchTickerItem
              key={`b-${match.id}`}
              match={match}
              accentColor={accentColor}
              labels={labels}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
