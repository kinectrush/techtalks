import type {
  GroupStanding,
  SubcategoryHomepageConfig,
  TournamentMatch,
} from '@/types/world-cup';

/** Sample data — overridden by `categories.homepage_config` in admin when set. */
export const DEFAULT_WC2026_HOMEPAGE_CONFIG: SubcategoryHomepageConfig = {
  matches: [
    {
      id: 'm1',
      homeTeam: 'Việt Nam',
      homeCode: 'VIE',
      awayTeam: 'Hàn Quốc',
      awayCode: 'KOR',
      homeScore: 2,
      awayScore: 1,
      kickoffAt: '2026-06-12T18:00:00Z',
      stage: 'Bảng F',
      status: 'finished',
    },
    {
      id: 'm2',
      homeTeam: 'Brazil',
      homeCode: 'BRA',
      awayTeam: 'Argentina',
      awayCode: 'ARG',
      kickoffAt: '2026-06-13T02:00:00Z',
      stage: 'Bảng A',
      status: 'scheduled',
    },
    {
      id: 'm3',
      homeTeam: 'Pháp',
      homeCode: 'FRA',
      awayTeam: 'Đức',
      awayCode: 'GER',
      homeScore: 1,
      awayScore: 1,
      kickoffAt: '2026-06-13T20:00:00Z',
      stage: 'Bảng D',
      status: 'live',
    },
    {
      id: 'm4',
      homeTeam: 'Tây Ban Nha',
      homeCode: 'ESP',
      awayTeam: 'Bồ Đào Nha',
      awayCode: 'POR',
      kickoffAt: '2026-06-14T01:00:00Z',
      stage: 'Bảng B',
      status: 'scheduled',
    },
    {
      id: 'm5',
      homeTeam: 'Anh',
      homeCode: 'ENG',
      awayTeam: 'Hà Lan',
      awayCode: 'NED',
      homeScore: 3,
      awayScore: 0,
      kickoffAt: '2026-06-14T19:00:00Z',
      stage: 'Bảng C',
      status: 'finished',
    },
    {
      id: 'm6',
      homeTeam: 'Mỹ',
      homeCode: 'USA',
      awayTeam: 'Mexico',
      awayCode: 'MEX',
      kickoffAt: '2026-06-15T03:00:00Z',
      stage: 'Bảng E',
      status: 'scheduled',
    },
  ],
  groupStandings: [
    {
      group: 'A',
      rows: [
        {
          rank: 1,
          team: 'Brazil',
          teamCode: 'BRA',
          played: 2,
          won: 2,
          drawn: 0,
          lost: 0,
          gd: 4,
          points: 6,
        },
        {
          rank: 2,
          team: 'Argentina',
          teamCode: 'ARG',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          gd: 1,
          points: 3,
        },
        {
          rank: 3,
          team: 'Canada',
          teamCode: 'CAN',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -1,
          points: 1,
        },
        {
          rank: 4,
          team: 'Morocco',
          teamCode: 'MAR',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -4,
          points: 1,
        },
      ],
    },
    {
      group: 'B',
      rows: [
        {
          rank: 1,
          team: 'Tây Ban Nha',
          teamCode: 'ESP',
          played: 2,
          won: 2,
          drawn: 0,
          lost: 0,
          gd: 3,
          points: 6,
        },
        {
          rank: 2,
          team: 'Bồ Đào Nha',
          teamCode: 'POR',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          gd: 0,
          points: 3,
        },
        {
          rank: 3,
          team: 'Uruguay',
          teamCode: 'URU',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -1,
          points: 1,
        },
        {
          rank: 4,
          team: 'Nhật Bản',
          teamCode: 'JPN',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -2,
          points: 1,
        },
      ],
    },
    {
      group: 'C',
      rows: [
        {
          rank: 1,
          team: 'Anh',
          teamCode: 'ENG',
          played: 2,
          won: 2,
          drawn: 0,
          lost: 0,
          gd: 5,
          points: 6,
        },
        {
          rank: 2,
          team: 'Hà Lan',
          teamCode: 'NED',
          played: 2,
          won: 1,
          drawn: 0,
          lost: 1,
          gd: 0,
          points: 3,
        },
        {
          rank: 3,
          team: 'Thụy Sĩ',
          teamCode: 'SUI',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -2,
          points: 1,
        },
        {
          rank: 4,
          team: 'Australia',
          teamCode: 'AUS',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -3,
          points: 1,
        },
      ],
    },
    {
      group: 'D',
      rows: [
        {
          rank: 1,
          team: 'Pháp',
          teamCode: 'FRA',
          played: 2,
          won: 1,
          drawn: 1,
          lost: 0,
          gd: 2,
          points: 4,
        },
        {
          rank: 2,
          team: 'Đức',
          teamCode: 'GER',
          played: 2,
          won: 1,
          drawn: 1,
          lost: 0,
          gd: 1,
          points: 4,
        },
        {
          rank: 3,
          team: 'Colombia',
          teamCode: 'COL',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -1,
          points: 1,
        },
        {
          rank: 4,
          team: 'Senegal',
          teamCode: 'SEN',
          played: 2,
          won: 0,
          drawn: 1,
          lost: 1,
          gd: -2,
          points: 1,
        },
      ],
    },
  ],
};

export function parseHomepageConfig(
  raw: unknown,
): SubcategoryHomepageConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_WC2026_HOMEPAGE_CONFIG;
  }

  const config = raw as SubcategoryHomepageConfig;
  return {
    matches:
      config.matches?.length ? config.matches : DEFAULT_WC2026_HOMEPAGE_CONFIG.matches,
    groupStandings:
      config.groupStandings?.length
        ? config.groupStandings
        : DEFAULT_WC2026_HOMEPAGE_CONFIG.groupStandings,
  };
}

export function mergeFeaturedTickerMatches(
  featuredList: Array<{
    accentColor: string | null;
    homepageConfig: SubcategoryHomepageConfig;
  }>,
): { matches: TournamentMatch[]; accentColor: string | null } {
  const matches: TournamentMatch[] = [];
  let accentColor: string | null = null;

  for (const featured of featuredList) {
    if (!accentColor && featured.accentColor) {
      accentColor = featured.accentColor;
    }
    if (featured.homepageConfig.matches?.length) {
      matches.push(...featured.homepageConfig.matches);
    }
  }

  return { matches, accentColor };
}

export function sortStandings(groups: GroupStanding[] | undefined): GroupStanding[] {
  return [...(groups ?? [])].sort((a, b) => a.group.localeCompare(b.group));
}
