import { isInAppBrowser } from '@/lib/navigation/in-app-browser';

const IFRAME_CLEANUP_MS = 3_000;

function openViaHiddenIframe(url: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.cssText =
    'display:none;width:0;height:0;border:0;position:absolute;left:-9999px;';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.src = url;
  document.body.appendChild(iframe);

  window.setTimeout(() => {
    iframe.remove();
  }, IFRAME_CLEANUP_MS);
}

/**
 * Open an external URL without leaving the current page stuck behind affiliate redirects
 * in Facebook/Zalo-style in-app browsers.
 */
export function openExternalLink(url: string): boolean {
  if (!url?.trim() || typeof window === 'undefined') return false;

  try {
    if (isInAppBrowser()) {
      openViaHiddenIframe(url);
      return true;
    }

    const win = window.open(url, '_blank', 'noopener,noreferrer');
    return win !== null;
  } catch {
    return false;
  }
}
