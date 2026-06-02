import type { ReactNode } from 'react';

import { AppNavbar } from '@/components/layout/app-navbar';
import { AppSidebar } from '@/components/layout/app-sidebar';

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <AppNavbar />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
