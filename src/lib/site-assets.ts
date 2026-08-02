import type { Metadata } from 'next';

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
  return new URL(path, siteOrigin()).href;
}

export function absoluteMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return absoluteAssetUrl(url.startsWith('/') ? url : `/${url}`);
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

export function buildOpenGraphImages(path: string, alt = 'TechTalks') {
  const url = absoluteAssetUrl(path);
  return [{ url, width: 1200, height: 630, alt }];
}

export function buildOpenGraphImagesFromUrl(imageUrl: string, alt = 'TechTalks') {
  const url = absoluteMediaUrl(imageUrl);
  return [{ url, width: 1200, height: 630, alt }];
}

export const PRODUCTION_SITE_ORIGIN = 'https://www.techtalks.io.vn';

const FALLBACK_SITE_ORIGIN = PRODUCTION_SITE_ORIGIN;

/** Canonical site origin for sitemap, robots, and absolute URLs. */
export function getSiteOrigin(): string {
  return siteOrigin();
}

function siteOrigin(): string {
  const raw = env.appUrl?.trim();
  if (!raw) return FALLBACK_SITE_ORIGIN;
  try {
    return new URL(raw).origin;
  } catch {
    return FALLBACK_SITE_ORIGIN;
  }
}

export function reviewDetailPageUrl(slug: string): string {
  return new URL(
    `/review/${encodeURIComponent(slug)}`,
    siteOrigin(),
  ).href;
}

export function buildReviewDetailMetadata(
  article: { title: string; excerpt: string; coverImage: string; slug: string },
  locale: Locale = 'vi',
): Metadata {
  const pageUrl = reviewDetailPageUrl(article.slug);
  const ogImages = buildOpenGraphImagesFromUrl(article.coverImage, article.title);

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      url: pageUrl,
      title: article.title,
      description: article.excerpt,
      siteName: 'TechTalks',
      images: ogImages,
      locale: locale === 'vi' ? 'vi_VN' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: ogImages.map((img) => img.url),
    },
    ...(env.facebookAppId
      ? { facebook: { appId: env.facebookAppId } }
      : {}),
    robots: { index: true, follow: true },
  };
}

export function localePageUrl(locale: Locale, pathname = ''): string {
  // Locale prefix is disabled (single-locale site).
  const path = pathname || '/';
  return new URL(path, env.appUrl).href;
}

export function reviewsListPageUrl(
  locale: Locale,
  categorySlug?: string,
  query?: string,
): string {
  const url = new URL('/reviews', env.appUrl);
  if (categorySlug) {
    url.searchParams.set('category', categorySlug);
  }
  if (query?.trim()) {
    url.searchParams.set('q', query.trim());
  }
  return url.href;
}
