import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/app/globals.css';
import { ThemeScript } from '@/components/theme/theme-script';
import { defaultTimeZone } from '@/i18n/config';
import viMessages from '@/i18n/messages/vi.json';
import { SITE_ASSETS } from '@/lib/site-assets';
import { Providers } from '@/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: viMessages.Metadata.title,
  description: viMessages.Metadata.description,
  icons: {
    icon: SITE_ASSETS.favicon,
    shortcut: SITE_ASSETS.favicon,
    apple: SITE_ASSETS.favicon,
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <ThemeScript />
        <Providers locale="vi" messages={viMessages} timeZone={defaultTimeZone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
