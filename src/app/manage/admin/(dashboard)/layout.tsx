import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { AdminSidebar } from '@/features/manage/components/admin-sidebar';
import { getAdminSessionAction } from '@/features/manage/auth/actions';
import { ADMIN_LOGIN_PATH } from '@/lib/manage/constants';

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function AdminDashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getAdminSessionAction();
  if (!user) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden md:flex-row">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1 px-4 py-5 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
