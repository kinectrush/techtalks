import { getTranslations } from 'next-intl/server';
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default async function Loading() {
  const t = await getTranslations('Common');

  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      aria-busy="true"
    >
      <LoadingSpinner label={t('loading')} />
    </div>
  );
}
