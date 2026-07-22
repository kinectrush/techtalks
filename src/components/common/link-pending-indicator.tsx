'use client';

import { useLinkStatus } from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type LinkPendingIndicatorProps = {
  className?: string;
};

export function LinkPendingIndicator({ className }: LinkPendingIndicatorProps) {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">Đang tải...</span>
    </span>
  );
}
