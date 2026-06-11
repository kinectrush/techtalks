/** Reviews list grid: 3 columns on large screens — 12 items = 4 rows. */
export const REVIEWS_PAGE_SIZE = 12;

/** Homepage section limits */
export const HOME_TRENDING_24H_LIMIT = 4;
export const HOME_LATEST_LIMIT = 4;
export const HOME_FEATURED_SUBCATEGORY_ARTICLE_LIMIT = 3;

export function parseReviewsPage(raw?: string): number {
  const parsed = Number.parseInt(raw ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}
