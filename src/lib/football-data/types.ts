type FootballDataTeam = {
  id?: number;
  name?: string;
  tla?: string;
  shortName?: string;
};

type FootballDataScore = {
  winner?: string | null;
  fullTime?: { home?: number | null; away?: number | null };
  halfTime?: { home?: number | null; away?: number | null };
};

export type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage?: string;
  group?: string | null;
  homeTeam?: FootballDataTeam;
  awayTeam?: FootballDataTeam;
  score?: FootballDataScore;
};

export type FootballDataMatchesResponse = {
  matches?: FootballDataMatch[];
};

type FootballDataStandingRow = {
  position: number;
  team?: FootballDataTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type FootballDataStandingGroup = {
  type?: string;
  group?: string | null;
  table?: FootballDataStandingRow[];
};

export type FootballDataStandingsResponse = {
  standings?: FootballDataStandingGroup[];
};

export type WorldCupLiveData = {
  matches: import('@/types/world-cup').TournamentMatch[];
  groupStandings: import('@/types/world-cup').GroupStanding[];
};
