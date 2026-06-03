export const AD_BANNER_PLACEMENTS = [
  'home_desktop',
  'home_mobile',
  'reviews',
  'review_detail_desktop',
  'review_detail_mobile',
] as const;

export type AdBannerPlacement = (typeof AD_BANNER_PLACEMENTS)[number];

export type AdBannerAspectRatio = '9/16' | '16/9';

export const AD_BANNER_PLACEMENT_LABELS: Record<AdBannerPlacement, string> = {
  home_desktop: 'Trang chủ — Desktop (9:16, dưới Top trending 7 ngày)',
  home_mobile: 'Trang chủ — Mobile (16:9, dưới header)',
  reviews: 'Trang Reviews (16:9, dưới header)',
  review_detail_desktop: 'Chi tiết bài viết — Desktop (9:16, cột phải)',
  review_detail_mobile: 'Chi tiết bài viết — Mobile (16:9, dưới Tags)',
};

export const AD_BANNER_ASPECT_RATIO: Record<
  AdBannerPlacement,
  AdBannerAspectRatio
> = {
  home_desktop: '9/16',
  home_mobile: '16/9',
  reviews: '16/9',
  review_detail_desktop: '9/16',
  review_detail_mobile: '16/9',
};
