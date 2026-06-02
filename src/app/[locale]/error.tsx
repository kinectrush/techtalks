'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { ErrorMessage } from '@/components/common/error-message';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations('Common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <ErrorMessage
        title={t('error')}
        message={error.message}
        onRetry={reset}
        retryLabel={t('retry')}
      />
    </div>
  );
}
