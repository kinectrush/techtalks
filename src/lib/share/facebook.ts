import { PRODUCTION_SITE_ORIGIN } from '@/lib/site-assets';

const FACEBOOK_SHARE_BASE = 'https://www.facebook.com/sharer/sharer.php';

type OpenFacebookSharePopupOptions = {
  width?: number;
  height?: number;
};

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.local')
  );
}

function getPublicSiteOrigin(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) return PRODUCTION_SITE_ORIGIN;

  try {
    const { origin, hostname } = new URL(appUrl);
    return isLocalHostname(hostname) ? PRODUCTION_SITE_ORIGIN : origin;
  } catch {
    return PRODUCTION_SITE_ORIGIN;
  }
}

/** Resolve a public, shareable article URL (Facebook rejects localhost). */
export function resolveArticleShareUrl(canonicalUrl: string): string {
  if (typeof window === 'undefined') return canonicalUrl;

  const current = new URL(window.location.href);
  current.searchParams.delete('view');
  const publicOrigin = getPublicSiteOrigin();

  if (isLocalHostname(current.hostname)) {
    return new URL(`${current.pathname}${current.search}`, publicOrigin).href;
  }

  if (current.pathname.startsWith('/review/')) {
    return current.href;
  }

  try {
    const canonical = new URL(canonicalUrl);
    if (isLocalHostname(canonical.hostname)) {
      return new URL(canonical.pathname + canonical.search, publicOrigin).href;
    }
    return canonical.href;
  } catch {
    return new URL(`${current.pathname}${current.search}`, publicOrigin).href;
  }
}

export function buildFacebookShareUrl(pageUrl: string): string {
  return `${FACEBOOK_SHARE_BASE}?display=popup&u=${encodeURIComponent(pageUrl)}`;
}

export function openFacebookSharePopup(
  pageUrl: string,
  options?: OpenFacebookSharePopupOptions,
): void {
  const resolvedUrl = resolveArticleShareUrl(pageUrl);
  const facebookUrl = buildFacebookShareUrl(resolvedUrl);
  const width = options?.width ?? 600;
  const height = options?.height ?? 400;
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

  const popup = window.open(
    facebookUrl,
    '_blank',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
  );

  popup?.focus();
}
