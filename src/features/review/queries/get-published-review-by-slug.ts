import { resolveArticleBySlug } from '@/features/review/lib/resolve-published-reviews';
import type { ReviewSummary } from '@/types/review';

/**
 * Server-side read for review detail (RSC / generateMetadata).
 * Kept outside `actions.ts` (`'use server'`) so Vercel does not treat this as a Server Action.
 */
export async function getPublishedReviewBySlug(
  slug: string,
): Promise<ReviewSummary | null> {
  const normalized = slug.trim();
  if (!normalized) return null;
  return resolveArticleBySlug(normalized);
}
