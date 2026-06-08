import type {
  GroupStanding,
  GroupStandingRow,
  TournamentMatch,
  TournamentMatchStatus,
} from '@/types/world-cup';

import type {
  FootballDataMatch,
  FootballDataStandingGroup,
} from './types';

type TeamRef = {
  id: number;
  name: string;
  teamCode: string;
};

type MutableRow = GroupStandingRow & { teamId: number };

function mapMatchStatus(apiStatus: string): TournamentMatchStatus {
  switch (apiStatus) {
    case 'LIVE':
    case 'IN_PLAY':
    case 'PAUSED':
      return 'live';
    case 'FINISHED':
      return 'finished';
    default:
      return 'scheduled';
  }
}

function formatGroupLabel(group?: string | null, stage?: string): string {
  if (group?.startsWith('GROUP_')) {
    return `Bảng ${group.replace('GROUP_', '')}`;
  }

  const stageLabels: Record<string, string> = {
    GROUP_STAGE: 'Vòng bảng',
    LAST_16: 'Vòng 16',
    QUARTER_FINALS: 'Tứ kết',
    SEMI_FINALS: 'Bán kết',
    THIRD_PLACE: 'Tranh hạng 3',
    FINAL: 'Chung kết',
  };

  if (stage && stageLabels[stage]) return stageLabels[stage]!;
  return stage ?? 'World Cup';
}

function teamCode(team?: { tla?: string; shortName?: string; name?: string }) {
  if (team?.tla?.trim()) return team.tla.trim().toUpperCase();
  if (team?.shortName?.trim()) {
    return team.shortName.trim().slice(0, 3).toUpperCase();
  }
  if (team?.name?.trim()) {
    return team.name.trim().slice(0, 3).toUpperCase();
  }
  return '—';
}

function teamRef(team?: {
  id?: number;
  tla?: string;
  shortName?: string;
  name?: string;
}): TeamRef | null {
  if (!team?.id || !team.name) return null;
  return {
    id: team.id,
    name: team.name,
    teamCode: teamCode(team),
  };
}

export function mapFootballDataMatch(row: FootballDataMatch): TournamentMatch {
  const homeScore = row.score?.fullTime?.home ?? null;
  const awayScore = row.score?.fullTime?.away ?? null;

  return {
    id: String(row.id),
    homeTeam: row.homeTeam?.name ?? row.homeTeam?.shortName ?? 'TBD',
    homeCode: teamCode(row.homeTeam),
    awayTeam: row.awayTeam?.name ?? row.awayTeam?.shortName ?? 'TBD',
    awayCode: teamCode(row.awayTeam),
    homeScore,
    awayScore,
    kickoffAt: row.utcDate,
    stage: formatGroupLabel(row.group, row.stage),
    status: mapMatchStatus(row.status),
  };
}

function mapStandingRow(
  row: NonNullable<FootballDataStandingGroup['table']>[number],
): GroupStandingRow {
  return {
    rank: row.position,
    team: row.team?.name ?? row.team?.shortName ?? '—',
    teamCode: teamCode(row.team),
    played: row.playedGames,
    won: row.won,
    drawn: row.draw,
    lost: row.lost,
    gd: row.goalDifference,
    points: row.points,
  };
}

export function mapFootballDataStandings(
  groups: FootballDataStandingGroup[],
): GroupStanding[] {
  const grouped = groups.filter(
    (entry) => entry.type === 'TOTAL' && entry.group?.startsWith('GROUP_'),
  );
  if (grouped.length) {
    return grouped
      .map((entry) => ({
        group: entry.group!.replace('GROUP_', ''),
        rows: (entry.table ?? []).map(mapStandingRow),
      }))
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  const flat = groups.find((entry) => entry.type === 'TOTAL' && entry.table?.length);
  if (!flat?.table?.length) return [];

  return [
    {
      group: 'WC',
      rows: flat.table.map(mapStandingRow),
    },
  ];
}

function ensureTeamRow(
  rows: Map<number, MutableRow>,
  team: TeamRef,
): MutableRow {
  const existing = rows.get(team.id);
  if (existing) return existing;

  const created: MutableRow = {
    teamId: team.id,
    rank: 0,
    team: team.name,
    teamCode: team.teamCode,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gd: 0,
    points: 0,
  };
  rows.set(team.id, created);
  return created;
}

/** WC API often omits per-group standings — derive from group-stage matches. */
export function computeGroupStandingsFromMatches(
  matches: FootballDataMatch[],
): GroupStanding[] {
  const byGroup = new Map<string, Map<number, MutableRow>>();

  for (const match of matches) {
    if (!match.group?.startsWith('GROUP_')) continue;
    const groupKey = match.group.replace('GROUP_', '');
    const home = teamRef(match.homeTeam);
    const away = teamRef(match.awayTeam);
    if (!home || !away) continue;

    if (!byGroup.has(groupKey)) byGroup.set(groupKey, new Map());
    const rows = byGroup.get(groupKey)!;
    ensureTeamRow(rows, home);
    ensureTeamRow(rows, away);
  }

  for (const match of matches) {
    if (match.status !== 'FINISHED' || !match.group?.startsWith('GROUP_')) {
      continue;
    }

    const groupKey = match.group.replace('GROUP_', '');
    const rows = byGroup.get(groupKey);
    const home = teamRef(match.homeTeam);
    const away = teamRef(match.awayTeam);
    if (!rows || !home || !away) continue;

    const homeGoals = match.score?.fullTime?.home ?? 0;
    const awayGoals = match.score?.fullTime?.away ?? 0;

    const homeRow = ensureTeamRow(rows, home);
    const awayRow = ensureTeamRow(rows, away);

    homeRow.played += 1;
    awayRow.played += 1;
    homeRow.gd += homeGoals - awayGoals;
    awayRow.gd += awayGoals - homeGoals;

    if (homeGoals > awayGoals) {
      homeRow.won += 1;
      awayRow.lost += 1;
      homeRow.points += 3;
    } else if (homeGoals < awayGoals) {
      awayRow.won += 1;
      homeRow.lost += 1;
      awayRow.points += 3;
    } else {
      homeRow.drawn += 1;
      awayRow.drawn += 1;
      homeRow.points += 1;
      awayRow.points += 1;
    }
  }

  return [...byGroup.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([group, rowsMap]) => {
      const rows = [...rowsMap.values()].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.gd !== a.gd) return b.gd - a.gd;
        return a.team.localeCompare(b.team);
      });

      return {
        group,
        rows: rows.map((row, index) => ({
          rank: index + 1,
          team: row.team,
          teamCode: row.teamCode,
          played: row.played,
          won: row.won,
          drawn: row.drawn,
          lost: row.lost,
          gd: row.gd,
          points: row.points,
        })),
      };
    });
}

const STATUS_ORDER: Record<TournamentMatchStatus, number> = {
  live: 0,
  scheduled: 1,
  finished: 2,
};

export function sortTickerMatches(matches: TournamentMatch[]): TournamentMatch[] {
  return [...matches].sort((a, b) => {
    const statusDiff = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime();
  });
}

/** Prefer upcoming + live matches for the header ticker. */
export function pickTickerMatches(
  matches: TournamentMatch[],
  limit = 40,
): TournamentMatch[] {
  const sorted = sortTickerMatches(matches);
  const live = sorted.filter((m) => m.status === 'live');
  const scheduled = sorted.filter((m) => m.status === 'scheduled');
  const finished = sorted.filter((m) => m.status === 'finished');

  const picked = [...live, ...scheduled, ...finished.slice(-8)];
  return picked.slice(0, limit);
}
