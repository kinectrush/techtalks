import {
  FOOTBALL_DATA_API_BASE,
  WORLD_CUP_COMPETITION_CODE,
  WORLD_CUP_SEASON,
  getFootballDataApiToken,
  isFootballDataConfigured,
} from './env';
import {
  computeGroupStandingsFromMatches,
  mapFootballDataMatch,
  mapFootballDataStandings,
  pickTickerMatches,
} from './map';
import type {
  FootballDataMatchesResponse,
  FootballDataStandingsResponse,
  WorldCupLiveData,
} from './types';

async function footballDataFetch<T>(path: string): Promise<T | null> {
  const token = getFootballDataApiToken();
  if (!token) return null;

  const url = `${FOOTBALL_DATA_API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': token,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    console.error(
      `[football-data] ${response.status} ${response.statusText} for ${path}`,
      body.slice(0, 200),
    );
    return null;
  }

  return (await response.json()) as T;
}

export async function fetchWorldCupLiveData(): Promise<WorldCupLiveData | null> {
  if (!isFootballDataConfigured()) {
    console.warn('[football-data] FOOTBALL_DATA_API_TOKEN is not configured');
    return null;
  }

  const seasonQuery = `?season=${WORLD_CUP_SEASON}`;
  const base = `/competitions/${WORLD_CUP_COMPETITION_CODE}`;

  const [matchesPayload, standingsPayload] = await Promise.all([
    footballDataFetch<FootballDataMatchesResponse>(`${base}/matches${seasonQuery}`),
    footballDataFetch<FootballDataStandingsResponse>(`${base}/standings${seasonQuery}`),
  ]);

  const rawMatches = matchesPayload?.matches ?? [];
  const allMatches = rawMatches.map(mapFootballDataMatch);
  const matches = pickTickerMatches(allMatches);

  let groupStandings = mapFootballDataStandings(standingsPayload?.standings ?? []);
  if (groupStandings.length === 1 && groupStandings[0]?.group === 'WC') {
    groupStandings = computeGroupStandingsFromMatches(rawMatches);
  } else if (!groupStandings.length) {
    groupStandings = computeGroupStandingsFromMatches(rawMatches);
  }

  if (!matches.length && !groupStandings.length) {
    return null;
  }

  return { matches, groupStandings };
}
