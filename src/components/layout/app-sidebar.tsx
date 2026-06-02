'use client';

import { LayoutDashboard, Newspaper, Home } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

const navItems = [
  { href: '/', icon: Home, labelKey: 'home' as const },
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' as const },
  { href: '/dashboard/reviews', icon: Newspaper, labelKey: 'reviews' as const },
];

export function AppSidebar() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        'hidden border-r bg-card transition-all duration-300 md:flex md:flex-col',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center border-b px-4 font-semibold">
        {sidebarOpen ? 'TechTalks' : 'TT'}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const active =
            href === '/'
              ? pathname === '/'
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                active && 'bg-accent text-accent-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen ? <span>{t(labelKey)}</span> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
