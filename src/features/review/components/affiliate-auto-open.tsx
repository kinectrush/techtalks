'use client';

import { useEffect, useMemo, useState } from 'react';

import { openExternalLink } from '@/lib/navigation/open-external-link';

type AffiliateAutoOpenProps = {
  url: string;
};

export function AffiliateAutoOpen({ url }: AffiliateAutoOpenProps) {
  const [blocked, setBlocked] = useState(false);
  const key = useMemo(() => `affiliate_opened:${url}`, [url]);

  useEffect(() => {
    if (!url) return;

    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');

      if (!openExternalLink(url)) setBlocked(true);
    } catch {
      setBlocked(true);
    }
  }, [url, key]);

  if (!blocked) return null;

  return null;
}

