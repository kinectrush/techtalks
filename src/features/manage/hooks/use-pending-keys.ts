'use client';

import { useCallback, useRef, useState } from 'react';

export function usePendingKeys() {
  const pendingRef = useRef(new Set<string>());
  const [keys, setKeys] = useState<Set<string>>(() => new Set());

  const syncKeys = useCallback(() => {
    setKeys(new Set(pendingRef.current));
  }, []);

  const isPending = useCallback((key: string) => keys.has(key), [keys]);

  const isAnyPending = keys.size > 0;

  const run = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      if (pendingRef.current.has(key)) return;

      pendingRef.current.add(key);
      syncKeys();

      try {
        await fn();
      } finally {
        pendingRef.current.delete(key);
        syncKeys();
      }
    },
    [syncKeys],
  );

  return { run, isPending, isAnyPending };
}
