'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  createUserAction,
  updateUserAction,
} from '@/features/manage/users/actions';
import {
  adminUserSchema,
  type AdminUserFormValues,
} from '@/features/manage/users/schema';
import type { AdminUser } from '@/types/admin';

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: AdminUser | null;
  onSaved: () => void;
};

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  onSaved,
}: UserFormDialogProps) {
  const isEdit = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AdminUserFormValues>({
    resolver: zodResolver(adminUserSchema),
    defaultValues: {
      username: '',
      password: '',
      displayName: '',
      email: '',
      isActive: true,
      role: 'editor',
    },
  });

  useEffect(() => {
    if (!open) return;
    if (user) {
      reset({
        username: user.username,
        password: '',
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        isActive: user.isActive,
        role: user.role,
      });
    } else {
      reset({
        username: '',
        password: '',
        displayName: '',
        email: '',
        isActive: true,
        role: 'editor',
      });
    }
  }, [open, user, reset]);

  async function onSubmit(values: AdminUserFormValues) {
    try {
      if (!isEdit && !values.password?.trim()) {
        toast.error('Mật khẩu là bắt buộc khi tạo user');
        return;
      }
      const input = {
        username: values.username,
        password: values.password,
        displayName: values.displayName,
        email: values.email || undefined,
        isActive: values.isActive,
        role: values.role,
      };
      if (isEdit && user) {
        await updateUserAction(user.id, input);
        toast.success('Đã cập nhật user');
      } else {
        await createUserAction(input);
        toast.success('Đã tạo user');
      }
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa user' : 'Tạo user quản trị'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" {...register('username')} />
            {errors.username ? (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              Mật khẩu {isEdit ? '(để trống nếu không đổi)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Tên hiển thị</Label>
            <Input id="displayName" {...register('displayName')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
          </div>
          <div className="space-y-2">
            <Label>Vai trò</Label>
            <Select
              value={watch('role')}
              onValueChange={(v) =>
                setValue('role', v as AdminUserFormValues['role'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Đang hoạt động</Label>
            <Switch
              checked={watch('isActive')}
              onCheckedChange={(v) => setValue('isActive', v)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
