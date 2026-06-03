'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { ManageLoadingButton } from '@/features/manage/components/manage-loading-button';
import { ManagePendingOverlay } from '@/features/manage/components/manage-pending-overlay';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  createCategoryAction,
  updateCategoryAction,
} from '@/features/manage/categories/actions';
import {
  adminCategorySchema,
  type AdminCategoryFormValues,
} from '@/features/manage/categories/schema';
import { slugify } from '@/lib/slug';
import type { AdminCategory } from '@/types/admin';

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategory | null;
  onSaved: () => void | Promise<void>;
  onSavingChange?: (saving: boolean) => void;
};

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSaved,
  onSavingChange,
}: CategoryFormDialogProps) {
  const isEdit = Boolean(category);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<AdminCategoryFormValues>({
    resolver: zodResolver(adminCategorySchema),
    defaultValues: {
      name: '',
      slug: '',
      sortOrder: 0,
      isActive: true,
      showInMenu: true,
    },
  });

  const name = watch('name');

  useEffect(() => {
    if (!slugTouched && name && !isEdit) {
      setValue('slug', slugify(name));
    }
  }, [name, slugTouched, setValue, isEdit]);

  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        showInMenu: category.showInMenu,
      });
      setSlugTouched(true);
    } else {
      reset({
        name: '',
        slug: '',
        sortOrder: 0,
        isActive: true,
        showInMenu: true,
      });
      setSlugTouched(false);
    }
  }, [open, category, reset]);

  useEffect(() => {
    onSavingChange?.(isSubmitting);
  }, [isSubmitting, onSavingChange]);

  async function onSubmit(values: AdminCategoryFormValues) {
    try {
      if (isEdit && category) {
        await updateCategoryAction(category.id, values);
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCategoryAction(values);
        toast.success('Đã tạo danh mục');
      }
      onOpenChange(false);
      await onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lưu thất bại');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-md">
        <div className="relative">
        <ManagePendingOverlay show={isSubmitting} />
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Tên *</Label>
            <Input id="cat-name" {...register('name')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-slug">Slug *</Label>
            <Input
              id="cat-slug"
              {...register('slug', { onChange: () => setSlugTouched(true) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Thứ tự menu</Label>
            <Input
              id="sortOrder"
              type="number"
              min={0}
              {...register('sortOrder', { valueAsNumber: true })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Hiển thị trên menu web</Label>
            <Switch
              checked={watch('showInMenu')}
              disabled={isSubmitting}
              onCheckedChange={(v) => setValue('showInMenu', v)}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Đang hoạt động</Label>
            <Switch
              checked={watch('isActive')}
              disabled={isSubmitting}
              onCheckedChange={(v) => setValue('isActive', v)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <ManageLoadingButton
              type="submit"
              isLoading={isSubmitting}
              loadingLabel="Đang lưu..."
            >
              Lưu
            </ManageLoadingButton>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
