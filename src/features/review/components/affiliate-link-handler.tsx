'use client';

import { useEffect, useMemo, useRef } from 'react';

import { isInAppBrowser } from '@/lib/navigation/in-app-browser';
import {
  openExternalLink,
  triggerAnchorNavigation,
} from '@/lib/navigation/open-external-link';
import type { AffiliateLink } from '@/types/review';

import { AffiliateStickyBar } from './affiliate-sticky-bar';

type AffiliateLinkHandlerProps = {
  url: string;
  platform?: AffiliateLink['platform'];
  label?: string;
};

const AUTO_CLICK_DELAY_MS = 120;

export function AffiliateLinkHandler({
  url,
  platform,
  label,
}: AffiliateLinkHandlerProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const inAppBrowser = useMemo(() => isInAppBrowser(), []);
  const key = useMemo(() => `affiliate_opened:${url}`, [url]);

  useEffect(() => {
    if (!url) return;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');

      if (inAppBrowser) {
        const timer = window.setTimeout(() => {
          triggerAnchorNavigation(linkRef.current);
        }, AUTO_CLICK_DELAY_MS);
        return () => window.clearTimeout(timer);
      }

      openExternalLink(url);
    } catch {
      // Sticky bar remains available in in-app browsers.
    }
  }, [url, key, inAppBrowser]);

  if (!inAppBrowser) return null;

  return (
    <>
      <div
        aria-hidden
        className="h-[calc(5.75rem+env(safe-area-inset-bottom,0px))]"
      />
      <AffiliateStickyBar
        url={url}
        platform={platform}
        label={label}
        pulse
        linkRef={linkRef}
      />
    </>
  );
}
