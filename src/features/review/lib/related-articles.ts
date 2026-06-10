import type { ReviewSummary } from '@/types/review';

export const RELATED_ARTICLES_LIMIT = 3;

const TITLE_STOP_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'for',
  'to',
  'in',
  'on',
  'of',
  'vs',
  'với',
  'và',
  'có',
  'là',
  'của',
  'cho',
  'trong',
  'một',
  'những',
  'các',
  'được',
  'này',
  'đây',
  'khi',
  'sau',
  'trước',
  'review',
  'đánh',
  'giá',
]);

function tokenizeTitle(title: string): Set<string> {
  const tokens = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !TITLE_STOP_WORDS.has(word));

  return new Set(tokens);
}

export function extractTitleSearchTerms(title: string, maxTerms = 4): string {
  return [...tokenizeTitle(title)].slice(0, maxTerms).join(' ');
}

export function scoreRelatedArticle(
  current: ReviewSummary,
  candidate: ReviewSummary,
): number {
  if (current.id === candidate.id) return -1;

  let score = 0;

  if (current.category.slug === candidate.category.slug) {
    score += 10;
  }

  const currentTagSlugs = new Set(current.tags.map((tag) => tag.slug));
  for (const tag of candidate.tags) {
    if (currentTagSlugs.has(tag.slug)) {
      score += 5;
    }
  }

  if (
    current.series?.slug &&
    candidate.series?.slug === current.series.slug
  ) {
    score += 8;
  }

  const currentWords = tokenizeTitle(current.title);
  const candidateWords = tokenizeTitle(candidate.title);
  for (const word of candidateWords) {
    if (currentWords.has(word)) {
      score += 2;
    }
  }

  const ageDays =
    (Date.now() - new Date(candidate.publishedAt).getTime()) /
    (1000 * 60 * 60 * 24);
  score += Math.max(0, 3 - ageDays / 7);

  return score;
}

export function pickRelatedArticles(
  current: ReviewSummary,
  candidates: ReviewSummary[],
  limit = RELATED_ARTICLES_LIMIT,
): ReviewSummary[] {
  const seen = new Set<string>();
  const scored = candidates
    .filter((candidate) => candidate.id !== current.id)
    .map((candidate) => ({
      candidate,
      score: scoreRelatedArticle(current, candidate),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.candidate.publishedAt).getTime() -
        new Date(a.candidate.publishedAt).getTime()
      );
    });

  const picked: ReviewSummary[] = [];

  for (const { candidate } of scored) {
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    picked.push(candidate);
    if (picked.length >= limit) break;
  }

  if (picked.length < limit) {
    const fallback = [...candidates]
      .filter((candidate) => candidate.id !== current.id && !seen.has(candidate.id))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() -
          new Date(a.publishedAt).getTime(),
      );

    for (const candidate of fallback) {
      picked.push(candidate);
      if (picked.length >= limit) break;
    }
  }

  return picked;
}
