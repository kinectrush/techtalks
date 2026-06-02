'use client';

import { useTranslations } from 'next-intl';

import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useAuth } from '@/hooks/use-auth';
import { useReviews } from '@/hooks/use-reviews';

export function DashboardStats() {
  const t = useTranslations('Dashboard');
  const tCommon = useTranslations('Common');
  const { user } = useAuth();
  const { data, isLoading, error, mutate } = useReviews();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t('swrTitle')}</h2>
      {isLoading ? (
        <LoadingSpinner label={tCommon('loading')} />
      ) : error ? (
        <ErrorMessage
          title={tCommon('error')}
          onRetry={() => mutate()}
          retryLabel={tCommon('retry')}
        />
      ) : (
        <p className="text-muted-foreground">
          {user ? t('welcome', { name: user.name }) : null}
          {user ? ' · ' : null}
          {t('reviewCount', { count: data?.total ?? data?.data?.length ?? 0 })}
        </p>
      )}
    </section>
  );
}
