import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { LoginForm } from '@/components/forms/login-form';

const locale = 'vi' as const;

export default async function LoginPage() {
  setRequestLocale(locale);
  const t = await getTranslations('Auth');

  return (
    <div className="space-y-6 rounded-xl border bg-card p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('loginSubtitle')}</p>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded bg-muted" />}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-xs text-muted-foreground">
        Demo: demo@example.com / password
      </p>
    </div>
  );
}

