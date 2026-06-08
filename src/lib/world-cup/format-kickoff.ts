import { defaultTimeZone } from '@/i18n/config';

export function formatMatchKickoff(iso: string, locale: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: defaultTimeZone,
  }).format(date);
}
