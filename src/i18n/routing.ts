import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Language switching is disabled for now (single-locale site).
  locales: ['vi'],
  defaultLocale: 'vi',
  // Remove /vi prefix from URLs.
  localePrefix: 'never',
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
