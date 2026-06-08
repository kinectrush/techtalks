export const SEARCH_MIN_LENGTH = 2;
export const SEARCH_MAX_LENGTH = 100;
export const SEARCH_TYPEAHEAD_LIMIT = 8;
export const SEARCH_RESULTS_LIMIT = 50;

/** Sanitize user input for ilike / FTS queries. */
export function normalizeSearchQuery(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, ' ');
  if (trimmed.length < SEARCH_MIN_LENGTH) return null;
  return trimmed.slice(0, SEARCH_MAX_LENGTH).replace(/[%_]/g, '');
}
