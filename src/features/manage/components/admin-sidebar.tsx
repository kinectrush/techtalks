'use client';

import { useState } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FileText,
  FolderTree,
  Image,
  Loader2,
  LogOut,
  Mail,
  Menu,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ADMIN_ARTICLES_PATH,
  ADMIN_BANNERS_PATH,
  ADMIN_CATEGORIES_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_MESSAGES_PATH,
  ADMIN_USERS_PATH,
} from '@/lib/manage/constants';
import { cn } from '@/lib/utils';
import type { AdminUser } from '@/types/admin';

const nav = [
  { href: ADMIN_ARTICLES_PATH, label: 'Bài viết', icon: FileText },
  { href: ADMIN_BANNERS_PATH, label: 'Banner', icon: Image },
  { href: ADMIN_CATEGORIES_PATH, label: 'Danh mục', icon: FolderTree },
  { href: ADMIN_USERS_PATH, label: 'Người dùng', icon: Users },
  { href: ADMIN_MESSAGES_PATH, label: 'Messages', icon: Mail },
] as const;

type AdminSidebarProps = {
  user: AdminUser;
};

function NavLinkStatus() {
  const { pending } = useLinkStatus();

  return pending ? (
    <Loader2 className="ml-auto h-4 w-4 animate-spin" aria-hidden="true" />
  ) : null;
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/manage/auth/logout', { method: 'POST' });
      toast.success('Đã đăng xuất');
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
    } catch {
      toast.error('Không thể đăng xuất');
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:hidden">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            TechTalks Admin
          </p>
          <p className="truncate text-sm font-semibold">
            {user.displayName ?? user.username}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Mở menu quản trị"
          aria-expanded={isMobileOpen}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </header>

      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Đóng menu quản trị"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] shrink-0 flex-col border-r bg-background shadow-xl transition-transform md:static md:w-56 md:translate-x-0 md:bg-muted/20 md:shadow-none',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b px-4 py-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              TechTalks Admin
            </p>
            <p className="mt-1 truncate text-sm font-semibold">
              {user.displayName ?? user.username}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-2 -mt-2 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Đóng menu quản trị"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors md:py-2',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                <NavLinkStatus />
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-busy={isLoggingOut}
          >
            {isLoggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </Button>
        </div>
      </aside>
    </>
  );
}
