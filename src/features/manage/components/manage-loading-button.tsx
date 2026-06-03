'use client';

import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ManageLoadingButtonProps = ComponentProps<typeof Button> & {
  isLoading?: boolean;
  loadingLabel?: string;
};

export function ManageLoadingButton({
  isLoading,
  loadingLabel,
  disabled,
  children,
  className,
  ...props
}: ManageLoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || isLoading}
      className={cn(className)}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
