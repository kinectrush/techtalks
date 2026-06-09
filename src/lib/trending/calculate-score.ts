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

/** Top trending 24h: rank by window views, not time-decay score. */
export function compareTopTrending24h(
  a: { engagement: ReviewEngagement; publishedAt: string },
  b: { engagement: ReviewEngagement; publishedAt: string },
): number {
  const viewsDiff = b.engagement.views24h - a.engagement.views24h;
  if (viewsDiff !== 0) return viewsDiff;

  const reactionsDiff =
    b.engagement.reactions24h - a.engagement.reactions24h;
  if (reactionsDiff !== 0) return reactionsDiff;

  const commentsDiff = b.engagement.comments24h - a.engagement.comments24h;
  if (commentsDiff !== 0) return commentsDiff;

  return (
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/** Top trending 7d: rank by window views, not time-decay score. */
export function compareTopTrending7d(
  a: { engagement: ReviewEngagement; publishedAt: string },
  b: { engagement: ReviewEngagement; publishedAt: string },
): number {
  const viewsDiff = b.engagement.views7d - a.engagement.views7d;
  if (viewsDiff !== 0) return viewsDiff;

  const reactionsDiff =
    b.engagement.reactions7d - a.engagement.reactions7d;
  if (reactionsDiff !== 0) return reactionsDiff;

  const commentsDiff = b.engagement.comments7d - a.engagement.comments7d;
  if (commentsDiff !== 0) return commentsDiff;

  return (
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

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
