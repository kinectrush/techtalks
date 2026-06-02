import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';

import type { Metadata } from 'next';

import '@/app/globals.css';
import { defaultTimeZone } from '@/i18n/config';
import { SITE_ASSETS } from '@/lib/site-assets';
import viMessages from '@/i18n/messages/vi.json';
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
  title: 'TechTalks Admin',
  icons: {
    icon: SITE_ASSETS.favicon,
    shortcut: SITE_ASSETS.favicon,
    apple: SITE_ASSETS.favicon,
  },
};

type ManageLayoutProps = {
  children: ReactNode;
};

export default async function ManageLayout({ children }: ManageLayoutProps) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <Providers locale="vi" messages={viMessages} timeZone={defaultTimeZone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
