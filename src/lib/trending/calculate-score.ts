import type { ReviewEngagement, TrendingWindow } from '@/types/review';

/**
 * Trending score (Tinhte-style "Hot"):
 * - Weighted engagement in a time window (views < reactions < comments)
 * - Time decay so fresh posts can compete with viral older ones (Hacker News gravity)
 *
 * Formula:
 *   raw = views×1 + reactions×3 + comments×5  (per window)
 *   score = raw / (hoursSincePublish + 2)^gravity
 *
 * Tune weights via env or constants when you have real analytics.
 */
const WEIGHTS = {
  views: 1,
  reactions: 3,
  comments: 5,
} as const;

const GRAVITY = 1.35;

export function getEngagementForWindow(
  engagement: ReviewEngagement,
  window: TrendingWindow,
) {
  if (window === '24h') {
    return {
      views: engagement.views24h,
      reactions: engagement.reactions24h,
      comments: engagement.comments24h,
    };
  }
  return {
    views: engagement.views7d,
    reactions: engagement.reactions7d,
    comments: engagement.comments7d,
  };
}

export function calculateTrendingScore(
  engagement: ReviewEngagement,
  publishedAt: string,
  window: TrendingWindow = '24h',
): number {
  const { views, reactions, comments } = getEngagementForWindow(
    engagement,
    window,
  );

  const raw =
    views * WEIGHTS.views +
    reactions * WEIGHTS.reactions +
    comments * WEIGHTS.comments;

  const hoursSincePublish = Math.max(
    0,
    (Date.now() - new Date(publishedAt).getTime()) / (1000 * 60 * 60),
  );

  const score = raw / Math.pow(hoursSincePublish + 2, GRAVITY);

  return Math.round(score * 100) / 100;
}

/** Thresholds for UI badges — adjust from production percentiles */
export function getHotBadge(
  score: number,
  window: TrendingWindow,
): 'hot' | 'trending' | null {
  const hotMin = window === '24h' ? 12 : 8;
  const trendingMin = window === '24h' ? 6 : 4;

  if (score >= hotMin) return 'hot';
  if (score >= trendingMin) return 'trending';
  return null;
}
