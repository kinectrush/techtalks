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
  pickTickerMatches,
} from './map';
import type { FootballDataMatchesResponse, WorldCupLiveData } from './types';

const FETCH_RETRIES = 2;
const FETCH_TIMEOUT_MS = 15_000;

function isTransientFetchError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.name === 'TimeoutError') return true;
  const cause = error.cause;
  if (cause && typeof cause === 'object' && 'code' in cause) {
    const code = (cause as { code?: string }).code;
    return (
      code === 'UND_ERR_SOCKET' ||
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT'
    );
  }
  return error.message.includes('fetch failed');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function footballDataFetch<T>(path: string): Promise<T | null> {
  const token = getFootballDataApiToken();
  if (!token) return null;

  const url = `${FOOTBALL_DATA_API_BASE}${path}`;

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-Auth-Token': token,
        },
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.warn(
          `[football-data] ${response.status} ${response.statusText} for ${path}`,
          body.slice(0, 200),
        );
        return null;
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt < FETCH_RETRIES && isTransientFetchError(error)) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      const message =
        error instanceof Error ? error.message : String(error);
      console.warn(`[football-data] fetch failed for ${path}: ${message}`);
      return null;
    }
  }

  return null;
}

export async function fetchWorldCupLiveData(): Promise<WorldCupLiveData | null> {
  if (!isFootballDataConfigured()) {
    return null;
  }

  try {
    const seasonQuery = `?season=${WORLD_CUP_SEASON}`;
    const base = `/competitions/${WORLD_CUP_COMPETITION_CODE}`;

    // Standings endpoint is flaky; derive group tables from matches instead.
    const matchesPayload = await footballDataFetch<FootballDataMatchesResponse>(
      `${base}/matches${seasonQuery}`,
    );

    const rawMatches = matchesPayload?.matches ?? [];
    const allMatches = rawMatches.map(mapFootballDataMatch);
    const matches = pickTickerMatches(allMatches);
    const groupStandings = computeGroupStandingsFromMatches(rawMatches);

    if (!matches.length && !groupStandings.length) {
      return null;
    }

    return { matches, groupStandings };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[football-data] fetchWorldCupLiveData failed: ${message}`);
    return null;
  }
}
