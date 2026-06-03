'use client';

import { useCallback, useState } from 'react';

export function usePendingKeys() {
  const [keys, setKeys] = useState<Set<string>>(() => new Set());

  const isPending = useCallback((key: string) => keys.has(key), [keys]);

  const isAnyPending = keys.size > 0;

  const run = useCallback(async (key: string, fn: () => Promise<void>) => {
    let shouldRun = false;
    setKeys((prev) => {
      if (prev.has(key)) return prev;
      shouldRun = true;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
    if (!shouldRun) return;

    try {
      await fn();
    } finally {
      setKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, []);

  return { run, isPending, isAnyPending };
}
