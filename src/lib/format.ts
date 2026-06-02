export function formatNumber(value: number, locale = 'vi-VN'): string {
  return new Intl.NumberFormat(locale, { notation: 'compact' }).format(value);
}

export function formatRelativeTime(iso: string, locale = 'vi-VN'): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return locale.startsWith('vi') ? 'Vừa xong' : 'Just now';
  if (hours < 24) {
    return locale.startsWith('vi') ? `${hours} giờ trước` : `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return locale.startsWith('vi') ? `${days} ngày trước` : `${days}d ago`;
}
