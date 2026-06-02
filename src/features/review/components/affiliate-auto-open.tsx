'use client';

import { useEffect, useMemo, useState } from 'react';

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

      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) setBlocked(true);
    } catch {
      // ignore
    }
  }, [url, key]);

  if (!blocked) return null;

  return (
    <></>
  );
}

