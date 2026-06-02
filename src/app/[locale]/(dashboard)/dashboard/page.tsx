import { getTranslations, setRequestLocale } from 'next-intl/server';

import { DashboardReviewListServer } from '@/features/review/components/dashboard-review-list-server';
import { DashboardStats } from '@/features/dashboard/components/dashboard-stats';
import { routing, type Locale } from '@/i18n/routing';

type DashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations('Dashboard');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t('latestReviews')}</h2>
        <DashboardReviewListServer limit={6} />
      </section>

      <DashboardStats />
    </div>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
