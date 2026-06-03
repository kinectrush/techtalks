import { z } from 'zod';

import { AD_BANNER_PLACEMENTS } from '@/lib/ad-banners/constants';

export const adminBannerSchema = z.object({
  placement: z.enum(AD_BANNER_PLACEMENTS),
  name: z.string().min(2, 'Tên banner là bắt buộc'),
  imageUrl: z.string().url('Ảnh banner là bắt buộc'),
  linkUrl: z.string().url('URL không hợp lệ').optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type AdminBannerFormValues = z.infer<typeof adminBannerSchema>;

export function formValuesToBannerInput(
  values: AdminBannerFormValues,
): import('@/types/ad-banner').AdBannerInput {
  return {
    placement: values.placement,
    name: values.name,
    imageUrl: values.imageUrl,
    linkUrl: values.linkUrl || undefined,
    isActive: values.isActive,
  };
}

export function bannerToFormValues(
  banner: import('@/types/ad-banner').AdBanner,
): AdminBannerFormValues {
  return {
    placement: banner.placement,
    name: banner.name,
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl ?? '',
    isActive: banner.isActive,
  };
}
