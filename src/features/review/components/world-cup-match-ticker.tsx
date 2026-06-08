'use client';

import type { TournamentMatch } from '@/types/world-cup';

export type TickerMatchItem = TournamentMatch & {
  kickoffLabel: string;
};

type WorldCupMatchTickerProps = {
  matches: TickerMatchItem[];
  accentColor: string;
  labels: {
    live: string;
    fullTime: string;
  };
};

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
  matches,
  accentColor,
  labels,
}: WorldCupMatchTickerProps) {
  if (!matches.length) return null;

  const durationSeconds = Math.max(60, matches.length * 4);

  return (
    <div
      className="relative w-full overflow-hidden border-b bg-[#0a1510] text-white"
      aria-label="World Cup match ticker"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0a1510] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0a1510] to-transparent" />

      <div className="world-cup-ticker-viewport h-14 overflow-hidden lg:h-16">
        <div
          className="world-cup-ticker-track flex w-max flex-row flex-nowrap items-stretch"
          style={
            {
              '--world-cup-ticker-duration': `${durationSeconds}s`,
            } as React.CSSProperties
          }
        >
          {matches.map((match) => (
            <MatchTickerItem
              key={`a-${match.id}`}
              match={match}
              accentColor={accentColor}
              labels={labels}
            />
          ))}
          {matches.map((match) => (
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
