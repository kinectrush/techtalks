'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { ImageUploadField } from '@/components/forms/image-upload-field';
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
  createBannerAction,
  updateBannerAction,
} from '@/features/manage/banners/actions';
import {
  adminBannerSchema,
  bannerToFormValues,
  formValuesToBannerInput,
  type AdminBannerFormValues,
} from '@/features/manage/banners/schema';
import {
  AD_BANNER_ASPECT_RATIO,
  AD_BANNER_PLACEMENT_LABELS,
  AD_BANNER_PLACEMENTS,
} from '@/lib/ad-banners/constants';
import type { AdBanner } from '@/types/ad-banner';

type BannerFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: AdBanner | null;
  onSaved: () => void | Promise<void>;
  onSavingChange?: (saving: boolean) => void;
};

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  onSaved,
  onSavingChange,
}: BannerFormDialogProps) {
  const isEdit = Boolean(banner);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminBannerFormValues>({
    resolver: zodResolver(adminBannerSchema),
    defaultValues: {
      placement: 'home_mobile',
      name: '',
      imageUrl: '',
      linkUrl: '',
      isActive: false,
    },
  });

  const placement = watch('placement');
  const imageUrl = watch('imageUrl');
  const aspectRatio = AD_BANNER_ASPECT_RATIO[placement];

  useEffect(() => {
    if (!open) return;
    if (banner) {
      reset(bannerToFormValues(banner));
    } else {
      reset({
        placement: 'home_mobile',
        name: '',
        imageUrl: '',
        linkUrl: '',
        isActive: false,
      });
    }
  }, [open, banner, reset]);

  useEffect(() => {
    onSavingChange?.(isSubmitting);
  }, [isSubmitting, onSavingChange]);

  async function onSubmit(values: AdminBannerFormValues) {
    try {
      const input = formValuesToBannerInput(values);
      if (isEdit && banner) {
        await updateBannerAction(banner.id, input);
        toast.success('Đã cập nhật banner');
      } else {
        await createBannerAction(input);
        toast.success('Đã tạo banner');
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <div className="relative">
          <ManagePendingOverlay show={isSubmitting} />
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Chỉnh sửa banner' : 'Tạo banner'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Vị trí hiển thị *</Label>
            <Select
              value={placement}
              onValueChange={(v) =>
                setValue('placement', v as AdminBannerFormValues['placement'])
              }
              disabled={isEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn vị trí" />
              </SelectTrigger>
              <SelectContent>
                {AD_BANNER_PLACEMENTS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {AD_BANNER_PLACEMENT_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Tỉ lệ ảnh: {aspectRatio === '9/16' ? '9:16 (dọc)' : '16:9 (ngang)'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-name">Tên gợi nhớ *</Label>
            <Input id="banner-name" {...register('name')} />
            {errors.name ? (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <ImageUploadField
            label={`Ảnh banner (${aspectRatio})`}
            value={imageUrl}
            onChange={(url) => setValue('imageUrl', url, { shouldValidate: true })}
            folder="banners"
            required
          />
          {errors.imageUrl ? (
            <p className="text-xs text-destructive">{errors.imageUrl.message}</p>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="banner-link">Link khi click (tùy chọn)</Label>
            <Input
              id="banner-link"
              type="url"
              placeholder="https://..."
              {...register('linkUrl')}
            />
            <p className="text-xs text-muted-foreground">
              {placement === 'review_detail_popup'
                ? 'Nếu có link: click banner hoặc nút X sẽ mở tab mới. Không có link thì nút X chỉ đóng popup.'
                : 'Nếu có link, click banner sẽ mở tab mới. Để trống thì không có hành động khi click.'}
            </p>
            {errors.linkUrl ? (
              <p className="text-xs text-destructive">{errors.linkUrl.message}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Chỉ một banner active cho mỗi vị trí
              </p>
            </div>
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
