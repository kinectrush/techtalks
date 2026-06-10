import type { ReviewSummary } from '@/types/review';

import {
  extractTitleSearchTerms,
  pickRelatedArticles,
  RELATED_ARTICLES_LIMIT,
} from './related-articles';
import {
  resolvePublishedArticles,
  resolveSearchArticles,
} from './resolve-published-reviews';

export async function resolveRelatedArticles(
  article: ReviewSummary,
): Promise<ReviewSummary[]> {
  const [categoryArticles, latestArticles] = await Promise.all([
    resolvePublishedArticles(article.category.slug),
    resolvePublishedArticles(),
  ]);

  const candidateMap = new Map<string, ReviewSummary>();
  for (const candidate of [...categoryArticles, ...latestArticles]) {
    if (candidate.id !== article.id) {
      candidateMap.set(candidate.id, candidate);
    }
  }

  const titleQuery = extractTitleSearchTerms(article.title);
  if (titleQuery) {
    const searchMatches = await resolveSearchArticles(titleQuery, {
      categorySlug: article.category.slug,
      limit: 12,
    });

    for (const candidate of searchMatches) {
      if (candidate.id !== article.id) {
        candidateMap.set(candidate.id, candidate);
      }
    }

    if (searchMatches.length < RELATED_ARTICLES_LIMIT) {
      const broaderMatches = await resolveSearchArticles(titleQuery, {
        limit: 12,
      });
      for (const candidate of broaderMatches) {
        if (candidate.id !== article.id) {
          candidateMap.set(candidate.id, candidate);
        }
      }
    }
  }

  return pickRelatedArticles(article, [...candidateMap.values()]);
}
