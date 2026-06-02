import type messages from '@/i18n/messages/vi.json';

declare module 'next-intl' {
  interface AppConfig {
    Messages: typeof messages;
    Locale: 'vi' | 'en';
  }
}
