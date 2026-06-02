import { env } from '@/lib/env';
import type { Locale } from '@/i18n/routing';

export const SITE_ASSETS = {
  logo: '/main-logo.svg',
  favicon: '/favicon.ico',
  ogHomeVi: '/og-default-vi.png',
  ogHomeEn: '/og-default-en.png',
  ogReviews: '/og-reviews.jpg',
  ogCategoryTheThao: '/og-category-the-thao.png',
} as const;

export function absoluteAssetUrl(path: string): string {
  return new URL(path, env.appUrl).href;
}

export function getHomeOpenGraphImage(locale: Locale): string {
  return locale === 'vi' ? SITE_ASSETS.ogHomeVi : SITE_ASSETS.ogHomeEn;
}

/** Reviews list: default + `cong-nghe` → og-reviews; `the-thao` → dedicated OG. */
export function getReviewsOpenGraphImage(categorySlug?: string): string {
  if (categorySlug === 'the-thao') {
    return SITE_ASSETS.ogCategoryTheThao;
  }
  return SITE_ASSETS.ogReviews;
}

export function buildOpenGraphImages(path: string) {
  const url = absoluteAssetUrl(path);
  return [{ url, width: 1200, height: 630, alt: 'TechTalks' }];
}

export function localePageUrl(locale: Locale, pathname = ''): string {
  const path = pathname ? `/${locale}${pathname}` : `/${locale}`;
  return new URL(path, env.appUrl).href;
}

export function reviewsListPageUrl(
  locale: Locale,
  categorySlug?: string,
): string {
  const url = new URL(`/${locale}/reviews`, env.appUrl);
  if (categorySlug) {
    url.searchParams.set('category', categorySlug);
  }
  return url.href;
}
