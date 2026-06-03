import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getMessages, getTimeZone, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { SITE_ASSETS } from '@/lib/site-assets';
import { routing, type Locale } from '@/i18n/routing';
import { Providers } from '@/providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`@/i18n/messages/${locale}.json`)).default;

  return {
    title: messages.Metadata.title,
    description: messages.Metadata.description,
    icons: {
      icon: SITE_ASSETS.favicon,
      shortcut: SITE_ASSETS.favicon,
      apple: SITE_ASSETS.favicon,
    },
  };
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale as Locale);
  const [messages, timeZone] = await Promise.all([
    getMessages(),
    getTimeZone(),
  ]);

  return (
    <Providers
      locale={locale as Locale}
      messages={messages}
      timeZone={timeZone}
    >
      {children}
    </Providers>
  );
}
