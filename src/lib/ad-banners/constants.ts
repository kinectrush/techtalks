/** Site-wide placements only; review detail banners are per-article on review_articles. */
export const AD_BANNER_PLACEMENTS = [
  'home_desktop',
  'home_mobile',
  'reviews',
] as const;

export type AdBannerPlacement = (typeof AD_BANNER_PLACEMENTS)[number];

export type AdBannerAspectRatio = '9/16' | '16/9';

export const AD_BANNER_PLACEMENT_LABELS: Record<AdBannerPlacement, string> = {
  home_desktop: 'Trang chủ — Desktop (9:16, dưới Top trending 7 ngày)',
  home_mobile: 'Trang chủ — Mobile (16:9, dưới header)',
  reviews: 'Trang Reviews (16:9, dưới header)',
};

export const AD_BANNER_ASPECT_RATIO: Record<
  AdBannerPlacement,
  AdBannerAspectRatio
> = {
  home_desktop: '9/16',
  home_mobile: '16/9',
  reviews: '16/9',
};

export const ARTICLE_DETAIL_BANNER_DESKTOP_ASPECT: AdBannerAspectRatio = '9/16';
export const ARTICLE_DETAIL_BANNER_MOBILE_ASPECT: AdBannerAspectRatio = '16/9';
