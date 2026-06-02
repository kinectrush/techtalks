import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ErrorMessageProps = {
  title: string;
  message?: string;
  onRetry?: () => void;
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
        <Button variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
