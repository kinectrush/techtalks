'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type ParentOption = {
  id: string;
  name: string;
};

type CategoryFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: AdminCategory | null;
  parentOptions: ParentOption[];
  onSaved: () => void | Promise<void>;
  onSavingChange?: (saving: boolean) => void;
};

const NO_PARENT = '__none__';

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  parentOptions,
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
      parentId: null,
      showOnHomepage: false,
      homepageTagline: '',
      homepageAccentColor: '',
    },
  });

  const name = watch('name');
  const parentId = watch('parentId');
  const isSubCategory = Boolean(parentId);

  const selectableParents = useMemo(() => {
    if (!category) return parentOptions;
    return parentOptions.filter((p) => p.id !== category.id);
  }, [category, parentOptions]);

  useEffect(() => {
    if (!slugTouched && name && !isEdit) {
      setValue('slug', slugify(name));
    }
  }, [name, slugTouched, setValue, isEdit]);

  useEffect(() => {
    if (isSubCategory) {
      setValue('showInMenu', false);
    }
  }, [isSubCategory, setValue]);

  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        slug: category.slug,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        showInMenu: category.showInMenu,
        parentId: category.parentId,
        showOnHomepage: category.showOnHomepage,
        homepageTagline: category.homepageTagline ?? '',
        homepageAccentColor: category.homepageAccentColor ?? '',
      });
      setSlugTouched(true);
    } else {
      reset({
        name: '',
        slug: '',
        sortOrder: 0,
        isActive: true,
        showInMenu: true,
        parentId: null,
        showOnHomepage: false,
        homepageTagline: '',
        homepageAccentColor: '',
      });
      setSlugTouched(false);
    }
  }, [open, category, reset]);

  useEffect(() => {
    onSavingChange?.(isSubmitting);
  }, [isSubmitting, onSavingChange]);

  async function onSubmit(values: AdminCategoryFormValues) {
    const payload = {
      ...values,
      homepageTagline: values.homepageTagline?.trim() || null,
      homepageAccentColor: values.homepageAccentColor?.trim() || null,
    };

    try {
      if (isEdit && category) {
        await updateCategoryAction(category.id, payload);
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCategoryAction(payload);
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
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
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
              <Label>Danh mục cha</Label>
              <Select
                value={parentId ?? NO_PARENT}
                disabled={isSubmitting}
                onValueChange={(value) =>
                  setValue('parentId', value === NO_PARENT ? null : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Không (danh mục gốc)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PARENT}>Không (danh mục gốc)</SelectItem>
                  {selectableParents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Chọn danh mục cha để tạo sub-category (ví dụ World Cup 2026
                thuộc Thể thao).
              </p>
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

            {!isSubCategory ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label>Hiển thị trên menu web</Label>
                <Switch
                  checked={watch('showInMenu')}
                  disabled={isSubmitting}
                  onCheckedChange={(v) => setValue('showInMenu', v)}
                />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label>Nổi bật trang chủ</Label>
                    <p className="text-xs text-muted-foreground">
                      Hiển thị khối tin nổi bật trên trang chủ
                    </p>
                  </div>
                  <Switch
                    checked={watch('showOnHomepage')}
                    disabled={isSubmitting}
                    onCheckedChange={(v) => setValue('showOnHomepage', v)}
                  />
                </div>
                {watch('showOnHomepage') ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="homepageTagline">Tagline trang chủ</Label>
                      <Input
                        id="homepageTagline"
                        placeholder="Tin tức & phân tích World Cup 2026"
                        {...register('homepageTagline')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="homepageAccentColor">
                        Màu accent (hex)
                      </Label>
                      <Input
                        id="homepageAccentColor"
                        placeholder="#00A651"
                        {...register('homepageAccentColor')}
                      />
                    </div>
                  </>
                ) : null}
              </>
            )}

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
