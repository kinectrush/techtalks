'use client';

import { ThemeProvider } from '@/components/theme/theme-provider';
import { NextIntlClientProvider } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { SWRConfig } from 'swr';

import type { Locale } from '@/i18n/routing';
import { swrConfig } from '@/swr/config';

type ProvidersProps = {
  children: ReactNode;
  locale: Locale;
  messages: AbstractIntlMessages;
  timeZone: string;
};

export function Providers({
  children,
  locale,
  messages,
  timeZone,
}: ProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <SWRConfig value={swrConfig}>
          {children}
          <Toaster richColors closeButton position="top-right" />
        </SWRConfig>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
