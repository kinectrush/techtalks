import { getSiteOrigin } from '@/lib/site-assets';

const GOOGLE_SITEMAP_PING = 'https://www.google.com/ping';
const PING_TIMEOUT_MS = 10_000;

export function isPublicArticle(article: {
  status: string;
  isActive: boolean;
}): boolean {
  return article.status === 'published' && article.isActive;
}

function isProductionSiteOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return hostname !== 'localhost' && hostname !== '127.0.0.1';
  } catch {
    return false;
  }
}

export function getSitemapAbsoluteUrl(): string {
  return new URL('/sitemap.xml', getSiteOrigin()).href;
}

/** Hint Google to recrawl sitemap after new/updated public articles. */
export async function pingGoogleSitemap(): Promise<void> {
  const origin = getSiteOrigin();
  if (!isProductionSiteOrigin(origin)) {
    return;
  }

  const sitemapUrl = getSitemapAbsoluteUrl();
  const pingUrl = `${GOOGLE_SITEMAP_PING}?sitemap=${encodeURIComponent(sitemapUrl)}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);

  try {
    const response = await fetch(pingUrl, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!response.ok) {
      console.warn(
        '[pingGoogleSitemap] unexpected status',
        response.status,
        sitemapUrl,
      );
    }
  } catch (error) {
    console.warn('[pingGoogleSitemap] request failed', error);
  } finally {
    clearTimeout(timeout);
  }
}

/** Fire-and-forget ping when an article is publicly visible. */
export function notifyGoogleSitemapIfPublished(article: {
  status: string;
  isActive: boolean;
}): void {
  if (!isPublicArticle(article)) return;
  void pingGoogleSitemap();
}
