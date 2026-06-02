'use client';

import { FileText, FolderTree, LogOut, Mail, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ADMIN_ARTICLES_PATH,
  ADMIN_CATEGORIES_PATH,
  ADMIN_LOGIN_PATH,
  ADMIN_MESSAGES_PATH,
  ADMIN_USERS_PATH,
} from '@/lib/manage/constants';
import type { AdminUser } from '@/types/admin';

const nav = [
  { href: ADMIN_ARTICLES_PATH, label: 'Bài viết', icon: FileText },
  { href: ADMIN_CATEGORIES_PATH, label: 'Danh mục', icon: FolderTree },
  { href: ADMIN_USERS_PATH, label: 'Người dùng', icon: Users },
  { href: ADMIN_MESSAGES_PATH, label: 'Messages', icon: Mail },
] as const;

type AdminSidebarProps = {
  user: AdminUser;
};

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch('/api/manage/auth/logout', { method: 'POST' });
      toast.success('Đã đăng xuất');
      router.replace(ADMIN_LOGIN_PATH);
      router.refresh();
    } catch {
      toast.error('Không thể đăng xuất');
    }
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/20">
      <div className="border-b px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          TechTalks Admin
        </p>
        <p className="mt-1 truncate text-sm font-semibold">
          {user.displayName ?? user.username}
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
