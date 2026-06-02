import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';

export default async function NotFound() {
  const t = await getTranslations('Common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">{t('error')}</p>
      <Button asChild>
        <Link href="/">Home</Link>
      </Button>
    </div>
  );
}
