'use client';

import { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorMessageProps = {
  title: string;
  message?: string;
  onRetry?: () => void | Promise<unknown>;
  retryLabel?: string;
  className?: string;
};

export function ErrorMessage({
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
  className,
}: ErrorMessageProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  async function handleRetry() {
    if (!onRetry || isRetrying) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } catch {
      // Keep the existing error state visible; the caller owns error feedback.
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center',
        className,
      )}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 text-destructive" />
      <div>
        <p className="font-medium">{title}</p>
        {message ? (
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleRetry()}
          disabled={isRetrying}
          aria-busy={isRetrying}
        >
          {isRetrying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isRetrying ? `${retryLabel}...` : retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
