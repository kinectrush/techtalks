export type TournamentMatchStatus = 'scheduled' | 'live' | 'finished';

export type TournamentMatch = {
  id: string;
  homeTeam: string;
  homeCode: string;
  awayTeam: string;
  awayCode: string;
  homeScore?: number | null;
  awayScore?: number | null;
  /** ISO 8601 kickoff time */
  kickoffAt: string;
  stage: string;
  status: TournamentMatchStatus;
};

export type GroupStandingRow = {
  rank: number;
  team: string;
  teamCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gd: number;
  points: number;
};

export type GroupStanding = {
  group: string;
  rows: GroupStandingRow[];
};

export type SubcategoryHomepageConfig = {
  matches?: TournamentMatch[];
  groupStandings?: GroupStanding[];
};

export type FeaturedMatchTicker = {
  matches: TournamentMatch[];
  accentColor: string | null;
};
