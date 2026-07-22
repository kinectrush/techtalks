'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ManageLoadingButton } from '@/features/manage/components/manage-loading-button';
import { ADMIN_ARTICLES_PATH } from '@/lib/manage/constants';

const adminLoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type AdminLoginValues = z.infer<typeof adminLoginSchema>;

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  async function onSubmit(values: AdminLoginValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/manage/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Login failed');
      toast.success('Đăng nhập thành công');
      const callback = searchParams.get('callbackUrl') ?? ADMIN_ARTICLES_PATH;
      router.replace(callback);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Đăng nhập thất bại');
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoComplete="username"
          {...register('username')}
        />
        {errors.username ? (
          <p className="text-sm text-destructive">{errors.username.message}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password ? (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        ) : null}
      </div>
      <ManageLoadingButton
        type="submit"
        className="w-full"
        isLoading={isSubmitting}
        loadingLabel="Đang đăng nhập..."
      >
        Đăng nhập
      </ManageLoadingButton>
    </form>
  );
}
