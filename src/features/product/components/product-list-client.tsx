'use client';

import { useTranslations } from 'next-intl';

import { ErrorMessage } from '@/components/common/error-message';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useProducts } from '@/hooks/use-products';

export function ProductListClient() {
  const t = useTranslations('Products');
  const tCommon = useTranslations('Common');
  const { data, error, isLoading, mutate } = useProducts();

  if (isLoading) {
    return <LoadingSpinner label={tCommon('loading')} className="py-12" />;
  }

  if (error) {
    return (
      <ErrorMessage
        title={tCommon('error')}
        onRetry={() => mutate()}
        retryLabel={tCommon('retry')}
      />
    );
  }

  const items = data?.data ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((product) => (
        <li
          key={product.id}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-sm text-muted-foreground">
            ${product.price.toFixed(2)}
          </p>
        </li>
      ))}
    </ul>
  );
}
