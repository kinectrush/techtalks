'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import type { GroupStanding } from '@/types/world-cup';

type WorldCupGroupStandingsProps = {
  groups: GroupStanding[];
  accentColor: string;
  labels: {
    title: string;
    group: string;
    team: string;
    played: string;
    gd: string;
    points: string;
  };
};

export function WorldCupGroupStandings({
  groups,
  accentColor,
  labels,
}: WorldCupGroupStandingsProps) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.group ?? 'A');
  const current =
    groups.find((group) => group.group === activeGroup) ?? groups[0];

  if (!current) return null;

  return (
    <div className="flex h-full flex-col rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-bold uppercase tracking-wide text-white">
          {labels.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {groups.map((group) => (
            <button
              key={group.group}
              type="button"
              onClick={() => setActiveGroup(group.group)}
              className={cn(
                'cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                activeGroup === group.group
                  ? 'text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
              )}
              style={
                activeGroup === group.group
                  ? { backgroundColor: accentColor }
                  : undefined
              }
            >
              {labels.group} {group.group}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[260px] text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wide text-white/45">
              <th className="px-3 py-2 font-semibold">#</th>
              <th className="px-2 py-2 font-semibold">{labels.team}</th>
              <th className="px-2 py-2 text-center font-semibold">
                {labels.played}
              </th>
              <th className="px-2 py-2 text-center font-semibold">
                {labels.gd}
              </th>
              <th className="px-3 py-2 text-center font-semibold">
                {labels.points}
              </th>
            </tr>
          </thead>
          <tbody>
            {current.rows.map((row) => (
              <tr
                key={row.teamCode}
                className="border-b border-white/5 last:border-0"
              >
                <td className="px-3 py-2.5 font-bold tabular-nums text-white/50">
                  {row.rank}
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white/80">{row.teamCode}</span>
                    <span className="hidden truncate text-white/70 sm:inline">
                      {row.team}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums text-white/70">
                  {row.played}
                </td>
                <td
                  className={cn(
                    'px-2 py-2.5 text-center tabular-nums',
                    row.gd > 0
                      ? 'text-emerald-400'
                      : row.gd < 0
                        ? 'text-red-400'
                        : 'text-white/70',
                  )}
                >
                  {row.gd > 0 ? `+${row.gd}` : row.gd}
                </td>
                <td className="px-3 py-2.5 text-center text-sm font-black tabular-nums text-white">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
