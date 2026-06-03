import { getTranslations } from 'next-intl/server';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export async function HomeEmptyState() {
  const t = await getTranslations('Review');

  return (
    <section className="rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <p className="text-lg font-medium text-foreground">{t('homeEmpty')}</p>
      <div className="mt-6">
        <Button asChild variant="outline">
          <Link href="/reviews">{t('allReviews')}</Link>
        </Button>
      </div>
    </section>
  );
}
