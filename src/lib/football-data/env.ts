export const FOOTBALL_DATA_API_BASE = 'https://api.football-data.org/v4';
export const WORLD_CUP_COMPETITION_CODE = 'WC';
export const WORLD_CUP_SEASON = '2026';

export function getFootballDataApiToken(): string | undefined {
  const token = process.env.FOOTBALL_DATA_API_TOKEN?.trim();
  return token || undefined;
}

export function isFootballDataConfigured(): boolean {
  return Boolean(getFootballDataApiToken());
}
