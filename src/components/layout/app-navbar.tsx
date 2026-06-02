'use client';

import { LogOut, Menu, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { LanguageSwitcher } from '@/components/common/language-switcher';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { authService } from '@/services/auth-service';
import { useUiStore } from '@/stores/ui-store';

const ADMIN_LOGIN_PATH = '/manage/admin/login';

export function AppNavbar() {
  const t = useTranslations('Common');
  const tNav = useTranslations('Navigation');
  const { user } = useAuth();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  async function handleLogout() {
    try {
      await authService.logout();
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.success(t('logout'));
      window.location.href = ADMIN_LOGIN_PATH;
    } catch {
      toast.error(t('error'));
    }
  }

  const initials =
    user?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U';

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex-1" />
      <LanguageSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5 text-sm font-medium">
            {user?.name ?? tNav('profile')}
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            {tNav('profile')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            {t('logout')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
