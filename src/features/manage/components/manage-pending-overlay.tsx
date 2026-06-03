import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type ManagePendingOverlayProps = {
  show: boolean;
  className?: string;
};

export function ManagePendingOverlay({
  show,
  className,
}: ManagePendingOverlayProps) {
  if (!show) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/60 backdrop-blur-[1px]',
        className,
      )}
      aria-busy="true"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="sr-only">Đang xử lý...</span>
    </div>
  );
}
