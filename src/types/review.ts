export type ReactionType =
  | 'like'
  | 'love'
  | 'haha'
  | 'wow'
  | 'sad'
  | 'angry';

export type ReviewStatus = 'draft' | 'published' | 'archived';

/** Engagement counters — window fields power Trending/Hot */
export type ReviewEngagement = {
  views: number;
  views24h: number;
  views7d: number;
  reactions: number;
  reactions24h: number;
  reactions7d: number;
  comments: number;
  comments24h: number;
  comments7d: number;
  bookmarks: number;
};

export type ReviewCategory = {
  slug: string;
  name: string;
};

export type ReviewTag = {
  slug: string;
  name: string;
};

export type ReviewSeries = {
  slug: string;
  name: string;
  part?: number;
};

export type ReviewAuthor = {
  id: string;
  name: string;
  avatar?: string;
};

export type AffiliateLink = {
  platform: 'shopee' | 'lazada' | 'tiki' | 'amazon' | 'other';
  url: string;
  label?: string;
};

export type ReviewArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImage: string;
  /** Optional alternate cover images for "Editor's pick" hero/slot. */
  editorPickCoverImageMobile?: string;
  editorPickCoverImageDesktop?: string;
  category: ReviewCategory;
  author: ReviewAuthor;
  publishedAt: string;
  updatedAt?: string;
  status: ReviewStatus;
  rating: number;
  pros?: string[];
  cons?: string[];
  tags: ReviewTag[];
  series?: ReviewSeries;
  affiliateLinks?: AffiliateLink[];
  engagement: ReviewEngagement;
  isEditorPick?: boolean;
};

/** Lightweight card / list item (includes precomputed trending) */
export type HotBadge = 'hot' | 'trending';

export type ReviewSummary = ReviewArticle & {
  trendingScore24h: number;
  trendingScore7d: number;
  hotRank?: number;
  hotBadge?: HotBadge | null;
  /** UI list badge: 'new' (top newest) or 'hot' (top views). */
  listBadge?: 'new' | 'hot' | null;
};

export type TrendingWindow = '24h' | '7d';

export type HomePageData = {
  hero: ReviewSummary;
  trending24h: ReviewSummary[];
  trending7d: ReviewSummary[];
  latest: ReviewSummary[];
  categories: ReviewCategory[];
};
