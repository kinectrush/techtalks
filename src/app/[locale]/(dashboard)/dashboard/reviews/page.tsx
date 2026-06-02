import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DashboardReviewListClient } from '@/features/review/components/dashboard-review-list-client';
import { routing, type Locale } from '@/i18n/routing';

type DashboardReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardReviewsPage({
  params,
}: DashboardReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('Dashboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reviewsTitle')}</h1>
        <p className="mt-2 text-muted-foreground">{t('reviewsSubtitle')}</p>
      </div>
      <DashboardReviewListClient />
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
