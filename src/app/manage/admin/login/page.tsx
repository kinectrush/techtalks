import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AdminLoginForm } from '@/components/forms/admin-login-form';
import { getAdminSessionAction } from '@/features/manage/auth/actions';
import { ADMIN_ARTICLES_PATH } from '@/lib/manage/constants';

export default async function AdminLoginPage() {
  const session = await getAdminSessionAction();
  if (session) {
    redirect(ADMIN_ARTICLES_PATH);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-5 shadow-sm sm:p-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Quản trị TechTalks</h1>
          <p className="text-sm text-muted-foreground">
            Đăng nhập luồng quản lý nội bộ
          </p>
        </div>
        <Suspense
          fallback={<div className="h-40 animate-pulse rounded bg-muted" />}
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
