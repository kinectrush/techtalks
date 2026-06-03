import { cache } from 'react';

import { resolveArticleBySlug } from '@/features/review/lib/resolve-published-reviews';
import type { ReviewSummary } from '@/types/review';

/**
 * Server-side read for review detail (RSC / generateMetadata).
 * Kept outside `actions.ts` (`'use server'`) so Vercel does not treat this as a Server Action.
 * `cache()` dedupes metadata + page fetch in the same request.
 */
export const getPublishedReviewBySlug = cache(
  async (slug: string): Promise<ReviewSummary | null> => {
    const normalized = slug.trim();
    if (!normalized) return null;
    try {
      return await resolveArticleBySlug(normalized);
    } catch (error) {
      console.error('[getPublishedReviewBySlug]', normalized, error);
      throw error;
    }
  },
);
